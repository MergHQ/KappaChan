'use strict';

module.exports = function () {
  const MongoClient = require('mongodb');
  var self = this;
  var onReadyListeners = [];
  this.db = null;

  this.onReady = function (cb) {
    onReadyListeners.push(cb);
  };

  this.post = function (collection, data) {
    App.Logger.log('PUSHING TO DB (' + collection + ')', 2);
    this.db.collection(collection).count({}, (err, count) => {
      if (count == 0)
        this.db.collection(collection).insert(data);
      else
        this.db.collection(collection).replaceOne({}, data);
    });
  };

  this.get = function (collection, callback) {
    App.Logger.log('GETTING FROM DB (' + collection + ')', 2);
    let cursor = this.db.collection(collection).find();
    cursor.toArray((err, documents) => {
      if (err !== null) {
        App.Logger.log(err, 0);
        return;
      };

      callback(documents);
    });
  };


  this.close = function () {
    this.db.close();
  };

  MongoClient.connect(App.config.mongodbUrl, function (err, db) {
    App.Logger.log(err, 0);
    self.db = db;
    for (var i = 0; i < onReadyListeners.length; i++) onReadyListeners[i]();
  });
};