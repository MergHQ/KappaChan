'use strict';

module.exports = function () {
  const WebSocket = require('ws');
  const utils = require('util');
  var ws = null;
  connect();
  var self = this;
  this.log = (mess, level) => {
    console.log(mess);
  };

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

        if(payload instanceof Object) {
          try {
            payload = JSON.stringify(payload);
          } catch(e) {
            console.log(e);
          }
        }

        var obj = {
          type: logLevel,
          payload: payload
        };

        ws.send(JSON.stringify(obj));
      };
    });
  }
};