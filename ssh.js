(function() {
  'use strict';

  var fs = require('fs'),
      self;

  function SSH(options, callback) {
    self = this;
    self.ready = false;
    self.callback = callback;
    self.options = options || {};
    self.options.host = options.host || 'localhost';
    self.options.port = options.port || 22;

    if (!options.username || !options.privateKey)
      return callback(new Error('Missing user or privateKey.'));

    self.options.username = options.username;
    self.options.privateKey = options.privateKey;

    self.client = require('ssh2').Client;
    self.connection = new self.client();
    self.connection
      .on('ready', function() {
        self.ready = true;
        callback();
      })
      .on('error', self.error)
      .on('end', self.disconnect)
      .on('close', self.close)
      .connect(self.options);
  }

  SSH.prototype = {
    error: function(error) {
      return self.callback(error);
    },

    exec: function(command, callback) {
      if (!self.ready) {
        setTimeout(function() {
          self.exec(command, callback);
        }, 50);
        return;
      }

      self.ready = false;
      self.connection.exec(command, function(error, stream) {
        self.ready = true;
        callback(error, stream);
      });
    },

    mkdir: function(directory, callback) {
      self.exec('mkdir -p ' + directory, callback);
    },

    disconnect: function() {
      self.ready = false;
    },

    close: function(hadError) {
      if (hadError)
        throw new Error('Socket closed with error.');

      self.ready = false;
    }
  };

  module.exports = function(options, callback) {
    return new SSH(options, callback);
  };
}());
