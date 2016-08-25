# slack-log-bot

It is the bot recieved slack message and archive messages

It can deploy easily on [Heroku](http://www.heroku.com) 

#Settings

0. Install supervisor

```sh
npm install supervisor -g
```

NOTE: Due to some disconnection problem, will it call `rtm_close` the system will exit. Here uses supervisor to keep it online.

1. Please set ENV `DATABASE_URL` for PostgreSQL, `TOKEN` for Bot, `url` for website host and port

2. Table Schema:

```sql
Create table slack_log( id SERIAL PRIMARY KEY, user_id  text, channel_id text, text  text,  timestamp timestamp default now());
```

#Run

## For all,

```sh
DATABASE_URL=postgres://xxxxxxx:xxxxxxx@127.0.0.1:5432/xxxxxxx TOKEN=ooxxxooxxxooxxx PORT=8000 url=www.helloworld.com:8000 supervisor index.js

```

## For separate start up

Website
```sh
DATABASE_URL=postgres://xxxxxxx:xxxxxxx@127.0.0.1:5432/xxxxxxx TOKEN=ooxxxooxxxooxxx PORT=8000  supervisor web.js

```

Recorder
```sh 
DATABASE_URL=postgres://xxxxxxx:xxxxxxx@127.0.0.1:5432/xxxxxxx TOKEN=ooxxxooxxxooxxxurl=www.helloworld.com:8000 supervisor recorder.js

```

# LICENCE

MIT Licence
