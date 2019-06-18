import * as agSecurity from '@aerogear/security';
import * as agAuth from '@aerogear/auth';
import * as agApp from '@aerogear/app';
import * as agSync from '@aerogear/voyager-client';
import * as agPush from '@aerogear/push';
import * as offixCache from 'offix-cache';
import gql from 'graphql-tag';

class ToggleNetworkStatus {
  constructor() {
    this.online = true;
  }

  onStatusChangeListener(callback) {
    this.callback = callback;
  }

  isOffline() {
    const online = this.online;
    return new Promise(resolve => resolve(!online));
  }

  setOnline(online) {
    this.online = online;
    this.callback && this.callback.onStatusChange({ online });
  }
};

window.aerogear = {
  agSecurity,
  agAuth,
  agApp,
  agSync,
  agPush,
  gql,
  ToggleNetworkStatus,
  offixCache
};

var app = {
  initialize: function() {
      document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  onDeviceReady: function() {
      this.receivedEvent('deviceready');
      window.aerogear.deviceIsReady = true;
  },

  receivedEvent: function(id) {
      var parentElement = document.getElementById(id);
      var listeningElement = parentElement.querySelector('.listening');
      var receivedElement = parentElement.querySelector('.received');

      listeningElement.setAttribute('style', 'display:none;');
      receivedElement.setAttribute('style', 'display:block;');

      console.log('Received Event: ' + id);
  }
};

app.initialize();
