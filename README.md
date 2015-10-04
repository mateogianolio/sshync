# sshync

Auto-sync files or directories over SSH using [fs.**watch**()](https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener).

```would you like to use key-based authentication? [yes/no]```
* **yes** – if they do not already exist, SSH private/public keys will be generated with ```ssh-keygen``` to ```~/.ssh/sshync``` and the public one moved to ```~/.ssh/authorized_keys``` on remote host (assumes you have access). Files will be transferred asynchronously.
* **no** – ~~files will be transferred synchronously and you will have to enter password every time a file changes.~~
files will now be transferred asynchronously and you will now only have to enter password once when sshync is run.

Utilizes simple caching to avoid unnecessary file transfers and to continuously show size difference.

Ignore paths by adding them, one per line, to a file named  ```.sshyncignore``` in the root ```source``` folder.

### Install

```bash
$ npm install sshync -g
```

### Usage

```bash
# initialize sshync
# (you might have to type password to transfer public key to remote host)
$ sshync <user@ip[:port]> <source> <destination>
          source:       local source folder.
          destination:  remote destination folder.
```

### Example

First time run output:

```bash
$ sshync root@xxx.xxx.82.203 sshync.js /root/sshync/sshync.js
would you like to use key-based authentication? [yes/no] yes
transferring public key to ~/.ssh/authorized_keys
root@xxx.xxx.82.203's password:
/Users/xxx/.ssh/sshync.pub => ~/.ssh/authorized_keys 0.4kB (+406)
connected to root@xxx.xxx.82.203
syncing sshync.js to /root/sshync/sshync.js
sshync.js => /root/sshync/sshync.js 6.2kB (+6327)

# ... edit sshync.js ...
sshync.js => /root/sshync/sshync.js 6.2kB (+1)
```

Second time run output (no password needed):

```bash
$ sshync root@xxx.xxx.82.203 sshync.js /root/sshync/sshync.js
would you like to use key-based authentication? [yes/no] yes
connected to root@xxx.xxx.82.203
syncing sshync.js to /root/sshync/sshync.js
sshync.js => /root/sshync/sshync.js 6.2kB (+6327)

# ... edit sshync.js ...
sshync.js => /root/sshync/sshync.js 6.2kB (+1)
```

If you use this project and would like to see it grow, please consider supporting
a fellow hacker by donating to ```1JiNbQYiozZZU8J39nbrY9YHSuzkFpivNU```.
