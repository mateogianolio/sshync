#!/usr/bin/env node

(function() {
  'use strict';

  require('terminal-colors');

  var fs = require('fs'),
      path = require('path'),
      ssh = require('ssh-client'),
      host = process.argv[2],
      source = process.argv[3],
      destination = process.argv[4];

  function help() {
    var pkg = require('./package');
    console.log('# sshync', pkg.version);
    console.log('# by', pkg.author, '\n');
    console.log('sshync <user@ip[:port]> <source> <destination>');
    console.log('\tsource:\t\tlocal source folder.');
    console.log('\tdestination:\tremote destination folder.');
    process.exit();
  }

  if (!host || !source || !destination || host.indexOf('@') === -1)
    help();

  host = host.split('@');
  var host_ip = host.pop(),
      host_user = host.pop();

  function walk(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
      if (err)
        return done(err);
      var pending = list.length;
      if (!pending)
        return done(null, results);
      list.forEach(function(file) {
        file = path.resolve(dir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            walk(file, function(err, res) {
              results = results.concat(res);
              if (!--pending)
                done(null, results);
            });
          } else {
            results.push(file);
            if (!--pending)
              done(null, results);
          }
        });
      });
    });
  }

  function watch(client) {
    return (event, file) => {
      var src = source;
      var dest = destination;

      if (fs.lstatSync(source).isDirectory()) {
        src = src + '/' + file;
        dest = dest + '/' + file;

        client.mkdir(dest, (error, stdout, stderr) => {
          if (error)
            throw error;
        });
      }

      client.putFile(src, dest, (error, stdout, stderr) => {
        if (error)
          throw error;

        console.log(
          (event === 'add' ? '[+]'.green : '[/]'.yellow),
          src.blue,
          '=>',
          dest.green,
          '[' + fs.statSync(src).size + ' bytes]'
        );
      });
    };
  }

  function walker(error, results) {
    if (error)
      throw error;

    results.forEach((result) => {
      var p = path.relative(source, result);
      client.mkdir(destination, (error, stdout, stderr) => {
        if (error)
          throw error;

        watch(client)('add', p);
      });
    });
  }

  var client = ssh(host_user, host_ip, () => {
    console.log(host_user.bold + '@'.blue + host_ip);
    console.log('source:\t\t', source.blue);
    console.log('destination:\t', destination.green, '\n');

    if (fs.lstatSync(source).isDirectory())
      walk(source, walker);
    else
      watch(client)('add');

    fs.watch(source, watch(client));
  });
}());
