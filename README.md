# sshync

Auto-sync files or directories over SSH using [fs.**watch**()](https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener).

Comes with a nifty tool ```sshpair``` that generates a public SSH key with

```bash
echo "y\n" | ssh-keygen -q -N "" -f ~/.ssh/id_rsa
```

and writes the result to ```~/.ssh/authorized_keys``` on the remote host. This prevents the password prompt from showing up every time we sync.

Ignore paths by adding them, one per line, to a file named  ```.sshyncignore``` in the provided ```source``` folder.

### install

```bash
$ npm install sshync -g
```

### usage

```bash
# generate a public SSH key (so we don't have to retype password)
# write to user@ip:~/.ssh/authorized_keys

$ sshpair <user@ip[:port]>

# initialize file auto-sync
$ sshync <user@ip[:port]> <source> <destination>
          source:       local source folder.
          destination:  remote destination folder.
```

### example

```bash
$ git clone https://github.com/mateogianolio/sshync.git
$ cd sshync
$ sshpair root@xxx.xxx.82.203
generated ssh key to ~/.ssh/id_rsa.pub
root@xxx.xxx.82.203's password:
root@xxx.xxx.82.203's password:
~/.ssh/id_rsa.pub => ~/.ssh/authorized_keys

$ echo ".git\nnode_modules" > .sshyncignore
$ sshync root@xxx.xxx.82.203 . /root/sshync
. => root@xxx.xxx.82.203:/root/sshync

ignore ./.sshyncignore
mkdir -p /root/sshync
[+] ./README.md => /root/sshync/README.md [399 bytes]
[+] ./package.json => /root/sshync/package.json [520 bytes]
[+] ./sshync.js => /root/sshync/sshync.js [3304 bytes]
[+] ./LICENSE.md => /root/sshync/LICENSE.md [1084 bytes]
# ... edit package.json ...
[/] ./package.json => /root/sshync/package.json [524 bytes]
```
