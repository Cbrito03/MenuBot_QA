const horario = require('./controllers/validar_horario.js');
const moment_timezone = require('moment-timezone');
const config = require('./controllers/config.js');
const whatsApp = require('./routes/whatsApp');
const facebook = require('./routes/facebook');
const localStorage = require('localStorage');
const twitter = require('./routes/twitter');
const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const moment = require('moment');
const axios = require('axios');
const async = require('async');
const http = require('http');
const util = require('util');
const fs = require('fs');

const execSync = require('child_process').execSync;

var shell = require('shelljs');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static('img'));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use(whatsApp);
app.use(facebook);
app.use(twitter);


http.createServer(app).listen(config.puerto, () => {
  console.log('Server started at http://localhost:' + config.puerto);
});