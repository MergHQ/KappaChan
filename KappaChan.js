'use strict';

GLOBAL.App = {};

const Eris = require('eris');
const fs = require('fs');
const EmoteRequest = require('./src/emotes');
const Commands = require('./src/commands');
const Stats = require('./src/stats');
const Streamreporter = require('./src/streamreporter');
const DatabaseHandler = require('./src/databasehandler');
const Streamsearch = require('./src/streamsearch');
const Logger = require('./src/logger');

App.config = JSON.parse(fs.readFileSync('config.cf', 'utf8'));
App.Logger = new Logger();
App.client = new Eris(App.config.token);
App.EmoteRequest = new EmoteRequest();
App.Commands = new Commands();
App.Streamsearch = new Streamsearch();
App.DatabaseHandler = new DatabaseHandler();
App.Streamreporter = new Streamreporter();
App.Stats = new Stats();

App.bMuted = false;

process.on('uncaughtException', err => {
    App.Logger.log(err.message + '\n' + err.stack, 0);

    // Leave some time for the ws to finnish sending.
    setTimeout(process.exit.bind(1), 3000);
});


App.client.on('ready', () => {
  App.Logger.log('READY', 2);
});

App.client.on('guildCreate', g => {
  var res = '```Hello ' + g.name + '! Thanks for using me. \n\n'
    + 'Use &help for a list of commands.```';

  App.client.createMessage(g.defaultChannel.id, res);
});

App.client.on('messageCreate', m => {
  if (!m.channel.guild) return;
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

App.client.connect();

