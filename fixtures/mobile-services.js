const keycloakUrl = `http://${process.env.KEYCLOAK_HOST}:${process.env.KEYCLOAK_PORT}/auth`;

const config = {
  "version": 1,
  "namespace": "integration",
  "clientId": "test",
  "services": [
    {
      "id": "be432368-44b1-4e3a-9750-5ac43c9fcd78",
      "name": "keycloak",
      "type": "keycloak",
      "url": keycloakUrl,
      "config": {
        "realm": "integration",
        "auth-server-url": keycloakUrl,
        "ssl-required": "none",
        "resource": "cordova-testing-app",
        "public-client": true,
        "confidential-port": 0
      }
    }
  ]
}

module.exports = config;
