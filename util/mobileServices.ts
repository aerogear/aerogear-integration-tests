import { AeroGearConfiguration, ServiceConfiguration } from "@aerogear/core";
import {
    KEYCLOAK_URL,
    METRICS_URL,
    SYNC_HTTP_URL,
    SYNC_WS_URL,
    UPS_URL,
} from "./config";

export function generateConfig(
    services: ServiceConfiguration[]
): AeroGearConfiguration {
    return {
        clusterName: "test",
        namespace: "integration",
        services,
        version: 1,
    };
}

export function generateKeycloakService(): ServiceConfiguration {
    return {
        config: {
            "auth-server-url": KEYCLOAK_URL,
            "confidential-port": 0,
            "public-client": true,
            realm: "integration",
            resource: "cordova-testing-app",
            "ssl-required": "none",
        },
        id: "be432368-44b1-4e3a-9750-5ac43c9fcd78",
        name: "keycloak",
        type: "keycloak",
        url: KEYCLOAK_URL,
    };
}

export function generateSyncService(): ServiceConfiguration {
    return {
        config: {
            websocketUrl: SYNC_WS_URL,
        },
        id: "81f67bae-7d40-11e9-afde-06799ee5f0b0",
        name: "sync-app-test",
        type: "sync-app",
        url: SYNC_HTTP_URL,
    };
}

export function generateMetricsService(): ServiceConfiguration {
    return {
        config: {},
        id: "d3776cbe-7c83-11e9-afde-06799ee5f0b0",
        name: "metrics",
        type: "metrics",
        url: METRICS_URL,
    };
}

export function generatePushService(
    androidSenderId: string,
    androidVariantId: string,
    androidVariantSecret: string
): ServiceConfiguration {
    return {
        config: {
            android: {
                senderId: androidSenderId,
                variantId: androidVariantId,
                variantSecret: androidVariantSecret,
            },
        },
        id: "fb8ebb60-83b1-11e9-9805-e86a640057de",
        name: "push",
        type: "push",
        url: UPS_URL,
    };
}
