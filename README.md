# slack-log-bot

It is the bot recieved slack message

It can deploy easily on [Heroku](http://www.heroku.com) 

#Settings

1. Please set ENV `DATABASE_URL` for PostgreSQL and `TOKEN` for Bot

2. Table Schema:

```sql
Create table slack_log( user_id  text, channel_id text, text  text,  timestamp timestamp default now());
```

#Run

## For all,

```sh
node index.js
```

## For separate start up

Website
```sh
node web.js 
```

Recorder
```sh 
node recorder.js
```

# LICENSE
