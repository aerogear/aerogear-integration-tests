#!/usr/bin/env bash

set -e

if [ ! -d "./testing-app" ]; then
  cordova create testing-app

  cp fixtures/config.xml testing-app/
  cp fixtures/index.html testing-app/www/
  cp fixtures/webpack.config.js testing-app/

  cd testing-app

  cordova platform add android

  cd ..
fi

cp fixtures/index.js testing-app/

cd testing-app

npm install --save \
  @aerogear/security \
  @aerogear/app \
  @aerogear/auth \
  @aerogear/voyager-client \
  webpack \
  webpack-cli

cordova plugin add @aerogear/cordova-plugin-aerogear-metrics
cordova plugin add @aerogear/cordova-plugin-aerogear-security
cordova plugin add cordova-plugin-inappbrowser

npx webpack

cordova build android

curl \
  -u "$BROWSERSTACK_USER:$BROWSERSTACK_KEY" \
  -X POST https://api-cloud.browserstack.com/app-automate/upload \
  -F "file=@$PWD/platforms/android/app/build/outputs/apk/debug/app-debug.apk" \
  >bs-app-url.txt
