import { SecurityService, DeviceCheckType } from '@aerogear/security';
import { Auth } from '@aerogear/auth';
import { init } from '@aerogear/app';
import { OfflineClient } from '@aerogear/voyager-client';
import gql from 'graphql-tag';

window.aerogear = { SecurityService, DeviceCheckType, Auth, init, OfflineClient, gql };
