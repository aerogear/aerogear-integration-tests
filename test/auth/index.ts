import chai = require("chai");
chai.should();

import { Auth } from "@aerogear/auth";
import { KeycloakInitOptions } from "keycloak-js";
import { config as mobileServices } from "../../config/mobile-services";
import { device } from "../../util/device";
import { GlobalUniverse } from "../../util/init";
import {
    prepareKeycloak,
    resetKeycloakConfiguration,
} from "../../util/keycloak";

interface Universe extends GlobalUniverse {
    authService: Auth;
}

describe("Auth", function() {
    this.timeout(0);

    let mainWindow: string;

    before("setup test realm", async () => {
        mainWindow = await device.browser.getWindowHandle();
        const config = mobileServices.services.find(
            service => service.name === "keycloak"
        );
        await prepareKeycloak(config.url);
    });

    after("remove test realm", async () => {
        await device.browser.switchToWindow(mainWindow);
        await resetKeycloakConfiguration();
    });

    it("should not login with incorrect credentials", async () => {
        await device.execute(async (modules, universe: Universe) => {
            const { Auth } = modules["@aerogear/auth"];
            const { app } = universe;

            const authService = new Auth(app.config);
            universe.authService = authService;

            const initOptions: KeycloakInitOptions = {
                onLoad: "login-required",
            };
            authService.init(initOptions);
        });

        await new Promise(resolve => setTimeout(resolve, 20 * 1000));

        const allWindows = await device.browser.getWindowHandles();
        const loginPage = allWindows.find(w => w !== mainWindow);
        await device.browser.switchToWindow(loginPage);

        const usernameEl = await device.browser.$("#username");
        await usernameEl.setValue("test");

        const passwordEl = await device.browser.$("#password");
        await passwordEl.setValue("wrong-password");

        await new Promise(resolve => setTimeout(resolve, 1000));

        const loginEl = await device.browser.$("#kc-login");
        await loginEl.click();

        await new Promise(resolve => setTimeout(resolve, 3000));

        const alertEl = await device.browser.$(".alert-error");
        (await alertEl.isDisplayed()).should.equal(true);
    });

    it("should login", async () => {
        const passwordEl = await device.browser.$("#password");
        await passwordEl.setValue("123");

        await new Promise(resolve => setTimeout(resolve, 1000));

        const loginEl = await device.browser.$("#kc-login");
        await loginEl.click();

        await device.browser.switchToWindow(mainWindow);

        await new Promise(resolve => setTimeout(resolve, 5000));

        const authenticated = await device.execute(
            async (_, universe: Universe) => {
                const { authService } = universe;

                return authService.isAuthenticated();
            }
        );

        authenticated.should.equal(true);
    });

    it("should refresh authentication token", async () => {
        const authenticated = await device.execute(
            async (_, universe: Universe) => {
                const { authService } = universe;

                await authService.extract().updateToken(30);

                return authService.isAuthenticated();
            }
        );

        authenticated.should.equal(true);
    });

    it("should get authentication token", async () => {
        await device.execute(async (_, universe: Universe) => {
            const { authService } = universe;

            authService.extract().token;
        });
    });

    it("should get realm roles", async () => {
        const result = await device.execute(async (_, universe: Universe) => {
            const { authService } = universe;

            return authService.getRealmRoles();
        });

        result.should.deep.equal(["offline_access", "uma_authorization"]);
    });

    it("should logout", async () => {
        const authenticated = await device.execute(
            async (_, universe: Universe) => {
                const { authService } = universe;

                await authService.logout();

                return authService.isAuthenticated();
            }
        );

        authenticated.should.equal(false);
    });
});
