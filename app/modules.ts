import * as aerogearApp from "@aerogear/app";
import * as aerogearAuth from "@aerogear/auth";
import * as aerogearPush from "@aerogear/push";
import * as aerogearSecurity from "@aerogear/security";
import * as aerogearVoyagerClient from "@aerogear/voyager-client";
import * as chai from "chai";
import gql from "graphql-tag";
import * as officeCache from "offix-cache";
import * as utilTime from "../util/time";
import * as utilToggleNetworkStatus from "../util/ToggleNetworkStatus";

export const modules = {
    "../util/ToggleNetworkStatus": utilToggleNetworkStatus,
    "../util/time": utilTime,
    "@aerogear/app": aerogearApp,
    "@aerogear/auth": aerogearAuth,
    "@aerogear/push": aerogearPush,
    "@aerogear/security": aerogearSecurity,
    "@aerogear/voyager-client": aerogearVoyagerClient,
    chai,
    "graphql-tag": { gql },
    "offix-cache": officeCache,
};

export type Modules = typeof modules;
