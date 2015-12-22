# sshync

Auto-sync files or directories over SSH using [**rsync**](https://github.com/mattijs/node-rsync) and [fs.**watch**()](https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener).

Exclude files or directories by creating `.sshyncignore` in your source root (see repo root for example).

Default **rsync** options:
* `a` – archive mode
* `v` – verbose
* `u` – update
* `z` – compress

```bash
$ npm install sshync -g

# Optional: Copy local SSH key to destination
# OSX: $ brew install ssh-copy-id
$ ssh-copy-id <user@ip[:port]>
```

```bash
# initialize sshync
$ sshync <source> <user@ip[:port]:destination>
          source:       local source file/folder.
          destination:  remote destination file/folder.
```
