const Eris = require('eris');
const fs = require('fs');
const EmoteRequest = require('./src/emotes');
const Commands = require('./src/commands');
const Statposter = require('./src/statposter');
//const Streamreporter = require('./src/streamreporter');
//const DatabaseHandler = require('./src/databasehandler');

GLOBAL.App = {};

App.config = JSON.parse(fs.readFileSync('config.cf', 'utf8'));
App.client = new Eris(App.config.token);
App.EmoteRequest = new EmoteRequest();
App.Commands = new Commands();
//App.Streamreporter = new Streamreporter();
App.DatabaseHandler = new DatabaseHandler();

App.bMuted = false;

process.on('uncaughtException', err => {
  console.log(err);
  console.log(err.stack);
});

App.client.on('ready', () => {
  console.log('READY');

  var sp = new Statposter();
  sp.start();
});

App.client.on('guildCreate', g => {
  var res = '```Hello '+ g.name +'! Thanks for using me. \n\n'
  + 'Use 👉help for a list of commands.```';

  App.client.createMessage(g.defaultChannel.id, res);
});

App.client.on('messageCreate', m => {
  if(!m.channel.guild) return;
  var split = m.content.split(' ');
  var command = split.shift();
  
  var payload = {
    command: command,
    parameter: split.join(' '),
    message: m
  };

  App.Commands.onMessage(payload);
});

App.client.connect();

