'use strict';

module.exports = function () {
  const needle = require('needle');
  this.messages = 0;
  this.commandExecs = 0;
  var self = this;

  this.start = function () {
    abalUpdate();
    setInterval(abalUpdate, 3600000);
    setInterval(uploadStats, 120000);

    App.DatabaseHandler.onReady(() => {
      App.DatabaseHandler.get('Stats', (res) => {
        res = res[0];
        if (res.messages)
          self.messages = res.messages;
        if (res.commandExecs)
       	  self.commandExecs = res.commandExecs;
      });
    });
  };

  this.send = function (payload) {
    this.convertMS = (ms) => {
      var s = Math.floor(ms / 1000);
      var m = Math.floor(s / 60);
      s %= 60;
      var h = Math.floor(m / 60);
      m %= 60;
      var d = Math.floor(h / 24);
      h %= 24;

      return `${d} days, ${h} hours, ${m} minutes and ${s} seconds.`;
    };

    App.client.createMessage(payload.message.channel.id,
      `\n\n**UPTIME:** ${this.convertMS(App.client.uptime)} \n **Messages Recieved:** ${self.messages} \n **Command Executions:** ${self.commandExecs}`);

  };

  function abalUpdate() {
    var options = {
      json: true,
      headers: {
        'Authorization': App.config.botStatToken,
        'content-type': 'application/json'
      }
    };

    needle.post('https://bots.discord.pw/api/bots/' + App.client.user.id + '/stats/', JSON.stringify({ server_count: App.client.guilds.size }), options, (err, res) => {
      if (err) { App.sendDebug(err); return; }
      App.sendDebug("STATS SENT:" + JSON.stringify(res.body));
    });
  }

  function uploadStats() {
    App.DatabaseHandler.post('Stats', { messages: this.messages, commandExecs: this.commandExecs });
  }
};