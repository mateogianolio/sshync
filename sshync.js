#!/usr/bin/env node

(function() {
  'use strict';
  require('terminal-colors');

  var fs = require('fs'),
      exec = require('child_process').exec,
      path = require('path'),
      info = process.argv[2],
      source = process.argv[3],
      destination = process.argv[4],
      cache = {},
      ssh;

  if (!info || !source || !destination || info.indexOf('@') === -1) {
    var pkg = require('./package');
    console.log('# sshync', pkg.version);
    console.log('sshync <user@host[:port]>', '<source>'.blue, '<destination>'.green);
    console.log('\t' + 'source'.blue + ':\t\tlocal source file or folder.');
    console.log('\t' + 'destination'.green + ':\tremote destination file or folder.');
    process.exit();
  }

  info = info.split('@');
  var host = info.pop(),
      user = info.pop(),
      port;

  if (host.indexOf(':') !== -1) {
    host = host.split(':');
    port = host.pop();
    host = host.pop();
  }

  var ignore = source + '/.sshyncignore',
      ignores = [];

  if (fs.existsSync(ignore)) {
    ignores = fs
      .readFileSync(ignore, 'utf8')
      .split('\n')
      .filter(function(str) {
        return str !== '';
      })
      .map(function(str) {
        str = source + '/' + str;
        if (fs.lstatSync(str).isDirectory())
          return str + '/';
        return str;
      });
  }

  var privateKeyPath = process.platforn === 'win32' ?
    process.env.USERPROFILE :
    process.env.HOME;

  privateKeyPath += '/.ssh/sshync';

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

  function put(event, file, remoteFile, callback) {
    file = file.replace(/ /g, '\\ ');
    remoteFile = remoteFile.replace(/ /g, '\\ ');

    var content = fs.readFileSync(file, 'utf8');
    if (typeof cache[file] === 'number' || cache[file] === content)
      return;

    cache[file] = (cache[file] || []).length;

    var command = [ 'scp', '-i', privateKeyPath ];
    if (port) {
      command.push('-P');
      command.push(port);
    }
    command.push(file);
    command.push(user + '@' + host + ':' + remoteFile);

    exec(command.join(' '), function(file, error) {
      if (error) {
        console.log('[' + '!'.red + ']', command.join(' ').bold, 'failed.');
        if (callback)
          callback(error);
        cache[file] = '';

        return;
      }

      var size = content.length - cache[file];
      console.log(
        file.blue,
        '=>',
        remoteFile.green,
        (content.length / 1024).toFixed(1) + 'kB',
        size !== 0 ? ('(' + (size > 0 ? '+'.green : '-'.red) + Math.abs(size) + ')') : ''
      );

      cache[file] = content;

      if (callback)
        callback();
    }.bind(null, file));
  }

  function watch(event, file) {
    file = file !== undefined ? file : '';

    var remoteFile = destination + '/' + file,
        remotedir = remoteFile.split('/');
    remotedir.pop();

    if (file !== source)
      file = source + '/' + file;

    for (var i = 0; i < ignores.length; i++)
      if (ignores[i] === file.substring(0, ignores[i].length))
        return;

    if (!fs.lstatSync(source).isDirectory()) {
      remoteFile = destination;
      remotedir.pop();
    }

    remotedir = remotedir.join('/');
    ssh.mkdir(remotedir, function(error) {
      if (error) {
        console.log('[' + '!'.red + ']', 'mkdir -p'.bold, remotedir.bold, 'failed');
        return;
      }

      put(event, file, remoteFile);
    });
  }

  function authenticate(callback) {
    require('child_process')
      .exec(
        'echo -e "y\n" | ssh-keygen -q -N "" -f ~/.ssh/sshync',
        function() {
          console.log(
            'transferring public key to',
            '~/.ssh/authorized_keys'.green +
            ', please enter ' + 'remote'.bold + ' password:'
          );

          put('add', privateKeyPath + '.pub', '~/.ssh/authorized_keys', callback);
        }
      );
  }

  function connect() {
    var options = {
      host: host,
      port: port,
      username: user,
      privateKey: fs.readFileSync(privateKeyPath)
    };

    ssh = require('./ssh.js')(options, function(error) {
      if (error) {
        if (error.level === 'client-authentication') {
          if (fs.existsSync(privateKeyPath)) {
            console.log('[' + '!'.red + ']', 'authentication failed, removing generated keys...');
            console.log('[' + '!'.red + ']', 'try again!');
            fs.unlinkSync(privateKeyPath);
            fs.unlinkSync(privateKeyPath + '.pub');
          }

          return;
        }

        throw error;
      }

      console.log('connected to', user + '@' + host);
      console.log('syncing', source.blue, 'to', destination.green);

      if (ignores.length)
        console.log('ignoring',
          ignores
            .map(function(path) {
              return path.red;
            })
            .join(', ')
        );

      var isDirectory = fs.lstatSync(source).isDirectory();
      if (isDirectory)
        walk(source, function(error, results) {
          if (error)
            throw error;

          results.forEach(function(result) {
            watch('add', path.relative(source, result));
          });
        });
      else
        watch('add', source);

      fs.watch(source, watch);
    });
  }

  if (!fs.existsSync(privateKeyPath))
    authenticate(connect);
  else
    connect();
}());
