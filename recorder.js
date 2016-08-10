"use strict";



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

controller.on('rtm_open',function(bot) {
  console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function(bot, error){
    error = true;
});

controller.on('tick', function(emptyArray){});

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

