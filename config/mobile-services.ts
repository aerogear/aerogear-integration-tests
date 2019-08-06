import { AeroGearConfiguration } from "@aerogear/core";

const keycloakUrl = `http://${process.env.KEYCLOAK_HOST}:${process.env.KEYCLOAK_PORT}/auth`;
const syncUrl = `${process.env.SYNC_HOST}:${process.env.SYNC_PORT}/graphql`;
const metricsUrl = `http://${process.env.METRICS_HOST}:${process.env.METRICS_PORT}/metrics`;
const upsUrl = `http://${process.env.UPS_HOST}:${process.env.UPS_PORT}`;

export const config: AeroGearConfiguration = {
    version: 1,
    namespace: "integration",
    clusterName: "test",
    services: [
        {
            id: "be432368-44b1-4e3a-9750-5ac43c9fcd78",
            name: "keycloak",
            type: "keycloak",
            url: keycloakUrl,
            config: {
                realm: "integration",
                "auth-server-url": keycloakUrl,
                "ssl-required": "none",
                resource: "cordova-testing-app",
                "public-client": true,
                "confidential-port": 0,
            },
        },
        {
            id: "81f67bae-7d40-11e9-afde-06799ee5f0b0",
            name: "sync-app-test",
            type: "sync-app",
            url: `http://${syncUrl}`,
            config: {
                websocketUrl: `ws://${syncUrl}`,
            },
        },
        {
            id: "d3776cbe-7c83-11e9-afde-06799ee5f0b0",
            name: "metrics",
            type: "metrics",
            url: metricsUrl,
            config: {},
        },
        {
            id: "fb8ebb60-83b1-11e9-9805-e86a640057de",
            name: "ups",
            type: "push",
            url: upsUrl,
            config: {
                android: {
                    senderId: null,
                    variantId: null,
                    variantSecret: null,
                },
            },
        },
    ],
};
