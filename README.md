# AeroGear Integration Tests

## Running locally

### Run BrowserStackLocal

1. `wget "https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip"`
2. `unzip BrowserStackLocal-linux-x64.zip`
3. `./BrowserStackLocal $BROWSERSTACK_KEY`

### Setup testing app

1. `./scripts/create-testing-app.sh`
2. `export BROWSERSTACK_USER=<BS_USER>`
3. `export BROWSERSTACK_KEY=<BS_KEY>`
4. `./scripts/upload-testing-app.sh`
5. `export BROWSERSTACK_APP=<BS_APP_URL>`

### Run services

1. `./scripts/setup-metrics.sh`
2. `docker-compose up -d`
3. `source ./scripts/local-env-vars.sh`

### Install dependencies 

1. `npm install`
2. `./scripts/install-dependencies.sh`

### Run the tests

`npm start -- test/<SERVICE>/index.js`

or to run all tests

`npm start -- test/**/*.js`
