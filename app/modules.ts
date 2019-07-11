import * as aerogearApp from "@aerogear/app";
import * as aerogearAuth from "@aerogear/auth";
import * as aerogearPush from "@aerogear/push";
import * as aerogearSecurity from "@aerogear/security";
import * as chai from "chai";

export const modules = {
    "@aerogear/app": aerogearApp,
    "@aerogear/auth": aerogearAuth,
    "@aerogear/push": aerogearPush,
    "@aerogear/security": aerogearSecurity,
    chai,
};

export type Modules = typeof modules;
