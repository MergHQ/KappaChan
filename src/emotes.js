module.exports = function () {
  var bttvAPI = require('./api/bttv.js');
  var twitchAPI = require('./api/twitch.js');
  var needle = require('needle');
  var emotes = {};

  function load() {
    needle.get(twitchAPI.GET_emoteList, function (err, res) {
      if (err) return;
      var array = JSON.parse(res.body).emoticons;
      for (var i = 0; i < array.length; i++) {
        emotes[array[i].regex] = array[i].images[0].url;
      }
    });

    needle.get(bttvAPI.GET_emoteList, function (err, res) {
      if (err) return;
      var array = res.body.emotes;
      for (var i = 0; i < array.length; i++) {
        emotes[array[i].code] = bttvAPI.GET_emote(array[i].id);
      }
    });
  }

  load();

  setInterval(load, 3600000);

  this.do = function (payload) {
    try {
      var code = payload.parameter;
      if (!emotes[code]) return;
      needle.get(emotes[code], function (err, res) {
        if (err) return;
        var fileObj = {
          file: new Buffer(res.body),
          name: 'default.png'
        };
        App.client.createMessage(payload.message.channel.id, '', fileObj);
        App.client.deleteMessage(payload.message.channel.id, payload.message.id)
      });
    } catch (e) {
      App.client.createMessage(payload.message.channel.id, '❌ Error occured: ' + e);
    }
  };
};
