const redis = require('redis');
const {encrypt, decrypt} = require('../util/crypto');
const authMiddleware = require('../middleware/auth');

const express = require('express');

const router = express.Router();

const RedisPort = process.env.REDIS_PORT || 6379;
const RedisHost = process.env.REDIS_HOST || '0.0.0.0';

const client = redis.createClient(RedisPort, RedisHost);

const secretKey = process.env.ROOM_SECRET_KEY;
const serverAddress = process.env.SERVER_ADDRESS;
const defaultPassword = process.env.DEFAULT_PASSWORD;


router.post('/create-room', authMiddleware, (req, res, next) => {

    let room_name = req.body.roomName;
    let password = req.body.password;
    let expiryTime = req.body.expTime || process.env.ROOM_EXPIRY_DURATION;
    let encText = room_name+"|"+defaultPassword+"|"+expiryTime+"|"+secretKey;
    var signature = encrypt(encText);

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
                let link = `${serverAddress+room_name}?password=${defaultPassword}&token=${signature}`;
                res.json({ link: link, room:room_name, message: `Successfully created new room!` });
            });
        }
        else{
            res.json({ message: `Room already exits!` });
        }
    });
    

});

router.get('/get-rooms', authMiddleware,  async ( req, res, next ) => {

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


router.get('/get-room/', authMiddleware, async ( req, res, next ) => {

    let roomName = req.query.roomName;

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


router.delete('/delete-room/', authMiddleware, async ( req, res, next ) => {

    let roomName = req.query.roomName;

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


router.get('/', (req, res, next) => {
    let password = 'hello';
    let roomName = 'sample';
    let encText = roomName+" "+password+" "+process.env.ROOM_EXPIRY_DURATION;

    var hw = encrypt(encText)
    res.json({signature: hw});
});


module.exports = router;
