#!/usr/bin/env node

(function () {
  'use strict';

  var fs = require('fs'),
      rsync = require('rsync'),
      path = require('path'),
      chalk = require('chalk'),
      args = process.argv.slice(2),
      edit = false;

  if (args.length !== 2)
    return console.log(
      'sshync <' + chalk.blue('source') + '> ' +
      '<user@ip[:port]:' + chalk.green('destination') + '>\n' +
      '\t' + chalk.blue('source') + ':\t\tlocal source file/folder\n' +
      '\t' + chalk.green('destination') + ':\tremote destination file/folder'
    );

  var source = path.resolve(args[0]),
      exclude = path.resolve(source, '.sshyncignore'),
      cmd = new rsync()
        .shell('ssh')
        .flags('avuz')
        .source(source)
        .destination(args[1]),
      handle;

  if (fs.existsSync(exclude))
    cmd.set('exclude-from', exclude)

  // abort rsync on process exit
  function quit() {
    if (handle)
      handle.kill();
    process.exit();
  }

  process
    .on('SIGINT', quit)
    .on('SIGTERM', quit)
    .on('exit', quit);

  function contains(str, substr) {
    return str.indexOf(substr) !== -1;
  }

  function print(line) {
    console.log(
      contains(line, 'sent') &&
      contains(line, 'received') &&
      contains(line, 'bytes/sec') ?
        chalk.blue(line) :
        (edit ? chalk.yellow('✎ ') : chalk.green('✓ ')) + line
    );
  }

  function sync() {
    handle = cmd.execute(
      function (error, code, cmd) {
        return error ? console.log(chalk.red(error)) : 0;
      },
      function (data) {
        return data
          .toString()
          .split('\n')
          .filter(
            function (line) {
              return line && contains(line, '/');
            }
          )
          .forEach(print);
      }
    );
  }

  sync();
  fs.watch(
    source,
    { recursive: true },
    function () {
      edit = true;
      sync();
    }
  );
}());
