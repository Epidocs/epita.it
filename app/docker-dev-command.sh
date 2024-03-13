#!/bin/sh

set -e

npm clean-install
npm cache clean --force

exec npm run dev -- --host --port 80
