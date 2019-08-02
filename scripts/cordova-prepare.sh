#!/usr/bin/env bash

set -e
set -x

function help {
    echo
    echo "Usage: $0 PLATFORM"
    echo
    echo "Platforms:"
    echo "    ios"
    echo "    android"
    echo
}

PLATFORM="$1"
if [ -z "$PLATFORM" ]; then
    echo "error: PLATFORM is not defined" >&2
    help >&2
    exit 1
fi

# create the ww directory if it doesn't exists
# otherwise cordova will not recognize this project
# as a cordova project
mkdir -p www

# install plugins in config.xml and bootstrap platforms
cordova prepare ${PLATFORM}

# install aerogear plugins
cordova plugin add --nosave \
    @aerogear/cordova-plugin-aerogear-metrics@dev \
    @aerogear/cordova-plugin-aerogear-security@dev \
    @aerogear/cordova-plugin-aerogear-sync@dev

if [ "$PLATFORM" == "android" ]; then 
    cordova plugin add --nosave @aerogear/cordova-plugin-aerogear-push@dev
fi

exit 0
