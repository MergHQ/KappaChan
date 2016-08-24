'use strict';

module.exports = function () {
  this.commands = {};

  var emote = {
    keyword: '&emote',
    desc: 'Replaces your message with a twitch or bttv emote, example: <&emote Kappa>',
    adminOnly: false,
    exec: (payload) => {
      var permissions = payload.message.member.permission.json;
      if (permissions.manageMessages === undefined || permissions.manageMessages === false) {
        App.client.createMessage(payload.message.channel.id,
          "I can't execute this commands, since I dont have permissions to manage messages!"
        );
      }
      App.EmoteRequest.do(payload);
    }
  };

  var help = {
    keyword: '&help',
    desc: 'Lists all commands',
    adminOnly: false,
    exec: (payload) => {
      var resStr = '\n HELP: \n';
      for (var i in App.Commands.commands) {
        var val = App.Commands.commands[i];
        if (val.adminOnly) continue;
        resStr += '\n' + val.keyword + ' - ' + val.desc + '\n';
      }

      App.client.createMessage(payload.message.channel.id,
        '```' + resStr + '```'
      );
    }
  };

  var watchstream = {
    keyword: '&streamnotify',
    desc: 'Sends notification when stream goes live to the channel the command is executed from. <&StreamNotify lirik>',
    adminOnly: false,
    exec: (payload) => {
      App.Streamreporter.addStream(payload);
    }
  };

  var unwatchstream = {
    keyword: '&unstreamnotify',
    desc: 'Removes notification from current channel. <&UnStreamNotify lirik>',
    adminOnly: false,
    exec: (payload) => {
      App.Streamreporter.removeStream(payload);
    }
  };

  var exec = {
    keyword: '&exec',
    desc: '',
    adminOnly: true,
    exec: (payload) => {
      if (App.config.adminUIDs.indexOf(payload.message.author.id) == -1) return;
      var res = '';
      try {
        /* jshint ignore:start */
        res = eval(payload.parameter.replace('\n', ''));
        /* jshint ignore:end */
        App.client.createMessage(payload.message.channel.id,
          '```' + res + '```'
        );
      } catch (e) {
        App.client.createMessage(payload.message.channel.id,
          '```' + e + '```'
        );
      }
    }
  };

  var bugreport = {
    keyword: '&bug',
    desc: 'Send a bug report.',
    adminOnly: false,
    exec: (payload) => {
      App.Logger.log('BUG REPORT (' + payload.message.author.username + ',' + payload.message.channel.name + ',' + payload.message.channel.guild.name + '):    ' + payload.parameter, 2);
    }
  };

  var streamsearch = {
    keyword: '&streamsearch',
    desc: 'Searches for streams (&Streamsearch dota 2)',
    adminOnly: false,
    exec: (payload) => {
      App.Streamsearch.do(payload);
    }
  };

  var stats = {
    keyword: '&stats',
    desc: 'Shows a bunch of cool stats of this bot',
    adminOnly: false,
    exec: (payload) => {
      App.Stats.get(payload);
    }
  };

  this.onMessage = (payload) => {
    if (payload.command in this.commands) {
      this.commands[payload.command].exec(payload);

      App.Stats.commandExecs++;

      App.Logger.log('COMMAND EXECUTION (' + payload.message.author.username + '):   *' + payload.message.content + '*', 2);
    }
  };

  this.commands[emote.keyword] = emote;
  this.commands[help.keyword] = help;
  this.commands[exec.keyword] = exec;
  this.commands[watchstream.keyword] = watchstream;
  this.commands[bugreport.keyword] = bugreport;
  this.commands[streamsearch.keyword] = streamsearch;
  this.commands[unwatchstream.keyword] = unwatchstream;
  this.commands[stats.keyword] = stats;
};