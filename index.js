"use strict";

var express = require('express');
var app = express();

var simple_storeage_provider = require('./simple_storeage.js')();

var Botkit = require('botkit');
var controller = Botkit.slackbot({
    storage:  simple_storeage_provider
});

controller.on('message_received', function(bot, message) {
    console.log('message: ' );
    console.log(message);
    bot.reply(message, 'I heard... something!');
});

// reply to a direct mention - @bot hello
controller.on('direct_mention',function(bot,message) {
  // reply to _message_ by using the _bot_ object
  bot.reply(message,'I heard you mention me!');
});

// reply to a direct message
controller.on('direct_message',function(bot,message) {
  // reply to _message_ by using the _bot_ object
  bot.reply(message,'You are talking directly to me');
});

controller.on('mention',function(bot,message) {
  // reply to _message_ by using the _bot_ object
  bot.reply(message,'Are you mention me');
});

controller.on('ambient',function(bot,message) {
  // reply to _message_ by using the _bot_ object
  bot.reply(message,'You are not talking to me');
});


var bot = controller.spawn({
  token: process.env.TOKEN
}).startRTM();



app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.send('Hello world');
});

app.get('/slacklog/channels', function(request, response){
    simple_storeage_provider.channels.all(function (err, data){
        response.send(data);
    });
});

app.get('/slacklog/users', function(request, response){
    simple_storeage_provider.users.all(function (err, data){
        response.send(data);
    });
});

app.get('/slacklog/teams', function(request, response){
    simple_storeage_provider.teams.all(function (err, data){
        response.send(data);
    });
});
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});