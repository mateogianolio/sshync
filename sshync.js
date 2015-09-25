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
      .filter(function(str) {
				return str !== '';
			})
			.map(function(str) {
				if (fs.lstatSync(str).isDirectory())
					return str + '/';
				return str;
			});
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

	function put(event, file, remoteFile) {
		client.putFile(file, remoteFile, function(error, stdout, stderr) {
			if (error) {
				console.log('[!]'.red + ' failed to put ' + file);
				console.log(stderr.red);
				return;
			}

			console.log(
				(event === 'add' ? '[+]'.green : '[/]'.yellow),
				file.blue,
				'=>',
				remoteFile.green,
				'[' + fs.statSync(file).size + ' bytes]'
			);
		});
	}

  function watch(client) {
    return function(event, file) {
      file = file !== undefined ? file : '';
			var remoteFile = destination + '/' + file,
					remotedir = remoteFile.split('/');

      if(remotedir.length > 1)
        remotedir = remotedir.slice(0, -1);

			for (var i = 0; i < ignoreList.length; i++)
				if (ignoreList[i] === file.substring(0, ignoreList[i].length))
					return;

      remotedir = remotedir.join('/');
			client.cd(remotedir, function(error) {
				if (error) {
					client.mkdir(remotedir, function(error) {
						put(file, remoteFile);
					});
					return;
				}

				put(event, file, remoteFile);
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
      watch(client)('add', source);

    fs.watch(source, watch(client));
  });
}());
