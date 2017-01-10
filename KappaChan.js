'use strict';

GLOBAL.App = {};

const Masamune = require('Masamune');
const fs = require('fs');
const EmoteRequest = require('./src/emotes');
const Commands = require('./src/commands');
const Stats = require('./src/stats');
const Streamreporter = require('./src/streamreporter');
const DatabaseHandler = require('./src/databasehandler');
const Streamsearch = require('./src/streamsearch');
const Channelsearch = require('./src/channelsearch');
const Logger = require('./src/logger');

App.config = JSON.parse(fs.readFileSync('config.cf', 'utf8'));
App.Logger = new Logger();
App.Endpoints = Masamune.Endpoints;
App.client = new Masamune.Client(App.config.token);
App.EmoteRequest = new EmoteRequest();
App.Commands = new Commands();
App.Streamsearch = new Streamsearch();
App.Channelsearch = new Channelsearch();
App.DatabaseHandler = new DatabaseHandler();
App.Streamreporter = new Streamreporter();
App.Stats = new Stats();
App.bMuted = false;
App.StartedAt = Date.now();

const http = require('http');


process.on('uncaughtException', err => {
    App.Logger.log(err.message + '\n' + err.stack, 0);

    // Leave some time for the ws to finnish sending.
    setTimeout(process.exit.bind(1), 3000);
});


App.client.on('ws_ready', () => {
  App.Logger.log('READY', 2);
});

App.client.on('ws_error', (e) => {
  App.Logger.log(e, 0);
});

App.client.on('_', d => {
  (d.op === 11) && App.Logger.log(d, 2);
});

App.client.on('GUILD_CREATE', g => {
  App.Guilds.push(g);
});

App.client.on('READY', m => {
  App.Guilds = m.guilds;
  App.Stats.update();
});

App.client.on('MESSAGE_CREATE', m => {
  var split = m.content.split(' ');
  var command = split.shift();

  var payload = {
    command: command,
    parameter: split.join(' '),
    message: m
  };
  
  if (App.Stats)
    App.Stats.messages++;

  App.Commands.onMessage(payload);
});
