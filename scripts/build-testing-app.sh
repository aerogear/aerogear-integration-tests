#!/bin/bash

set -e

cp fixtures/index.js testing-app/

cd testing-app

npm install --save \
  @aerogear/security \
  @aerogear/app \
  @aerogear/auth \
  @aerogear/voyager-client \
  webpack \
  webpack-cli

cordova plugin add @aerogear/cordova-plugin-aerogear-security
cordova plugin add cordova-plugin-inappbrowser

npx webpack

cordova build android
