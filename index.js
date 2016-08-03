"use strict";

var express = require('express');
var app = express();

var simple_storeage_provider = require('./simple_storeage.js')();

var Botkit = require('botkit');
var controller = Botkit.slackbot({
    storage:  simple_storeage_provider
});
var bot = controller.spawn({
  token: process.env.TOKEN
}).startRTM();

controller.on('message_received', function(bot, message) {
    console.log(message);
});

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.send('Hello world');
});

app.get('/slacklog', function(request, response){
    simple_storeage_provider.channels.all(function (err, data){
        response.send(data);
    });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});