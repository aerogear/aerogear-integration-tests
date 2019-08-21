import axios from "axios";

import realmToImport = require("../fixtures/realm-export.json");

const config = {
    appRealmName: "integration",
    adminRealmName: "master",
    resource: "admin-cli",
    username: "admin",
    password: "admin",
    token: null,
    authServerUrl: null,
    testUser: "test",
    testPass: "123",
};

async function authenticateKeycloak() {
    const res = await axios({
        method: "POST",
        url: `${config.authServerUrl}/realms/${config.adminRealmName}/protocol/openid-connect/token`,
        data: `client_id=${config.resource}&username=${config.username}&password=${config.password}&grant_type=password`,
    });
    return `Bearer ${res.data["access_token"]}`;
}

async function importRealm() {
    await axios({
        method: "POST",
        url: `${config.authServerUrl}/admin/realms`,
        data: realmToImport,
        headers: {
            Authorization: config.token,
            "Content-Type": "application/json",
        },
    });
}

async function createUser(name: string) {
    await axios({
        method: "post",
        url: `${config.authServerUrl}/admin/realms/${config.appRealmName}/users`,
        data: {
            username: name,
            credentials: [
                { type: "password", value: config.testPass, temporary: false },
            ],
            enabled: true,
        },
        headers: {
            Authorization: config.token,
            "Content-Type": "application/json",
        },
    });
}

async function prepareKeycloak(authServerUrl: string) {
    config.authServerUrl = authServerUrl;
    config.token = await authenticateKeycloak();
    await importRealm();
    await createUser(config.testUser);
}

async function resetKeycloakConfiguration() {
    await axios({
        method: "DELETE",
        url: `${config.authServerUrl}/admin/realms/${config.appRealmName}`,
        headers: { Authorization: config.token },
    });
}

export { prepareKeycloak, resetKeycloakConfiguration };
