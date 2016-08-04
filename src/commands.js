module.exports = function () {
  this.commands = {};

  var mute = {
    keyword: '👉KappaChanMute',
    desc: 'Mutes the bot.',
    adminOnly: false,
    exec: function (payload) {
      App.bMuted = true;
      App.client.createMessage(payload.message.channel.id,
        '⏸'
      );
    }
  };

  var unmute = {
    keyword: '👉KappaChanUnmute',
    desc: 'Unmutes the bot.',
    adminOnly: false,
    exec: function (payload) {
      App.bMuted = false;
      App.client.createMessage(payload.message.channel.id,
        '▶'
      );
    }
  };

  var emote = {
    keyword: '👉emote',
    desc: 'Replaces your message with a twitch or bttv emote, example: <!emote Kappa>',
    adminOnly: false,
    exec: function (payload) {
      var permissions = payload.message.member.permission.json;
      if (permissions.manageMessages == undefined || permissions.manageMessages == false) {
        App.client.createMessage(payload.message.channel.id,
          "I can't execute this commands, since I dont have permissions to manage messages!"
        );
      }
      App.EmoteRequest.do(payload);
    }
  };

  var help = {
    keyword: '👉help',
    desc: 'Lists all commands',
    adminOnly: false,
    exec: function (payload) {
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

  var exec = {
    keyword: '👉exec',
    desc: '',
    adminOnly: true,
    exec: function (payload) {
      if (App.config.adminUIDs.indexOf(payload.message.author.id) == -1) return;
      var res = '';
      try {
        res = eval(payload.parameter.replace('\n', ''));
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

  this.commands[mute.keyword] = mute;
  this.commands[unmute.keyword] = unmute;
  this.commands[emote.keyword] = emote;
  this.commands[help.keyword] = help;
  this.commands[exec.keyword] = exec;

  this.onMessage = function (payload) {
    if (payload.command in this.commands)
      this.commands[payload.command].exec(payload);
  };
};