'use strict';

module.exports = function () {
  const needle = require('needle');
  const twitchAPI = require('./api/twitch');
  this.notificationList = {};
  var self = this;

  this.addStream = function (payload) {
    if (payload.parameter.length == 0) {
      App.client.createMessage(payload.message.channel.id, `Invalid parameter '${payload.parameter}'`);
      return;
    };

    if (!this.notificationList[payload.parameter]) {
      var obj = {
        textChannels: [payload.message.channel.id],
        twichChannel: payload.parameter,
        isLive: false
      };

      update(obj);
      this.notificationList[payload.parameter] = obj;
      App.client.createMessage(payload.message.channel.id, '👌');
    } else {
      var channel = this.notificationList[payload.parameter];

      // This channel is already in the notification list
      if (channel.textChannels.indexOf(payload.channel_id) !== -1) return;

      this.notificationList[payload.parameter].textChannels.push(payload.message.channel.id);
      App.client.createMessage(payload.message.channel.id, '👌');
    }
  };

  this.removeStream = function (payload) {
    if (!this.notificationList[payload.parameter]) {
      App.client.createMessage(payload.message.channel.id, `Can't find '${payload.parameter}'`);
      return;
    }

    var obj = this.notificationList[payload.parameter];
    for (var i = 0; i < obj.textChannels.length; i++) {
      if (obj.textChannels[i] === payload.message.channel.id) {
        obj.textChannels.splice(i, 1);

        if (obj.textChannels.length === 0)
          delete this.notificationList[payload.parameter];
      }
    }

    App.client.createMessage(payload.message.channel.id, '👌');
  };

  function update(obj) {
    needle.get(twitchAPI.GET_channel(obj.twichChannel), (err, res) => {
      if (err) App.sendDebug(err);
      if (res.body.streams.length > 0) {
        if (obj.isLive === false) {
          for (var i = 0; i < obj.textChannels.length; i++) {
            var channel = obj.textChannels[i];
            App.client.createMessage(channel,
              '\n **' + obj.twichChannel + ' is now live playing ' + res.body.streams[0].game + '!**  \n \n https://twitch.tv/' + obj.twichChannel
            );
            obj.isLive = true;
          }
        }
      } else if (res.body.streams.length === 0 && obj.isLive) {
        obj.isLive = false;
      }
    });
  }

  function pushToDb() {
    App.DatabaseHandler.post('StreamReport', self.notificationList);
  }

  setInterval(() => {
    for(let i in self.notificationList) {
      update(self.notificationList[i]);
    }
  }, 60000);

  App.DatabaseHandler.onReady(() => {
    App.DatabaseHandler.get('StreamReport', doc => {
      for (var key in doc[0]) {
        if (key === "_id") continue;
        self.notificationList[key] = doc[0][key];
      }
    });
    setInterval(pushToDb, 60000);
  });
};