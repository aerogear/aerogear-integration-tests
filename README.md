# AeroGear Integration Tests

## Prerequisites

#### Firebase Account

Login to Firebase, create a new project and app, download the `google-services.json` and copy it to `fixtures/`, and export the server key and sender id.

```bash
cp ~/Downloads/google-services.json fixtures/
```

```bash
export FIREBASE_SERVER_KEY=[..]
export FIREBASE_SENDER_ID=[..]
```

#### Cordova

```bash
npm install -g cordova
```

## Install Dependencies

Install all npm dependencies and update aerogear packages to the latest master version.

```bash
npm install
```

## Build APP

### Build Android APP

```bash
npm run prepare:android
npm run build:android
```

### Build iOS APP

```bash
npm run prepare:ios
npm run build:ios
```

## Start required services

```bash
docker-compose up -d
```

## Run tests

### Run tests using BrowserStack

Login to the BrowserStack and export the username and key.

```bash
export BROWSERSTACK_USER=[..]
export BROWSERSTACK_KEY=[..]
```

Set `MOBILE_PLATFORM` to `ios` or `android`

```bash
export MOBILE_PLATFORM=(ios|android)
```

Upload the app to BrowserStack

```bash
export BROWSERSTACK_APP="$(./scripts/upload-app-to-browserstack.sh ${MOBILE_PLATFORM})"
```

Start tests

```bash
npm test
```

### Run tests using local Emulator (only Android)

Prerequisites:

-   Android Studio (https://developer.android.com/studio/)
-   Appium (https://appium.io/)
-   Chrome Drivers (https://appium.io/docs/en/writing-running-appium/web/chromedriver/)

Create the android emulator using Android Studio. Ensure the Android version for the is **9.0**

Download the correct Chrome Drivers for the Emulator Android version. In our case **2.44**

Start Appium

```bash
appium --chromedriver-executable path/to/chromedrivers
```

**Optional**: set **SERVICES_HOST** otherwise the test framework will try to guess it. The **SERVICES_HOST** should be an ip or hostname pointing to the machine where docker-compose is running (in our case locally) that both the local machine and the emulator can resolve (can't use 127.0.0.1)

```bash
export SERVICES_HOST="192.168.1.1"
```

Ensure `BROWSERSTACK_APP` is unset

```bash
export BROWSERSTACK_APP=
```

Start tests

```bash
npm test
```
