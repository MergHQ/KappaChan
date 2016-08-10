module.exports = function () {
  const needle = require('needle');
  const twitchAPI = require('./api/twitch');
  this.notificationList = {};
  var self = this;

  this.addStream = function (payload) {
    if (payload.parameter.length == 0) return;

    if (!this.notificationList[payload.parameter]) {
      var obj = {
        textChannels: [payload.message.channel.id],
        twichChannel: payload.parameter,
        isLive: false
      };

      update(obj);
      setInterval(() => { update(obj) }, 60000);
      this.notificationList[payload.parameter] = obj;
    } else {
      var channel = this.notificationList[payload.parameter];

      // This channel is already in the notification list
      if (channel.textChannels.indexOf(payload.channel_id) !== -1) return;

      this.notificationList[payload.parameter].textChannels.push(payload.message.channel.id);
    }
  };

  this.removeStream = function (payload) {
    if (!this.notificationList[payload.parameter]) return;

    var obj = this.notificationList[payload.parameter];
    for (var i = 0; i < obj.textChannels.length; i++) {
      if (obj.textChannels[i] === payload.message.channel.id) {
        obj.textChannels.splice(i, 1);

        if (obj.textChannels.length === 0)
          delete this.notificationList[payload.parameter];
      }
    }
  };

  function update(obj) {
    needle.get(twitchAPI.GET_channel(obj.twichChannel), (err, res) => {
      if (err) App.sendDebug(err);
      if (res.body.streams.length > 0) {
        if (!obj.isLive) {
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
    App.sendDebug('PUSHING TO DB ' + JSON.stringify(self.notificationList));
    App.DatabaseHandler.post('StreamReport', self.notificationList);
  }

  App.DatabaseHandler.onReady(() => {
    App.DatabaseHandler.get('StreamReport', doc => {
      for (var key in doc[0]) {
        if (key === "_id") continue;
        self.notificationList[key] = doc[0][key];

        update(self.notificationList[key]);
        setInterval(() => { update(self.notificationList[key]) }, 60000);
      }
    });
    setInterval(pushToDb, 60000);
  });
};