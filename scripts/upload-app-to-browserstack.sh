#!/usr/bin/env bash

set -e

function help {
  echo
  echo "Usage: $0 PLATFORM"
  echo
  echo "Platforms:"
  echo "    ios"
  echo "    android"
  echo
}

APP=
PLATFORM="$1"
if [ -z "$PLATFORM" ]; then
  echo "error: PLATFORM is not defined" >&2
  help >&2
  exit 1

elif [ "$PLATFORM" == "ios" ]; then
  APP=$PWD/platforms/ios/build/device/HelloCordova.ipa

elif [ "$PLATFORM" == "android" ]; then
  APP=$PWD/platforms/android/app/build/outputs/apk/debug/app-debug.apk

else
  echo "error: $PLATFORM is not a valid PLATFORM" >&2
  help >&2
  exit 1
fi

if [ -z "$BROWSERSTACK_USER" ] || [ -z "$BROWSERSTACK_KEY" ]; then
  echo "error: BROWSERSTACK_USER and/or BROWSERSTACK_KEY envs are not defined" >&2
  exit 1
fi

exec curl \
    -u "$BROWSERSTACK_USER:$BROWSERSTACK_KEY" \
    -X POST https://api-cloud.browserstack.com/app-automate/upload \
    -F "file=@$APP" \
    | jq -r ".app_url"
