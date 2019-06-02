#!/usr/bin/env bash

set -e

if [ ! -e "./BrowserStackLocal" ]; then
  if [ "$(uname)" == "Darwin" ]; then
    wget "https://www.browserstack.com/browserstack-local/BrowserStackLocal-darwin-x64.zip"
    unzip BrowserStackLocal-darwin-x64.zip
  else
    wget "https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip"
    unzip BrowserStackLocal-linux-x64.zip
  fi
fi

if [ -e "./bs-local-pid.txt" ]; then
  kill $(cat bs-local-pid.txt) || true
fi

./BrowserStackLocal $BROWSERSTACK_KEY &
echo $! >bs-local-pid.txt

sleep 5
