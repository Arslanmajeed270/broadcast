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
    console.log("checking room_name: ", room_name, " password: ", password);
    let encText = room_name+" "+password+" "+expiryTime;
    var signature = encrypt(encText)
    console.log("checking signature: ", signature);
    console.log("checking decrypted signature:",decrypt(signature));
    let room = {
        roomName: room_name,
        password: password,
        signature: signature
        };
        
    client.SADD('rooms',JSON.stringify(room));
    res.json({ room:room, message: `Successfully created new` });

});

app.get('/get-room', ( req, res, next ) => {
    client.SMEMBERS('rooms', (err, data) => {
        res.json({rooms: data});
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