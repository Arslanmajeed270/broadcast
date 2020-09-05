const redis = require('redis');

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const {encrypt, decrypt} = require('./util/crypto');



let RedisPort = process.env.REDIS_PORT || 6379;
let RedisHost = process.env.REDIS_HOST || '0.0.0.0';

const client = redis.createClient(RedisPort, RedisHost);


const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/', express.static(path.join(__dirname, 'public')));

app.post('/create-room', (req, res, next) => {
    
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

app.get('/get-rooms', async ( req, res, next ) => {

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


app.get('/get-room/', async ( req, res, next ) => {

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