'use strict';

module.exports = function () {
  const needle = require('needle');
  const twitchAPI = require('./api/twitch');
  this.notificationList = {};
  var self = this;

  this.addStream = (payload) => {
    if (payload.parameter.length === 0) {
      App.client.callApi(App.Endpoints.createMessage(payload.message.channel_id), { data: { content: `Invalid parameter '${payload.parameter}'` } });
      return;
    }

    if (!this.notificationList[payload.parameter]) {
      var obj = {
        textChannels: [payload.message.channel_id],
        twitchChannel: payload.parameter,
        isLive: false
      };

      update(obj);
      this.notificationList[payload.parameter] = obj;
      App.client.callApi(App.Endpoints.createMessage(payload.message.channel_id), { data: { content: '👌' } });
    } else {
      var channel = this.notificationList[payload.parameter];

      // This channel is already in the notification list
      if (channel.textChannels.indexOf(payload.channel_id) !== -1) return;

      this.notificationList[payload.parameter].textChannels.push(payload.message.channel_id);
      App.client.callApi(App.Endpoints.createMessage(payload.message.channel_id), { data: { content: '👌' } });
    }
  };

  this.removeStream = (payload) => {
    if (!this.notificationList[payload.parameter]) {
      App.client.callApi(App.Endpoints.createMessage(payload.message.channel_id), { data: { content: `Can't find '${payload.parameter}'` } });
      return;
    }

    var obj = this.notificationList[payload.parameter];
    for (var i = 0; i < obj.textChannels.length; i++) {
      if (obj.textChannels[i] === payload.message.channel_id) {
        obj.textChannels.splice(i, 1);

        if (obj.textChannels.length === 0)
          delete this.notificationList[payload.parameter];
      }
    }

    App.client.callApi(App.Endpoints.createMessage(payload.message.channel_id), { data: { content: '👌' } });
  };

  this.postNotificationsForChannel = (payload) => {
    var res = '**Notifications from these channels:**\n\n';
    for (var i in self.notificationList) {
      var object = self.notificationList[i];
      if (object.textChannels.indexOf(payload.message.channel_id) != -1) {
        res += object.twitchChannel + '\n';
      }
    }
    App.client.callApi(App.Endpoints.createMessage(payload.message.channel_id), { data: { content: res } });
  };

  function update(obj) {
    var options = {
      headers: { 'Client-ID': App.config.twitchClientId }
    };

    needle.get(twitchAPI.GET_channel(obj.twitchChannel), options, (err, res) => {
      if (err) {
        App.Logger.log(err, 0);
        return;
      }
      if (res.body && res.body.streams) {
        if (res.body.streams.length > 0) {
          if (obj.isLive === false) {
            App.Logger.log(obj.twitchChannel + 'is live', 2)
            var payload = {
              title: `${res.body.streams[0].channel.display_name} went live!`,
              color: Math.floor(Math.random() * 0xffffff),
              url: res.body.streams[0].channel.url,
              thumbnail: {
                url: res.body.streams[0].channel.logo,
                width: 256,
                height: 256
              },
              fields: [
                {
                  name: 'Title',
                  value: res.body.streams[0].channel.status
                },
                {
                  name: 'Game',
                  value: res.body.streams[0].game
                }
              ]
            }
            for (var i = 0; i < obj.textChannels.length; i++) {
              var channel = obj.textChannels[i];
              App.client.callApi(App.Endpoints.createMessage(channel), { data: { content: '', embed: payload } });
              obj.isLive = true;
            }
          }
        } else if (res.body.streams.length === 0 && obj.isLive) {
          obj.isLive = false;
        }
      }
    });
  }

  function pushToDb() {
    App.DatabaseHandler.post('StreamReport', self.notificationList);
  }

  setInterval(() => {
    var offset = 500;
    for (let i in self.notificationList) {
      /* jshint ignore:start */
      setTimeout(() => {
        update(self.notificationList[i]);
      }, offset);
      /* jshint ignore:end */
      offset += 500;
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