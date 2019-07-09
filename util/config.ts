const SERVICES_HOST = process.env.SERVICES_HOST;

// Services

// Keycloak
export const KEYCLOAK_HOST = process.env.KEYCLOAK_HOST || SERVICES_HOST;
export const KEYCLOAK_PORT = process.env.KEYCLOAK_PORT || "8080";
export const KEYCLOAK_URL =
    process.env.KEYCLOAK_URL || `http://${KEYCLOAK_HOST}:${KEYCLOAK_PORT}/auth`;

// Metrics
export const METRICS_HOST = process.env.METRICS_HOST || SERVICES_HOST;
export const METRICS_PORT = process.env.METRICS_PORT || "3000";
export const METRICS_URL =
    process.env.METRICS_URL || `http://${METRICS_HOST}:${METRICS_PORT}/metrics`;

// Metrics DB
export const METRICS_DB_HOST = process.env.METRICS_DB_HOST || SERVICES_HOST;
export const METRICS_DB_PORT = process.env.METRICS_DB_PORT || "5432";
export const METRICS_DB_USER = process.env.METRICS_DB_USER || "metrics";
export const METRICS_DB_PASSWORD = process.env.METRICS_DB_PASSWORD || "metrics";
export const METRICS_DB_DATABASE = process.env.METRICS_DB_DATABASE || "metrics";

// UPS
export const UPS_HOST = process.env.UPS_HOST || SERVICES_HOST;
export const UPS_PORT = process.env.UPS_PORT || "8089";
export const UPS_URL = process.env.UPS_URL || `http://${UPS_HOST}:${UPS_PORT}`;

// Sync
export const SYNC_HOST = process.env.SYNC_HOST || SERVICES_HOST;
export const SYNC_PORT = process.env.SYNC_PORT || "4000";
export const SYNC_HTTP_URL =
    process.env.SYNC_HTTP_URL || `http://${SYNC_HOST}:${SYNC_PORT}/graphql`;
export const SYNC_WS_URL =
    process.env.SYNC_WS_URL || `ws://${SYNC_HOST}:${SYNC_PORT}/graphql`;

// Platform
export enum MobilePlatform {
    IOS = "ios",
    Android = "android",
}

export const MOBILE_PLATFORM: MobilePlatform =
    MobilePlatform[process.env.MOBILE_PLATFORM] || MobilePlatform.Android;

// Browserstack
export const BROWSERSTACK_APP = process.env.BROWSERSTACK_APP;
export const BROWSERSTACK_USER = process.env.BROWSERSTACK_USER;
export const BROWSERSTACK_KEY = process.env.BROWSERSTACK_KEY;
