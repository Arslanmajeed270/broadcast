require('dotenv').config();

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');


const app = express();

 app.use(bodyParser.urlencoded({ extended: true }));

app.use( (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
    
    console.log("I am here");
    res.json({message: 'no body wana see our together'});

})



//Catching error and setting variable in response of the request
app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    console.log(message, data);
    res.status(status).json({ message: message,  error: true, data: data });
  });


let Port = process.env.PORT || 3000;

app.listen(Port);
console.log(">>>>> Running:",Port," <<<<<");