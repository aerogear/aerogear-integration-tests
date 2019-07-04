import { Auth } from "@aerogear/auth";
import { expect } from "chai";
import { bootstrapDevice, Device } from "../../util/device";
import { prepareKeycloak, resetKeycloak } from "../../util/keycloak";

interface Universe {
    auth: Auth;
}

// tslint:disable-next-line: no-var-requires
const mobileServices = require("../../config/mobile-services");

describe("auth", function() {
    this.timeout(0);

    let device: Device;
    let mainWindow: string;

    before("boot device", async () => {
        device = await bootstrapDevice();
    });

    before("save main window", async () => {
        // store the name of the main window in a global variable
        // in order to be able to restore to it once the test is finish
        mainWindow = await device.browser.getWindowHandle();
    });

    after("restore main window", async () => {
        await device.browser.switchToWindow(mainWindow);
    });

    before("create test realm in keycloak", async () => {
        const config = mobileServices.services.find(
            service => service.name === "keycloak"
        );
        await prepareKeycloak("http://localhost:8080/auth");
    });

    after("remove test realm from keycloak", async () => {
        await resetKeycloak();
    });

    before("wait for device is ready", async () => {
        await device.executeAsync(async () => {
            await new Promise(resolve => {
                document.addEventListener("deviceready", resolve, false);
            });
        });
    });

    before("load auth in context", async () => {
        await device.execute((modules, universe: Universe, mobileServices) => {
            const { init } = modules["@aerogear/app"];
            const { Auth } = modules["@aerogear/auth"];

            const app = init(mobileServices);

            const auth = new Auth(app.config);

            universe.auth = auth;
        }, mobileServices);
    });

    after("clear context", async () => {
        await device.execute((_, universe) => {
            universe = {};
        });
    });

    it.only("should not login with incorrect credentials", async () => {
        device.executeAsync(async (_, { auth }) => {
            auth.init({ onLoad: "login-required" });
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
        expect(await alertEl.isDisplayed()).to.be.true;
    });

    it("should login", async () => {
        const passwordEl = await device.browser.$("#password");
        await passwordEl.setValue("123");

        await new Promise(resolve => setTimeout(resolve, 1000));

        const loginEl = await device.browser.$("#kc-login");
        await loginEl.click();

        await device.browser.switchToWindow(mainWindow);

        await new Promise(resolve => setTimeout(resolve, 5000));

        const authenticated = await device.execute((_, { auth }: Universe) => {
            return auth.isAuthenticated();
        });

        expect(authenticated).to.be.true;
    });

    it("should refresh authentication token", async () => {
        const authenticated = await device.executeAsync(
            async (_, { auth }: Universe) => {
                await auth.extract().updateToken(30);

                return auth.isAuthenticated();
            }
        );

        expect(authenticated).to.be.true;
    });

    it("should get authentication token", async () => {
        const token = await device.execute((_, { auth }: Universe) => {
            return auth.extract().token;
        });

        expect(token).to.exist;
    });

    it("should get realm roles", async () => {
        const roles = await device.execute((_, { auth }: Universe) => {
            return auth.getRealmRoles();
        });

        expect(roles).deep.equal(["offline_access", "uma_authorization"]);
    });

    it("should logout", async () => {
        const authenticated = await device.executeAsync(
            async (_, { auth }: Universe) => {
                await auth.logout();

                return auth.isAuthenticated();
            }
        );

        expect(authenticated).to.be.false;
    });
});
