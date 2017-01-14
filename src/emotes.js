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
        App.client.callApi(App.Endpoints.createMessage(payload.message.channel_id),
          { contentType: 'multipart/form-data; boundary=----------------Data', data: createFormData(fileObj) }, (err, res) => {
            console.log(res);
          });
        App.client.callApi(App.Endpoints.deleteMessage(payload.message.channel_id, payload.message.id));
      });
    } catch (e) {
      App.client.callApi(App.Endpoints.createMessage(payload.message.channel_id), { data: { content: '❌ Error occured: ' + e } });
    }
  };

  // Thanks to github.com/abalabahaha for some help with this.
  function createFormData(file) {
    let boundary = '----------------Data';
    let res = '\r\n--' + boundary;
    res += '\r\nContent-Disposition: form-data; name="file"';
    res += '; filename="' + file.name + '"\r\nContent-Type: application/octet-stream';
    return Buffer.concat([
      new Buffer(res + '\r\n\r\n'),
      file.file,
      new Buffer("\r\n--" + boundary + "--")
    ]);
  }
};

class MultipartData {
  constructor() {
    this.boundary = "----------------Eris";
    this.buf = new Buffer(0);
  }

  attach(field, data, name) {
    if (data === undefined) {
      return;
    }
    var str = "\r\n--" + this.boundary + "\r\nContent-Disposition: form-data; name=\"" + field + "\"";
    if (name) {
      str += "; filename=\"" + name + "\"\r\nContent-Type: application/octet-stream";
    }
    if (!(data instanceof Buffer)) {
      data = new Buffer(typeof data === "object" ? JSON.stringify(data) : data);
    }
    this.buf = Buffer.concat([
      this.buf,
      new Buffer(str + "\r\n\r\n"),
      data
    ]);
  }

  finish() {
    return this.buf = Buffer.concat([
      this.buf,
      new Buffer("\r\n--" + this.boundary + "--")
    ]);
  }
}
