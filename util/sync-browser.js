const { spawn } = require('child_process');
const path = require('path');
const puppeteer = require('puppeteer');
const _ = require('lodash');

const { waitForDeviceReady, initJsSdk } = require('./init');
const mobileServices = require('../config/mobile-services');
const { initClient } = require('./sync-client');

class SyncBrowser {
  constructor() {
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.reload = this.reload.bind(this);
  }

  async start() {
    const cordovaProc = spawn('cordova', ['serve'], { cwd: path.resolve(__dirname, '../testing-app') });
    this.cordovaProc = cordovaProc;
    await new Promise(resolve => {
      cordovaProc.stdout.on('data', data => {
        if (data.includes('Static file server running')) {
          resolve();
        }
      })
    });
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
    await this.page.goto('http://localhost:8000/browser/www/index.html');
    await this.page.evaluate(waitForDeviceReady);
    const services = _.cloneDeep(mobileServices);
    services.services[1].url = 'http://localhost:4000/graphql';
    services.services[1].config.websocketUrl = 'ws://localhost:4000/graphql';
    await this.page.evaluate(initJsSdk, mobileServices);
  }

  async stop() {
    await this.browser.close();
    this.cordovaProc.kill();
  }

  async reload() {
    await this.page.reload();
    await this.page.evaluate(waitForDeviceReady);
    await this.page.evaluate(initJsSdk, mobileServices);
    await this.page.evaluate(initClient, 'browser');
  }
}

module.exports = SyncBrowser;
