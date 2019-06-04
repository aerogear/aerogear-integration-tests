# AeroGear Integration Tests

## Prerequisites

1. BrowserStack account
2. `export BROWSERSTACK_USER=<BS_USER>`
3. `export BROWSERSTACK_KEY=<BS_KEY>`

## Install dependencies 

`npm install`

## Run services

`docker network create aerogear`
`docker-compose up -d`

## Setup testing app

`./scripts/build-testing-app.sh`

## Run the tests

`npm start -- test/**/*.js`

or to run specific test:

`npm start -- test/<SERVICE>/index.js`
