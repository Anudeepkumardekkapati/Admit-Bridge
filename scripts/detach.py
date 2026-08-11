#!/usr/bin/env python3
"""Launch a command detached in its own session so it survives the parent shell.

Usage:
    python3 scripts/detach.py [--cwd DIR] [--log FILE] <command...>

The command is started in a new session (setsid), with stdin from /dev/null and
stdout/stderr appended to --log. The launcher exits immediately.
"""
import ctypes
import os
import sys

args = sys.argv[1:]
cwd = None
log = None
i = 0
while i < len(args):
    if args[i] == "--cwd" and i + 1 < len(args):
        cwd = args[i + 1]
        i += 2
    elif args[i] == "--log" and i + 1 < len(args):
        log = args[i + 1]
        i += 2
    else:
        break
cmd = args[i:]

if not cmd:
    print(__doc__)
    sys.exit(1)

if cwd:
    os.chdir(cwd)

pid = os.fork()
if pid > 0:
    # Parent: exit immediately so the caller is not blocked.
    os._exit(0)

# Child: new session, redirected stdio, then exec.
if log:
    fd = os.open(log, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o644)
    os.dup2(fd, 1)
    os.dup2(fd, 2)
devnull = os.open(os.devnull, os.O_RDONLY)
os.dup2(devnull, 0)

libc = ctypes.CDLL(None)
libc.setsid()
os.execvp(cmd[0], cmd)
