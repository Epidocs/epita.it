#!/bin/sh
set -e

# If the first argument is empty,
# Run bash
if (
	[ -z "$1" ]
); then
	set -- bash

# If the first argument is a known command or shell,
# Run with the provided arguments as is
elif (
	# Known commands
	[ "$1" = 'npm' ] ||
	[ "$1" = 'npx' ] ||
	[ "$1" = 'pnpm' ] ||
	[ "$1" = 'node' ] ||
	# Known shells
	[ "$1" = 'sh' ] ||
	[ "$1" = 'bash' ]
); then
	:

# If the first argument is a flag,
# Run pnpm with the provided arguments
elif (
	[ "${1#-}" != "$1" ]
); then
	set -- pnpm "$@"
fi

exec docker-entrypoint.sh "$@"
