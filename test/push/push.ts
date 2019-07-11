import { AeroGearConfiguration } from "@aerogear/core";
import axios from "axios";
import { expect } from "chai";
import * as sender from "unifiedpush-node-sender";
import { MOBILE_PLATFORM, MobilePlatform, UPS_URL } from "../../util/config";
import { bootstrapDevice, Device } from "../../util/device";
import { generateConfig, generatePushService } from "../../util/mobileServices";

describe("Push", function() {
    // skip push tests in ios
    if (MOBILE_PLATFORM === MobilePlatform.IOS) {
        return;
    }

    this.timeout(0);

    let device: Device;
    let mobileServices: AeroGearConfiguration;
    let pushApplicationID: string;
    let masterSecret: string;

    before("boot device", async () => {
        device = await bootstrapDevice();
    });

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
        mobileServices = generateConfig([
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
        // register the device to firebase
        const registrationId = await device.execute(async (_, universe) => {
            const push = (window as any).PushNotification.init({
                android: {},
                ios: {},
            });

            const { registrationId } = await new Promise((resolve, reject) => {
                push.on("registration", resolve);
                push.on("error", reject);
            });

            universe.push = push;

            return registrationId;
        });

        // register the device to UPS
        await device.execute(
            async (modules, _, mobileServices, registrationId) => {
                const { init } = modules["@aerogear/app"];
                const { PushRegistration } = modules["@aerogear/push"];

                const app = init(mobileServices);

                const register = new PushRegistration(app.config);
                await register.register(registrationId, "alias");
            },
            mobileServices,
            registrationId
        );

        // start listening for notifications
        const notification: Promise<any> = device.execute(
            async (_, { push }) => {
                return await new Promise((resolve, reject) => {
                    push.on("notification", resolve);
                    push.on("error", reject);
                });
            }
        );

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
