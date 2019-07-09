import axios from "axios";
import { KEYCLOAK_URL } from "./config";

// tslint:disable-next-line: no-var-requires
const realmToImport = require("../fixtures/realm-export");

const config = {
    adminRealmName: "master",
    appRealmName: "integration",
    authServerUrl: KEYCLOAK_URL,
    password: "admin",
    resource: "admin-cli",
    testPass: "123",
    testUser: "test",
    token: null,
    username: "admin",
};

async function authenticateToKeycloak() {
    const result = await axios.post(
        `${config.authServerUrl}/realms/${config.adminRealmName}/protocol/openid-connect/token`,
        `client_id=${config.resource}&username=${config.username}&password=${config.password}&grant_type=password`
    );
    return `Bearer ${result.data.access_token}`;
}

async function importRealmInKeycloak() {
    await axios.post(`${config.authServerUrl}/admin/realms`, realmToImport, {
        headers: {
            Authorization: config.token,
            "Content-Type": "application/json",
        },
    });
}

async function createUserInKeycloak(name) {
    await axios.post(
        `${config.authServerUrl}/admin/realms/${config.appRealmName}/users`,
        {
            credentials: [
                { type: "password", value: config.testPass, temporary: false },
            ],
            enabled: true,
            username: name,
        },
        {
            headers: {
                Authorization: config.token,
                "Content-Type": "application/json",
            },
        }
    );
}

export async function prepareKeycloak(authServerUrl) {
    config.token = await authenticateToKeycloak();
    await importRealmInKeycloak();
    await createUserInKeycloak(config.testUser);
}

export async function resetKeycloak() {
    await axios.delete(
        `${config.authServerUrl}/admin/realms/${config.appRealmName}`,
        { headers: { Authorization: config.token } }
    );
}
