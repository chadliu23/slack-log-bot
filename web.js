"use strict";

var express = require('express');
var  mustacheExpress = require('mustache-express'); 
var Pool = require('pg-pool');
const url = require('url');
var request = require('request');
var app = express();
  

const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');

const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: true,
  token: process.env.TOKEN
};

var pool = new Pool(config);

var slackUsers = {};
var usersData = {};
var slackChannels = {};
var channelsData = {};

function updateLists () {
  request.get({
      url: 'https://slack.com/api/users.list?token=' + config.token
  }, function (error, response, body) {
    var res = JSON.parse(body);
    usersData = res;
    console.log('updated:', new Date());
    res.members.map(function (member) {
      slackUsers[member.id] = member.name;
    });
  });

  request.get({
      url: 'https://slack.com/api/channels.list?token=' + config.token
  }, function (error, response, body) {
    var res = JSON.parse(body);
    channelsData = res;
    res.channels.map(function (channel) {
      slackChannels[channel.id] = channel.name;
    });
  });

  setTimeout(function () {
    updateLists()
  }, 10 * 60 * 1000);
}

updateLists();

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/html');
app.use(express.static(__dirname + '/public'));

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.send('Hello world');
});

app.get('/channels', function(request, response) {
  pool.query('select distinct channel_id from slack_log', [],
    function(err, result){
      var channelList = {};
      channelList.channels = [];
      for (var i = 0; i < result.rows.length; i++){
        var tempChannel = {};
        tempChannel.id = result.rows[i]['channel_id'];
        tempChannel.name = slackChannels[tempChannel.id];
        channelList.channels.push(tempChannel);
      }

      response.render('channelList', channelList);
  });
});



var getChannelMessages = function (request, response, users){

  pool.query('select user_id,  text, timestamp from  slack_log where channel_id =$1 order by timestamp desc', 
    [request.params.channel],
    function(err, result) {
      if (err)
       { console.error(err); response.send("Error " + err); }
      result['channelName'] = request.params.name;
      //  "[-a-zA-Z0-9@:%_\+\.~#?&//=]{2,256}.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?"
      var url = "[-a-zA-Z0-9@:%_\\+\.~#?&//=]{2,256}\\.[a-z]{2,4}\\b(\\/[-a-zA-Z0-9@:%_\\+.~#?&//=]*)?";
      var re = new RegExp("<(" + url + ")\\|" + url + ">","gi");
        

      for (var i = 0; i < result.rows.length; i++){
        result.rows[i]['username'] = users[result.rows[i]['user_id']];

        var message = result.rows[i]['text'];
        /*
         * Channel ID -> Channel Name
         * Member ID -> Member Name
         * decoed URL and remove <, >
         */
        message = message.replace(/<#C\w{8}>/g, function (matched) {
          var channel_id = matched.match(/#(C\w{8})/)[1];
          return '#' + slackChannels[channel_id];
        }).replace(/<@U\w{8}>/g, function (matched) {
          var member_id = matched.match(/@(U\w{8})/)[1];
          return '@' + slackUsers[member_id];
        }).replace(re, function (matched, link) {
          return link = link.replace(/&amp;/g, '&');
        }).replace(/<http.*?>/g, function (matched){
          var src = matched.match(/<(http.*?)>/)[1];
          return "<a href='" + src + "'>" +src+  "</a>";
        }).replace(/<[^(\/|a)].*?>/g, function (matched){
          var src = matched.match(/<([^(\/|a)].*?>)/)[1];
          return src;
        }).replace(/&lt;/g,'<').replace(/&gt;/g, '>')
        ;

        result.rows[i]['text'] = message;
      }
      response.render('channel', result);
    });
}

app.get('/channel/:channel/name/:name', function(request, response) {
    getChannelMessages(request, response, slackUsers);
  
});

app.get('/users', function(request, response) {
  response.send(usersData);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
