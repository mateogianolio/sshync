# sshync

Auto-sync files or directories over SSH using [fs.**watch**()](https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener). Generates SSH private/public keys with ```ssh-keygen``` and transfers the public one to ```~/.ssh/authorized_keys``` on remote host, to avoid having to re-type password all the time.

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
transferring public key to ~/.ssh/authorized_keys, please enter remote password:
root@xxx.xxx.82.203's password:
/Users/username/.ssh/sshync.pub => ~/.ssh/authorized_keys 0.4kB (+406)
connected to root@xxx.xxx.82.203
syncing sshync.js to /root/sshync/sshync.js
sshync.js => /root/sshync/sshync.js 6.2kB (+6327)

# ... edit sshync.js ...
sshync.js => /root/sshync/sshync.js 6.2kB (+1)
```

Second time run output (no password needed):

```bash
$ sshync root@xxx.xxx.82.203 sshync.js /root/sshync/sshync.js
connected to root@xxx.xxx.82.203
syncing sshync.js to /root/sshync/sshync.js
sshync.js => /root/sshync/sshync.js 6.2kB (+6327)

# ... edit sshync.js ...
sshync.js => /root/sshync/sshync.js 6.2kB (+1)
```
