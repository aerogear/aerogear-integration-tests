# AeroGear Integration Tests

## Prerequisites

#### BrowserStack Account

Login to the BrowserStack and export the username and key.

```bash
export BROWSERSTACK_USER=[..]
export BROWSERSTACK_KEY=[..]
```

#### Firebase Account

Login to Firebase, create a new project and app, download the `google-services.json` and copy it to `fixtures/`, and export the server key and sender id.

```
cp ~/Downloads/google-services.json fixtures/
```

```bash
export FIREBASE_SERVER_KEY=[..]
export FIREBASE_SENDER_ID=[..]
```

## Install dependencies 

```
npm install
```

## Run services

```
docker network create aerogear
docker-compose up -d
```

## Setup testing app

```
./scripts/build-testing-app.sh
```

## Run the tests

```
npm start -- test/**/*.js
```

or to run specific test:

```
npm start -- test/<SERVICE>/index.js
```
