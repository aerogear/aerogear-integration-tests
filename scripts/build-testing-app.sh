#!/usr/bin/env bash

set -e

if [ ! -d "./testing-app" ]; then
  cordova create testing-app
  cp fixtures/config.xml testing-app/
fi

cp fixtures/index.html testing-app/www/
cp fixtures/webpack.config.js testing-app/
cp fixtures/index.js testing-app/

if [ "$MOBILE_PLATFORM" != "ios" ]; then
  cp fixtures/google-services.json testing-app/
fi

cd testing-app

npm install --save \
  @aerogear/security \
  @aerogear/app \
  @aerogear/auth \
  @aerogear/voyager-client \
  @aerogear/push \
  webpack \
  webpack-cli

cordova plugin add @aerogear/cordova-plugin-aerogear-metrics
cordova plugin add @aerogear/cordova-plugin-aerogear-security
cordova plugin add @aerogear/cordova-plugin-aerogear-sync
cordova plugin add cordova-plugin-inappbrowser

npx webpack

if [ "$MOBILE_PLATFORM" = "ios" ]; then
  cordova platform add ios || true
  cordova build ios \
    --buildFlag="-UseModernBuildSystem=0" \
    --device \
    --codeSignIdentity="iPhone Developer" \
    --developmentTeam="$DEVELOPMENT_TEAM" \
    --packageType="development" \
    --buildFlag="-allowProvisioningUpdates"

  curl \
    -u "$BROWSERSTACK_USER:$BROWSERSTACK_KEY" \
    -X POST https://api-cloud.browserstack.com/app-automate/upload \
    -F "file=@$PWD/platforms/ios/build/device/HelloCordova.ipa" \
    >bs-app-url.txt
else

  # push tests works only in android
  cordova plugin add @aerogear/cordova-plugin-aerogear-push

  cordova platform add android || true
  cordova build android

  curl \
    -u "$BROWSERSTACK_USER:$BROWSERSTACK_KEY" \
    -X POST https://api-cloud.browserstack.com/app-automate/upload \
    -F "file=@$PWD/platforms/android/app/build/outputs/apk/debug/app-debug.apk" \
    >bs-app-url.txt
fi
