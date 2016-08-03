"use strict";

var express = require('express');
var app = express();

var Botkit = require('botkit');
var controller = Botkit.slackbot({
});

// reply to a direct mention - @bot hello
controller.on('direct_mention',function(bot,message) {
  // reply to _message_ by using the _bot_ object
  console.log('direct_mention: ');
  console.log(message);
  bot.reply(message,'I heard you mention me!');
});

// reply to a direct message
controller.on('direct_message',function(bot,message) {
  // reply to _message_ by using the _bot_ object
  console.log('direct_message: ');
  console.log(message);
  bot.reply(message,'You are talking directly to me');
});

controller.on('mention',function(bot,message) {
  // reply to _message_ by using the _bot_ object
  console.log('mention: ');
  console.log(message);
  bot.reply(message,'Are you mention me');
});

controller.on('ambient',function(bot,message) {
  // reply to _message_ by using the _bot_ object
  console.log('channel id: ' + message.channel);
  console.log('text: ' + message.text);
  console.log('user id: ' + message.user);

  bot.reply(message,'You are not talking to me');
});


var bot = controller.spawn({
  token: process.env.TOKEN
}).startRTM();



app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.send('Hello world');
});

app.get('/channels', function(request, response) {
  bot.api.channels.list({'exclude_archived', '1'}, function(err, data){
    response.send(data);
  })
});

app.get('users', function(request, response) {
  bot.api.users.list({'presence', '1'}, function(err, data){
    response.send(data);
  })
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});