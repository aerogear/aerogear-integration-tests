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

1. Create the android emulator using Android Studio. Ensure the Android version for the is **9.0**
2. Start the emulator
3. Download the correct Chrome Drivers for the Emulator Android version. In our case **2.44**
    ```bash
    wget https://chromedriver.storage.googleapis.com/2.44/chromedriver_linux64.zip
    unzip chromedriver_linux64.zip
    ll chromedriver
    ```
4. Optional: Move the chromedriver in a specific directory and rename it
    ```bash
    mkdir $HOME/.chromedrivers
    mv chromedriver $HOME/.chromedrivers/chromedriver-2.44
    ```
5. Start Appium
    ```bash
    appium --chromedriver-executable $HOME/.chromedrivers/chromedriver-2.44
    ```
6. Start docker-compose
    ```bash
    docker-compose up
    ```
7. Optional: set **SERVICES_HOST** otherwise the test framework will try to guess it. The **SERVICES_HOST** should be an ip or hostname to the machine where docker-compose is running (in our case locally) that both the local machine and the emulator can resolve (can't use 127.0.0.1)
    ```bash
    export SERVICES_HOST="192.168.1.1"
    ```

8. In order to also run the push integration test we have to set **FIREBASE_SERVER_KEY** and **FIREBASE_SENDER_ID**

### Start Tests

```bash
./node_modules/.bin/mocha --require ts-node/register test/file/toTest.ts
```