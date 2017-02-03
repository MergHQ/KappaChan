'use strict';

module.exports = function () {
  const needle = require('needle');
  const twitchApi = require('./api/twitch');

  this.do = (payload) => {
    var options = {
      headers: { 'Client-ID': App.config.twitchClientId }
    };
    needle.get(twitchApi.GET_channelSearch(payload.parameter), options, (err, res) => {
      if (err) App.Logger.log(err, 0);
      if (!res.body.channels) return;
      var channels = res.body.channels;
      if (channels.length === 0) {
        App.client.callApi(App.Endpoints.createMessage(payload.message.channel_id),  {data: {content: '**Query returned 0 results.**'}});
        return;
      }
      
      let embed = {
        title: 'Results for "' + payload.parameter + '"',
        fields: [],
        footer: {
          text: 'Fetched from the Twitch API'
        }
      };
      for (var i in channels) {
        embed.fields.push({
          name: channels[i].display_name,
          value: `**Followers**: ${channels[i].followers} \n**Channel views**: ${channels[i].views}`
        });
      }

      App.client.callApi(App.Endpoints.createMessage(payload.message.channel_id), {data: {embed}});
    });
  };
};