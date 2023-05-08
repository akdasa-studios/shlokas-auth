#!/bin/sh
cd /app/shlokas-auth
if [ -z "$1" ]
  then
    npm run start
  else
    npm run $1
fi
