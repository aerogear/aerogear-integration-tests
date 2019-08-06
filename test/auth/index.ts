require("chai").should();

const {
    // @ts-ignore
    prepareKeycloak,
    // @ts-ignore
    resetKeycloakConfiguration,
} = require("../../util/keycloak");
// @ts-ignore
const mobileServices = require("../../config/mobile-services");

describe("Auth", function() {
    this.timeout(0);

    let mainWindow;

    before("setup test realm", async function() {
        // @ts-ignore
        mainWindow = await client.getWindowHandle();
        const config = mobileServices.services.find(
            service => service.name === "keycloak"
        );
        await prepareKeycloak(config.url);
    });

    after("remove test realm", async function() {
        // @ts-ignore
        await client.switchToWindow(mainWindow);
        await resetKeycloakConfiguration();
    });

    it("should not login with incorrect credentials", async function() {
        // @ts-ignore
        client.execute(() => {
            const {
                agAuth: { Auth },
                app,
                // @ts-ignore
            } = window.aerogear;

            const authService = new Auth(app.config);
            // @ts-ignore
            window.aerogear.authService = authService;

            const initOptions = { onLoad: "login-required" };
            authService.init(initOptions);
        });

        await new Promise(resolve => setTimeout(resolve, 20 * 1000));

        // @ts-ignore
        const allWindows = await client.getWindowHandles();
        const loginPage = allWindows.find(w => w !== mainWindow);
        // @ts-ignore
        await client.switchToWindow(loginPage);

        // @ts-ignore
        const usernamEl = await client.$("#username");
        await usernamEl.setValue("test");

        // @ts-ignore
        const passwordEl = await client.$("#password");
        await passwordEl.setValue("wrong-password");

        await new Promise(resolve => setTimeout(resolve, 1000));

        // @ts-ignore
        const loginEl = await client.$("#kc-login");
        await loginEl.click();

        await new Promise(resolve => setTimeout(resolve, 3000));

        // @ts-ignore
        const alertEl = await client.$(".alert-error");
        (await alertEl.isDisplayed()).should.equal(true);
    });

    it("should login", async function() {
        // @ts-ignore
        const passwordEl = await client.$("#password");
        await passwordEl.setValue("123");

        await new Promise(resolve => setTimeout(resolve, 1000));

        // @ts-ignore
        const loginEl = await client.$("#kc-login");
        await loginEl.click();

        // @ts-ignore
        await client.switchToWindow(mainWindow);

        await new Promise(resolve => setTimeout(resolve, 5000));

        // @ts-ignore
        const authenticated = await client.executeAsync(async done => {
            // @ts-ignore
            const { authService } = window.aerogear;

            done(authService.isAuthenticated());
        });

        authenticated.should.equal(true);
    });

    it("should refresh authentication token", async function() {
        // @ts-ignore
        const authenticated = await client.executeAsync(async done => {
            // @ts-ignore
            const { authService } = window.aerogear;

            await authService.extract().updateToken(30);

            done(authService.isAuthenticated());
        });

        authenticated.should.equal(true);
    });

    it("should get authentication token", function() {
        // @ts-ignore
        client.execute(() => {
            // @ts-ignore
            const { authService } = window.aerogear;

            authService.extract().token;
        });
    });

    it("should get realm roles", async function() {
        // @ts-ignore
        const result = await client.executeAsync(async done => {
            // @ts-ignore
            const { authService } = window.aerogear;

            done(authService.getRealmRoles());
        });

        result.should.deep.equal(["offline_access", "uma_authorization"]);
    });

    it("should logout", async function() {
        // @ts-ignore
        const authenticated = await client.executeAsync(async done => {
            // @ts-ignore
            const { authService } = window.aerogear;

            await authService.logout();

            done(authService.isAuthenticated());
        });

        authenticated.should.equal(false);
    });
});
