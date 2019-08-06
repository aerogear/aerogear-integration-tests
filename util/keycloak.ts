// @ts-ignore
const axios = require('axios')

const realmToImport = require('../fixtures/realm-export')

// @ts-ignore
const config = {
  appRealmName: 'integration',
  adminRealmName: 'master',
  resource: 'admin-cli',
  username: 'admin',
  password: 'admin',
  token: null,
  authServerUrl: null,
  testUser: 'test',
  testPass: '123'
}

async function authenticateKeycloak () {
  const res = await axios({
    method: 'POST',
    // @ts-ignore
    url: `${config.authServerUrl}/realms/${config.adminRealmName}/protocol/openid-connect/token`,
    // @ts-ignore
    data: `client_id=${config.resource}&username=${config.username}&password=${config.password}&grant_type=password`
  })
  return `Bearer ${res.data['access_token']}`
}

async function importRealm () {
  await axios({
    method: 'POST',
    // @ts-ignore
    url: `${config.authServerUrl}/admin/realms`,
    data: realmToImport,
    // @ts-ignore
    headers: {'Authorization': config.token, 'Content-Type': 'application/json'}
  })
}

async function createUser (name) {
  await axios({
    method: 'post',
    // @ts-ignore
    url: `${config.authServerUrl}/admin/realms/${config.appRealmName}/users`,
    data: {
      'username': name,
      // @ts-ignore
      'credentials': [{'type': 'password', 'value': config.testPass, 'temporary': false}],
      'enabled': true
    },
    // @ts-ignore
    headers: {'Authorization': config.token, 'Content-Type': 'application/json'}
  })
}

// @ts-ignore
async function prepareKeycloak (authServerUrl) {
  // @ts-ignore
  config.authServerUrl = authServerUrl
  // @ts-ignore
  config.token = await authenticateKeycloak()
  await importRealm()
  // @ts-ignore
  await createUser(config.testUser)
}

// @ts-ignore
async function resetKeycloakConfiguration () {
  await axios({
    method: 'DELETE',
    // @ts-ignore
    url: `${config.authServerUrl}/admin/realms/${config.appRealmName}`,
    // @ts-ignore
    headers: {'Authorization': config.token}
  })
}

module.exports = { prepareKeycloak, resetKeycloakConfiguration }
