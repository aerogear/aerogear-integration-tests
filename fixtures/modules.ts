import * as aerogearApp from "@aerogear/app";
import * as aerogearAuth from "@aerogear/auth";
import * as aerogearPush from "@aerogear/push";
import * as aerogearSecurity from "@aerogear/security";
import * as aerogearVoyagerClient from "@aerogear/voyager-client";
import gql from "graphql-tag";
import * as _ToggleNetworkStatus from "./ToggleNetworkStatus";

export const modules = {
    "@aerogear/app": aerogearApp,
    "@aerogear/auth": aerogearAuth,
    "@aerogear/push": aerogearPush,
    "@aerogear/security": aerogearSecurity,
    "@aerogear/voyager-client": aerogearVoyagerClient,
    "graphql-tag": { gql },
    "./ToggleNetworkStatus": _ToggleNetworkStatus,
};

export type Modules = typeof modules;
