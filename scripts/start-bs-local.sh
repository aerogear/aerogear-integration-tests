#!/usr/bin/env bash

set -e

if [ ! -e "./BrowserStackLocal" ]; then
  if [ "$(uname)" == "Darwin" ]; then
    wget "https://www.browserstack.com/browserstack-local/BrowserStackLocal-darwin-x64.zip"
    unzip BrowserStackLocal-darwin-x64.zip
  elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    wget "https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip"
    unzip BrowserStackLocal-linux-x64.zip
  fi
fi

./scripts/stop-bs-local.sh

./BrowserStackLocal $BROWSERSTACK_KEY &
echo $! >bs-local-pid.txt

sleep 5
