import * as aerogearApp from "@aerogear/app";
import * as aerogearAuth from "@aerogear/auth";
import * as aerogearPush from "@aerogear/push";
import * as aerogearSecurity from "@aerogear/security";
import * as aerogearVoyagerClient from "@aerogear/voyager-client";
import * as chai from "chai";
import gql from "graphql-tag";
import * as officeCache from "offix-cache";
import * as offixOffline from "offix-offline";
import * as _ToggleNetworkStatus from "./ToggleNetworkStatus";

export const modules = {
    "./ToggleNetworkStatus": _ToggleNetworkStatus,
    "@aerogear/app": aerogearApp,
    "@aerogear/auth": aerogearAuth,
    "@aerogear/push": aerogearPush,
    "@aerogear/security": aerogearSecurity,
    "@aerogear/voyager-client": aerogearVoyagerClient,
    chai,
    "graphql-tag": { gql },
    "offix-cache": officeCache,
    "offix-offline": offixOffline,
};

export type Modules = typeof modules;
