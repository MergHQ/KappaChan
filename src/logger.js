'use strict';

module.exports = function () {
  const WebSocket = require('ws');
  var ws = new WebSocket(App.config.logserverIP, {headers: {'token': App.config.token}});
  var self = this;

  ws.on('error', (e) => {
    console.log(e);
  });

  ws.on('open', () => {
    self.log = (payload, logLevel) => {
      var obj = {
        type: logLevel,
        payload: payload
      };

      ws.send(JSON.stringify(obj));
    };
  });
};