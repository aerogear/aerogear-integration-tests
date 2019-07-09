import axios from "axios";
import { KEYCLOAK_URL } from "./config";

// tslint:disable-next-line: no-var-requires
const realmToImport = require("../fixtures/realm-export");

const ADMIN_REALM = "master";
const ADMIN_USER = "admin";
const ADMIN_PASSWORD = "admin";
const ADMIN_RESOURCE = "admin-cli";

const REALM = "integration";

export const TEST_USER = "test";
export const TEST_PASSWORD = "123";

let token;

async function authenticateToKeycloak() {
    const result = await axios.post(
        `${KEYCLOAK_URL}/realms/${ADMIN_REALM}/protocol/openid-connect/token`,
        `client_id=${ADMIN_RESOURCE}&username=${ADMIN_USER}&password=${ADMIN_PASSWORD}&grant_type=password`
    );
    token = `Bearer ${result.data.access_token}`;
}

async function importRealmInKeycloak() {
    await axios.post(`${KEYCLOAK_URL}/admin/realms`, realmToImport, {
        headers: {
            Authorization: token,
            "Content-Type": "application/json",
        },
    });
}

async function createTestUserInKeycloak() {
    await axios.post(
        `${KEYCLOAK_URL}/admin/realms/${REALM}/users`,
        {
            credentials: [
                { type: "password", value: TEST_PASSWORD, temporary: false },
            ],
            enabled: true,
            username: TEST_USER,
        },
        {
            headers: {
                Authorization: token,
                "Content-Type": "application/json",
            },
        }
    );
}

export async function prepareKeycloak() {
    await authenticateToKeycloak();
    await importRealmInKeycloak();
    await createTestUserInKeycloak();
}

export async function resetKeycloak() {
    await axios.delete(`${KEYCLOAK_URL}/admin/realms/${REALM}`, {
        headers: { Authorization: token },
    });
}
