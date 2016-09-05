"use strict";



var Pool = require('pg-pool');
const url = require('url')

const params = url.parse(process.env.DATABASE_URL);
const localUrl = process.env.url;
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
  console.log('** The RTM api just connected at ' + new Date());
});

controller.on('rtm_close', function(bot, error){
    console.log("** The RTM api just disconnected at " + new Date());
    process.exit(1);
});


function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}



// reply to a direct mention - @bot hello
controller.on('direct_mention',function(bot,message) {
  if (message.text[0]=='/'){
    var res = message.text.split(" ");
    var keyword = res[0].substring(1);
    switch (keyword){
      case 'auto_reply':
        if (res.length < 2){
          bot.reply(message, message.text + ' miss 1 parameter. Ex. /auto_reply hello world');
          break;
        }
        var toReply = message.text.substring(message.text.indexOf(' '));
        toReply = toReply.replace(/<[^(\/|a)].*?>/g, function (matched){
          var src = matched.match(/<([^(\/|a)].*?)>/)[1];
          return src;
        })
        pool.query('delete from slack_auto_reply where channel_id = $1', 
          [message.channel], function(err, result){
            if (err)
               { console.error(err); response.send("Error " + err); }
            pool.query('insert into slack_auto_reply(channel_id, user_id, text) values($1, $2, $3)', 
                [message.channel, message.user, toReply],
                function(err, result) {
                  if (err)
                   { console.error(err); response.send("Error " + err); }
                  bot.reply(message, 'I remembered `'+ toReply +'`. (To remove `/remove_auto_reply`)');
            });
        } );
        break;
      case 'remove_auto_reply':
        pool.query('delete from slack_auto_reply where channel_id =$1', 
            [message.channel],
            function(err, result) {
              if (err)
               { console.error(err); response.send("Error " + err); }
              bot.reply(message, 'I removed auto reply in this channel');
        });
        break;
      default:
        bot.reply(message, message.text + ' is unsupport command. I only support `/auto_reply`, `/remove_auto_reply`');
        break;
    }
  } else {
    bot.reply(message, 'I am slack logger. This channel has been watched. You can check out at http://'+localUrl+'/channel/' + message.channel 
        + '\nFor more information please connect at chadliu23');
  }
    pool.query('insert into slack_log(channel_id, user_id, text) values($1, $2, $3)', 
            [message.channel, message.user, message.text],
            function(err, result) {
              if (err)
               { console.error(err); response.send("Error " + err); }
        });
});

// reply to a direct message
controller.on('direct_message',function(bot,message) {
    var uptime = formatUptime(process.uptime());

    bot.reply(message, 'I am slack logger. I have been running for ' + uptime + ' on ' + localUrl + '.\nThis direct message is not in channel list. You still can check out at http://'+localUrl+'/channel/' + message.channel );
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
  pool.query('select text from  slack_auto_reply where channel_id =$1', 
    [message.channel],
    function(err, result) {
      if (err)
       { console.error(err); response.send("Error " + err); }
      if (result.rows.length < 1){
        return;
      }
      bot.reply(message, result.rows[0].text);
   });
      pool.query('insert into slack_log(channel_id, user_id, text) values($1, $2, $3)', 
            [message.channel, message.user, message.text],
            function(err, result) {
              if (err)
               { console.error(err); response.send("Error " + err); }
        });
});


controller.on('file_share', function(bot, message) {
     pool.query('insert into slack_log(channel_id, user_id, text) values($1, $2, $3)', 
            [message.channel, message.user, message.text + ' <' + message.file.url_private + '>' ],
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
controller.on('reaction_removed', function(bot, message){});
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
