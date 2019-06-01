#!/bin/bash

set -e

cordova create testing-app

cp fixtures/config.xml testing-app/
cp fixtures/index.html testing-app/www/
cp fixtures/webpack.config.js testing-app/

cd testing-app

cordova platform add android

cd ..

./scripts/build-testing-app.sh
