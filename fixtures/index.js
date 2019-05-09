import { SecurityService, DeviceCheckType } from '@aerogear/security';
import { Auth } from '@aerogear/auth';
import { init } from '@aerogear/app';

window.aerogear = { SecurityService, DeviceCheckType, Auth, init };
