#!/usr/bin/env node

(function() {
  'use strict';

  require('terminal-colors');

  var cp = require('child_process'),
      ssh = require('ssh-client'),
      host = process.argv[2];

  function help() {
    var pkg = require('./package');
    console.log('# sshpair (sshync', pkg.version + ')');
    console.log('# by', pkg.author, '\n');
    console.log('sshpair <user@host:port>');
    process.exit();
  }

  if(!host || host.indexOf('@') === -1)
    help();

  host = host.split('@');
  var host_ip = host.pop(),
      host_user = host.pop();

  cp.exec('echo "y\n" | ssh-keygen -q -N "" -f ~/.ssh/id_rsa', () => {});
  console.log('generated ssh key to', '~/.ssh/id_rsa.pub'.blue);

  var client = ssh(host_user, host_ip, () => {
    client.exec('mkdir -p ~/.ssh', (error, stdout, stderr) => {
      if (error)
        throw error;

      client.putFile('~/.ssh/id_rsa.pub', '~/.ssh/authorized_keys', (error, stdout, stderr) => {
        if (error)
          throw error;

        console.log('~/.ssh/id_rsa.pub'.blue, '=>', '~/.ssh/authorized_keys'.green);
        process.exit();
      });
    });
  });
}());
