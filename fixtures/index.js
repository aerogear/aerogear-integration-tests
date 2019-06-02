import { SecurityService, DeviceCheckType } from '@aerogear/security';
import { Auth } from '@aerogear/auth';
import { init } from '@aerogear/app';
import { OfflineClient, CordovaNetworkStatus } from '@aerogear/voyager-client';
import gql from 'graphql-tag';

window.aerogear = {
  SecurityService,
  DeviceCheckType,
  Auth,
  init,
  OfflineClient,
  gql,
  CordovaNetworkStatus
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