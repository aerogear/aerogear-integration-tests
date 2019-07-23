import { AeroGearConfiguration } from "@aerogear/core";
import { PushRegistration } from "@aerogear/push";
import axios from "axios";
import { expect } from "chai";
import * as sender from "unifiedpush-node-sender";
import { MOBILE_PLATFORM, MobilePlatform, UPS_URL } from "../../util/config";
import { bootDevice, Device } from "../../util/device";
import {
    generateMobileServices,
    generatePushService,
} from "../../util/mobileServices";

interface Universe {
    push: PushRegistration;
}

describe("push notifications", function() {
    // skip push tests in ios
    if (MOBILE_PLATFORM === MobilePlatform.IOS) {
        return;
    }

    this.timeout(0);

    let device: Device;
    before("boot device", async () => {
        device = await bootDevice();
    });

    let mobileServices: AeroGearConfiguration;
    let pushApplicationID: string;
    let masterSecret: string;

    before("create ups application", async () => {
        const serverKey = process.env.FIREBASE_SERVER_KEY;
        const senderId = process.env.FIREBASE_SENDER_ID;

        if (serverKey === undefined || senderId === undefined) {
            throw new Error(
                "FIREBASE_SERVER_KEY and/or FIREBASE_SENDER_ID are not defined"
            );
        }

        // create test application
        const application = await axios({
            data: {
                name: "test",
            },
            method: "post",
            url: `${UPS_URL}/rest/applications`,
        });
        pushApplicationID = application.data.pushApplicationID;
        masterSecret = application.data.masterSecret;

        // create android variant
        const variant = await axios({
            data: {
                googleKey: serverKey,
                name: "android",
                projectNumber: senderId,
            },
            method: "post",
            url: `${UPS_URL}/rest/applications/${pushApplicationID}/android`,
        });

        // create the mobile services with all the secrets
        mobileServices = generateMobileServices([
            generatePushService(
                senderId,
                variant.data.variantID,
                variant.data.secret
            ),
        ]);
    });

    after("delete ups application", async () => {
        // delete test application
        await axios({
            method: "delete",
            url: `${UPS_URL}/rest/applications/${pushApplicationID}`,
        });
    });

    before("wait for device is ready", async () => {
        await device.execute(async () => {
            await new Promise(resolve => {
                document.addEventListener("deviceready", resolve, false);
            });
        });
    });

    it("send and receive test notification", async () => {
        // register the device to UPS
        await device.execute(async (modules, _, mobileServices) => {
            const { init } = modules["@aerogear/app"];
            const { PushRegistration } = modules["@aerogear/push"];

            const app = init(mobileServices);

            const register = new PushRegistration(app.config);

            await register.register({ alias: "alias" });
        }, mobileServices);

        // start listening for notifications
        const notification: Promise<any> = device.execute(async modules => {
            const { PushRegistration } = modules["@aerogear/push"];

            return await new Promise(resolve => {
                PushRegistration.onMessageReceived(resolve);
            });
        });

        // send test notification
        sender({
            applicationId: pushApplicationID,
            masterSecret,
            url: UPS_URL,
        }).then(client => {
            client.sender.send(
                { alert: "test" },
                { criteria: { alias: ["alias"] } }
            );
        });

        // wait for the notification
        expect((await notification).message).to.equal("test");
    });
});
