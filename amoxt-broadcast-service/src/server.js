
const redis = require('redis');

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

let RedisPort = process.env.REDIS_PORT || 6379;
let RedisHost = process.env.REDIS_HOST || '0.0.0.0';

const client = redis.createClient(RedisPort, RedisHost);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
    client.setex('hello', 3600, 'this is value');
    const Hello = client.get('hello', (err, data) => {
        if (err) throw err;

        if (data !== null) {
            console.log("I am here");

            res.json({ message: data });
        }
    });


})



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