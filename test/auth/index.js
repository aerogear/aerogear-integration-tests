require('chai').should();

const { prepareKeycloak, resetKeycloakConfiguration } = require('../../util/keycloak');
const mobileServices = require('../../config/mobile-services');

describe('Auth', function() {
  this.timeout(0);

  before('setup test realm', async function() {
    const config = mobileServices.services.find(service => service.name === 'keycloak');
    await prepareKeycloak(config.url)
  });

  after('remove test realm', async function() {
    await resetKeycloakConfiguration();
  });
  
  it('should login', async function() {
    client.execute(config => {
      const { Auth, init } = window.aerogear;

      const app = init(config);

      const authService = new Auth(app.config);
      window.aerogear.authService = authService;

      const initOptions = { onLoad: 'login-required' };
      window.aerogear.loginPromise = authService.init(initOptions);
    }, mobileServices);

    await new Promise(resolve => setTimeout(resolve, 5000));

    const mainWindow = await client.getWindowHandle();
    const allWindows = await client.getWindowHandles();
    const loginPage = allWindows.find(w => w !== mainWindow);
    await client.switchToWindow(loginPage);

    const usernamEl = await client.$('#username')
    await usernamEl.setValue('test');
    
    const passwordEl = await client.$('#password')
    await passwordEl.setValue('123');
    
    const loginEl = await client.$('#kc-login')
    await loginEl.click();

    await client.switchToWindow(mainWindow);

    const authenticated = await client.executeAsync(async done => {
      const { authService, loginPromise } = window.aerogear;

      try {
        await loginPromise;
      } catch (error) {
        done(error.message);
        return;
      }

      done(authService.isAuthenticated());
    });
    
    console.log('authenticated: ', authenticated);

    authenticated.should.equal(true);
  });
});
