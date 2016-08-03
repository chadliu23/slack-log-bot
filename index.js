"use strict";

var express = require('express');
var app = express();

var Pool = require('pg-pool');
const url = require('url')

const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');

const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: true
};

var pool = new Pool(config);


var Botkit = require('botkit');
var controller = Botkit.slackbot({
});

// reply to a direct mention - @bot hello
controller.on('direct_mention',function(bot,message) {
    pool.query('insert into slack_log(channel_id, user_id, text) values($1, $2, $3)', 
            [message.channel, message.user, message.text],
            function(err, result) {
              if (err)
               { console.error(err); response.send("Error " + err); }
        });
});

// reply to a direct message
controller.on('direct_message',function(bot,message) {
    pool.query('insert into slack_log(channel_id, user_id, text) values($1, $2, $3)', 
            [message.channel, message.user, message.text],
            function(err, result) {
              if (err)
               { console.error(err); response.send("Error " + err); }
        });
});

controller.on('mention',function(bot,message) {
    pool.query('insert into slack_log(channel_id, user_id, text) values($1, $2, $3)', 
            [message.channel, message.user, message.text],
            function(err, result) {
              if (err)
               { console.error(err); response.send("Error " + err); }
        });
});

controller.on('ambient',function(bot,message) {
      pool.query('insert into slack_log(channel_id, user_id, text) values($1, $2, $3)', 
            [message.channel, message.user, message.text],
            function(err, result) {
              if (err)
               { console.error(err); response.send("Error " + err); }
        });
});


var bot = controller.spawn({
  token: process.env.TOKEN
}).startRTM();



app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.send('Hello world');
});

app.get('/channels', function(request, response) {
  bot.api.channels.list({'exclude_archived':'1'}, function(err, data){
    response.send(data);
  })
});

app.get('/users', function(request, response) {
  bot.api.users.list({'presence':'1'}, function(err, data){
    response.send(data);
  })
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});