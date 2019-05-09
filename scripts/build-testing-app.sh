#!/bin/bash

cordova create testing-app
        
cp fixtures/config.xml testing-app/
cp fixtures/index.html testing-app/www/
cp fixtures/webpack.config.js testing-app/
cp fixtures/index.js testing-app/

cd testing-app

npm install --save \
  @aerogear/security \
  @aerogear/app \
  @aerogear/auth \
  webpack \
  webpack-cli
cat package.json

cordova plugin add @aerogear/cordova-plugin-aerogear-security
cordova plugin add cordova-plugin-inappbrowser

npx webpack

cordova platform add android
cordova build android
