'use strict';

module.exports = function () {
  const needle = require('needle');
  const twitchApi = require('./api/twitch');

  this.do = function (payload) {
    needle.get(twitchApi.GET_channelSearch(payload.parameter), (err, res) => {
      if (err) App.Logger.log(err, 0);
      if (!res.body.channels) return;
      var channels = res.body.channels;
      if (channels.length === 0) {
        App.client.createMessage(payload.message.channel.id, '**Query returned 0 results.**');
        return;
      }
      var resStr = '\nRESULTS: \n\n';
      for (var i in channels) {
        resStr += `**${channels[i].display_name}** with **${channels[i].followers} followers** and **${channels[i].views} channel views** \n\n`;
      }

      App.client.createMessage(payload.message.channel.id, resStr);
    });
  };
};