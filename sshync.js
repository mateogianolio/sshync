#!/usr/bin/env node

(function() {
  'use strict';

  require('terminal-colors');

  var fs = require('fs'),
      path = require('path'),
      ssh = require('./ssh.js'),
      host = process.argv[2],
      source = process.argv[3],
      destination = process.argv[4],
      dirList = [];

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

  var ignore = source + '/.sshyncignore',
      ignoreList = [];

  if (fs.existsSync(ignore)) {
    ignoreList = fs
      .readFileSync(ignore, 'utf8')
      .split('\n')
      .filter(function(str) { return str !== ''; })
      .map(function(str) { return destination + '/' + str; });
  }

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
    return function(event, file) {
      file = file !== undefined ? file : '';

      var src = source.indexOf(file) === -1 ? source + '/' + file : source,
          dest = source.indexOf(file) === -1 ? destination + '/' + file : destination,
          dir = dest.split('/');

      if(dir.length > 1)
        dir = dir.slice(0, -1);

      dir = dir.join('/');

      for (var i = 0; i < ignoreList.length; i++)
        if (ignoreList[i] === dest.substring(0, ignoreList[i].length))
          return;

      client.mkdir(dir, function(error, stdout, stderr) {
        if (error)
          throw error;

        if (dirList.indexOf(dir) === -1) {
          console.log('mkdir -p', dir.green);
          dirList.push(dir);
        }

        client.putFile(src, dest, function(error, stdout, stderr) {
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
      });
    };
  }

  function walker(error, results) {
    if (error)
      throw error;

    results.forEach(function(result) {
      var p = path.relative(source, result);
      watch(client)('add', p);
    });
  }

  var client = ssh(host_user, host_ip, function() {
    console.log(source.blue, '=>', host_user.bold + '@'.blue + host_ip + ':' + destination.green, '\n');

    if (ignoreList.length)
      console.log('ignore', ignore.red);

    if (fs.lstatSync(source).isDirectory())
      walk(source, walker);
    else
      watch(client)('add');

    fs.watch(source, watch(client));
  });
}());
