# sshync

Auto-sync files or directories over SSH.

```bash
$ npm install sshync -g

# generate a public SSH key (so we don't have to retype password)
# write to user@ip:~/.ssh/authorized_keys

$ sshpair <user@ip[:port]>

# initialize file auto-sync
$ sshync <user@ip[:port]> <source> <destination>
          source:       local source folder.
          destination:  remote destination folder.
```
