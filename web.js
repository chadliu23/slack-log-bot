"use strict";

var express = require('express');
var  mustacheExpress = require('mustache-express'); 
var Pool = require('pg-pool');
const url = require('url');
var Botkit = require('botkit');
var app = express();
  

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



var controller = Botkit.slackbot({
});

var bot = controller.spawn({
  token: process.env.TOKEN
}).startRTM();


app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/html');
app.use(express.static(__dirname + '/public'));

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.send('Hello world');
});

app.get('/channels', function(request, response) {
  bot.api.channels.list({'exclude_archived':'1'}, function(err, data){
    response.render('channelList', data);
  })
});

var users = {};

function getUsers(request, response, callback){
    bot.api.users.list({'presence':'1'}, function(err, data){
        if (!data.ok || err){
            console.log('error to get user list');
            return;
        }

        for (var i = 0; i < data.members.length; i++){
            users[data.members[i].id] = data.members[i].name;
        }
        callback(request, response, users);
    });
}

var getChannelMessages = function (request, response, users){

  pool.query('select user_id,  text, timestamp from  slack_log where channel_id =$1 order by timestamp desc', 
    [request.params.channel],
    function(err, result) {
      if (err)
       { console.error(err); response.send("Error " + err); }
      result['channelName'] = request.params.name;
      for (var i = 0; i < result.rows.length; i++){
        result.rows[i]['username'] = users[result.rows[i]['user_id']];
      }
      response.render('channel', result);
    });
}

app.get('/channel/:channel/name/:name', function(request, response) {
    if (Object.keys(users).length === 0){
        getUsers(request, response, getChannelMessages);
    }
    getChannelMessages(request, response, users);
  
});

app.get('/users', function(request, response) {
  bot.api.users.list({'presence':'1'}, function(err, data){
    response.send(data);
  })
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
