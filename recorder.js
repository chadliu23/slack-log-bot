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
    // For retry
    error = true;
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
    bot.reply(message, 'I am here');
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


controller.on('file_share', function(bot, message) {
     pool.query('insert into slack_log(channel_id, user_id, text) values($1, $2, $3)', 
            [message.channel, message.user, message.text],
            function(err, result) {
              if (err)
               { console.error(err); response.send("Error " + err); }
        });
});


controller.on('tick', function(emptyArray){});
controller.on('file_shared', function(bot, message) {});
controller.on('user_typing', function(bot, message) {});
controller.on('presence_change', function(bot, message){
    // users' presence change
});
controller.on('reaction_added', function(bot, message){
// message: 
  // { type: 'reaction_added',
  // user: 'U0KUDTULX',
  // item: 
  //  { type: 'message',
  //    channel: 'C18SRR9S7',
  //    ts: '1470799341.000094' },
  // reaction: '+1',
  // item_user: 'U1NGUL9D2',
  // event_ts: '1470799377.451744' }

});

var bot = controller.spawn({
  token: process.env.TOKEN
}).startRTM();

