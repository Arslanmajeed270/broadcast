const redis = require('redis');

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const {encrypt, decrypt} = require('./util/crypto');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { v4: uuidv4 } = require('uuid');

const authMiddleware = require('./middleware/auth');



const RedisPort = process.env.REDIS_PORT || 6379;
const RedisHost = process.env.REDIS_HOST || '0.0.0.0';
const SECRET_KEY = process.env.SECRET_KEY || 'amoxtsolutions123456789abcdefghi';

const client = redis.createClient(RedisPort, RedisHost);


const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.post('/register', async (req, res, next) => {

    let email = req.body.email;
    let password =  await bcrypt.hash(req.body.password, 12);
    let id = uuidv4();
    let userData = id+' '+password;


    client.hexists('users001', email, (err, oldData) => {

        if(err){
            console.log('err: ', err);
            if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
        }

        if(oldData < 1){

            client.hset('users001', email, userData, (err2, data) => {
                if(err2){
                    if (!err2.statusCode) {
                        err2.statusCode = 500;
                      }
                      next(err2);
                }
                let result = {
                    user: {
                        id: id,
                        email: email
                    }
                }
                res.json(result);
            });
        }
        else{
            res.json({ message: `User already exits!` });
        }
    });
});


app.post('/login', (req, res, next) => {

    let email = req.body.email;
    let password =  req.body.password;

        client.hget('users001', email, async (err2, data) => {
        if(err2){
            if (!err2.statusCode) {
                err2.statusCode = 500;
                }
                next(err2);
            }
            if(!data){
                res.json({message: "User not found!"});
    
            }
            let userPassword = data.split(' ')[1];

            //comparing encrypted password
            const isEqual =  await bcrypt.compare(password, userPassword);
            if(!isEqual){
                res.json({message: 'Invalid credentials!'});
            }

                //generating token
            const token = jwt.sign({email: email},PRIVATE_KEY);

            res.json({token: token});
    });

});



app.post('/create-room', authMiddleware, (req, res, next) => {
    
    let room_name = req.body.roomName;
    let password = req.body.password;
    let expiryTime = req.body.expTime || process.env.ROOM_EXPIRY_DURATION;
    let encText = room_name+" "+password+" "+expiryTime;
    var signature = encrypt(encText)
    let room = password+'|'+signature;
    client.hexists('rooms001', room_name, (err, oldData) => {

        if(err){
            console.log('err: ', err);
            if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
        }

        if(oldData < 1){

            client.hset('rooms001', room_name, room, (err2, data) => {
                if(err2){
                    if (!err2.statusCode) {
                        err2.statusCode = 500;
                      }
                      next(err2);
                }
                res.json({ room:room_name, message: `Successfully created new room!` });
            });
        }
        else{
            res.json({ message: `Room already exits!` });
        }
    });
    

});

app.get('/get-rooms', authMiddleware,  async ( req, res, next ) => {

    client.hgetall('rooms001', (err, data) => {
        if(err){
            console.log('erros: , err');
            if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
        } 
        res.json({rooms: data});
    });
  
});


app.get('/get-room/', authMiddleware, async ( req, res, next ) => {

    let roomName = req.query.roomName;
    console.log('checking roomName: ', roomName, typeof roomName);

    client.hget('rooms001', roomName, (err, data) => {
        if(err){
            console.log('erros: , err');
            if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
        } 

        if(!data){
            res.json({message: "Room not found!"});

        }
        const result = {
            roomName: roomName,
            password: data.split('|')[0],
            signature: data.split('|')[1]
        }
        res.json(result);
    });
  
});


app.delete('/delete-room/', authMiddleware, async ( req, res, next ) => {

    let roomName = req.query.roomName;
    console.log('checking roomName: ', roomName, typeof roomName);

    client.hdel('rooms001', roomName, (err, data) => {
        if(err){
            console.log('erros: , err');
            if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
        } 
        if(data > 0){
            res.json({message: `Successfully deleted ${roomName}!`});
        }
        res.json({message: `${roomName} not found!`});
        
    });
  
});



app.get('/', (req, res, next) => {
    let password = 'hello';
    let roomName = 'sample';
    let encText = roomName+" "+password+" "+process.env.ROOM_EXPIRY_DURATION;
    console.log("checking encText: ", encText);
    console.log("checking process.env.SECRET_KEY: ", process.env.SECRET_KEY);

    var hw = encrypt(encText)
    console.log("checking encText after encryption: ", hw)
    console.log("checking decrypted password:",decrypt(hw));
    res.json({signature: hw});
});


//Catching error and setting variable in response of the request
app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    console.log(message, data);
    res.status(status).json({ message: message, error: true, data: data });
});


let Port = process.env.PORT || 3000;


app.listen(Port);
console.log(">>>>> Running:", Port, " <<<<<");