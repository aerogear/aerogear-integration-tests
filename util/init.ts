import { Local } from "browserstack-local";
import { BROWSERSTACK_APP, BROWSERSTACK_KEY } from "./config";
import { device } from "./device";

let browserstackLocal: Local;

before("start browserstack local", async function() {
    this.timeout(0);

    if (BROWSERSTACK_APP !== undefined) {
        browserstackLocal = new Local();

        await new Promise((resolve, reject) => {
            browserstackLocal.start(
                { key: BROWSERSTACK_KEY },
                (error?: Error) => {
                    if (error === undefined) {
                        resolve();
                    } else {
                        reject(error);
                    }
                }
            );
        });
    }
});

before("init device", async function() {
    this.timeout(0);

    await device.init();
});

before("wait for cordova device ready", async function() {
    this.timeout(0);

    await device.execute(async () => {
        await new Promise(resolve => {
            document.addEventListener("deviceready", resolve, false);
        });
    });
});

after("close device", async () => {
    await device.close();
});

after("close browserstack local", async () => {
    if (browserstackLocal !== undefined) {
        await new Promise((resolve, reject) => {
            browserstackLocal.stop((error?: Error) => {
                if (error === undefined) {
                    resolve();
                } else {
                    reject(error);
                }
            });
        });
    }
});
