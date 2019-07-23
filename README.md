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

## Test locally on Android Emulator

### Prerequisites

-   Android Studio (https://developer.android.com/studio/)
-   Appium (https://appium.io/)
-   Chrome Drivers (https://appium.io/docs/en/writing-running-appium/web/chromedriver/)
-   Docker
-   docker-compose

### Preparation

1. Install packages and plugins
    > In order to update the plugins you have first to delete the _plugins_ and _platforms_ directories
    ```bash
    npm install
    ```
2. Build the app
    > If the app is already installed in the emulator rebuilding it is not enough, you will need also to uninstall it `adb uninstall org.aerogear.integrationtests`
    ```bash
    npm run build:android
    ```
3. Create the android emulator using Android Studio. Ensure the Android version for the is **9.0**
4. Start the emulator
5. Download the correct Chrome Drivers for the Emulator Android version. In our case **2.44**
    ```bash
    wget https://chromedriver.storage.googleapis.com/2.44/chromedriver_linux64.zip
    unzip chromedriver_linux64.zip
    ll chromedriver
    ```
6. Optional: Move the chromedriver in a specific directory and rename it
    ```bash
    mkdir $HOME/.chromedrivers
    mv chromedriver $HOME/.chromedrivers/chromedriver-2.44
    ```
7. Start Appium
    ```bash
    appium --chromedriver-executable $HOME/.chromedrivers/chromedriver-2.44
    ```
8. Start docker-compose
    ```bash
    docker-compose up
    ```
9. Optional: set **SERVICES_HOST** otherwise the test framework will try to guess it. The **SERVICES_HOST** should be an ip or hostname pointing to the machine where docker-compose is running (in our case locally) that both the local machine and the emulator can resolve (can't use 127.0.0.1)
    ```bash
    export SERVICES_HOST="192.168.1.1"
    ```
10. In order to also run the push integration test we have to set **FIREBASE_SERVER_KEY** and **FIREBASE_SENDER_ID**

### Start Tests

> Attention some security tests will fails because they detect that the device is an emulator, this is not an error.

```bash
npm test
```

Start single test

```bash
npm test -- test/util/device.ts
```
