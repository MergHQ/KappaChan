'use strict';

module.exports = function () {
  const needle = require('needle');
  const twitchApi = require('./api/twitch');

  this.do = function (payload) {
    needle.get(twitchApi.GET_streamSearch(payload.parameter), (err, res) => {
      if (err) App.sendDebug(err);
      if (!res.body.streams) return;
      var streams = res.body.streams;
      if (streams.length === 0) {
        App.client.createMessage(payload.message.channel.id, '**Query returned 0 results.**');
        return;
      }
      var resStr = '\nRESULTS: \n\n';
      for (var i in streams) {
        resStr += `**${streams[i].channel.display_name}** playing **${streams[i].game}** for ${streams[i].viewers} viewer(s) \n\n`;
      }

      App.client.createMessage(payload.message.channel.id, resStr);
    });
  };
};