import { Auth } from "@aerogear/auth";
import { expect } from "chai";
import { bootstrapDevice, Device } from "../../util/device";
import {
    prepareKeycloak,
    resetKeycloak,
    TEST_PASSWORD,
    TEST_USER,
} from "../../util/keycloak";
import {
    generateConfig,
    generateKeycloakService,
} from "../../util/mobileServices";
import { ONE_SECOND, sleep } from "../../util/time";

interface Universe {
    auth: Auth;
}

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
        await prepareKeycloak();
    });

    after("remove test realm from keycloak", async () => {
        await resetKeycloak();
    });

    before("wait for device is ready", async () => {
        await device.execute(async () => {
            await new Promise(resolve => {
                document.addEventListener("deviceready", resolve, false);
            });
        });
    });

    after("clear context", async () => {
        await device.execute(async (_, universe) => {
            universe = {};
        });
    });

    it("initialize login window", async () => {
        const mobileServices = generateConfig([generateKeycloakService()]);

        // initialize auth modules
        await device.execute(
            async (modules, universe: Universe, mobileServices) => {
                const { init } = modules["@aerogear/app"];
                const { Auth } = modules["@aerogear/auth"];

                const app = init(mobileServices);

                const auth = new Auth(app.config);

                universe.auth = auth;

                auth.init({ onLoad: "login-required" });
            },
            mobileServices
        );
    });

    it("should switch to login window", async function() {
        this.retries(20);
        await sleep(ONE_SECOND);

        const allWindows = await device.browser.getWindowHandles();

        const loginWindow = allWindows.find(window => window !== mainWindow);

        await device.browser.switchToWindow(loginWindow);
    });

    it("should not login with incorrect credentials", async () => {
        const usernameEl = await device.browser.$("#username");
        await usernameEl.setValue(TEST_USER);

        const passwordEl = await device.browser.$("#password");
        await passwordEl.setValue("wrong-password");

        await sleep(ONE_SECOND);

        const loginEl = await device.browser.$("#kc-login");
        await loginEl.click();

        await sleep(3 * ONE_SECOND);

        const alertEl = await device.browser.$(".alert-error");
        expect(await alertEl.isDisplayed()).to.be.true;
    });

    it("should login", async () => {
        const passwordEl = await device.browser.$("#password");
        await passwordEl.setValue(TEST_PASSWORD);

        await sleep(ONE_SECOND);

        const loginEl = await device.browser.$("#kc-login");
        await loginEl.click();

        await device.browser.switchToWindow(mainWindow);

        await sleep(5 * ONE_SECOND);

        const authenticated = await device.execute(
            async (_, { auth }: Universe) => {
                return auth.isAuthenticated();
            }
        );

        expect(authenticated).to.be.true;
    });

    it("should refresh authentication token", async () => {
        const authenticated = await device.execute(
            async (_, { auth }: Universe) => {
                await auth.extract().updateToken(30);

                return auth.isAuthenticated();
            }
        );

        expect(authenticated).to.be.true;
    });

    it("should get authentication token", async () => {
        const token = await device.execute(async (_, { auth }: Universe) => {
            return auth.extract().token;
        });

        expect(token).to.exist;
    });

    it("should get realm roles", async () => {
        const roles = await device.execute(async (_, { auth }: Universe) => {
            return auth.getRealmRoles();
        });

        expect(roles).deep.equal(["offline_access", "uma_authorization"]);
    });

    it("should logout", async () => {
        const authenticated = await device.execute(
            async (_, { auth }: Universe) => {
                await auth.logout();

                return auth.isAuthenticated();
            }
        );

        expect(authenticated).to.be.false;
    });
});
