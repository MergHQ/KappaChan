'use strict';

module.exports = function () {
  const needle = require('needle');
  const twitchApi = require('./api/twitch');

  this.do = (payload) => {
    var options = {
      headers: { 'Client-ID': App.config.twitchClientId }
    };
    needle.get(twitchApi.GET_streamSearch(payload.parameter), options, (err, res) => {
      if (err) App.Logger.log(err, 0);
      if (!res.body.streams) return;
      var streams = res.body.streams;
      if (streams.length === 0) {
        App.client.callApi(App.Endpoints.createMessage(payload.message.channel_id), { data: { content: '**Query returned 0 results.**' } });
        return;
      }
      let embed = {
        title: 'Results for "' + payload.parameter + '"',
        fields: [],
        footer: {
          text: 'Fetched from the Twitch API'
        }
      }
      for (var i in streams) {
        embed.fields.push({
          name: streams[i].channel.display_name,
          value: `playing **${streams[i].game}** for ${streams[i].viewers} viewer(s)`
        });
      }

      App.client.callApi(App.Endpoints.createMessage(payload.message.channel_id), { data: { embed } });
    });
  };
};