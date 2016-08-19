'use strict';

module.exports = function () {
  const WebSocket = require('ws');
  var ws = null;
  connect();
  var self = this;

  function connect() {
    ws = new WebSocket(App.config.logserverIP, {headers: {'token': App.config.token}});
    ws.on('error', (e) => {
      console.log(e);
    });

    ws.on('close', () => {
      // Attempt reconnects
      setTimeout(connect, 5000);
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
  }
};