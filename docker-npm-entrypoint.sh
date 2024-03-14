#!/bin/sh

set -e

# Prefix the command with 'npm' if:
# - The first argument starts with a '-' (e.g. a flag like '--help'); or
# - The first argument is neither 'npm', 'npx', nor 'node'.
if [ "${1#-}" != "$1" ] || ([ "$1" != 'npm' ] && [ "$1" != 'npx' ] && [ "$1" != 'node' ]); then
	set -- npm "$@"
fi

# Use the original node entrypoint to run the command
exec docker-entrypoint.sh "$@"
