import fetch from "node-fetch";
import { device } from "./device";

export async function setNetwork(profile: string) {
    const buff = Buffer.from(
        `${process.env.BROWSERSTACK_USER}:${process.env.BROWSERSTACK_KEY}`
    );
    await fetch(
        `https://api-cloud.browserstack.com/app-automate/sessions/${device.browser.sessionId}/update_network.json`,
        {
            body: `{"networkProfile":"${profile}"}`,
            headers: {
                Authorization: `Basic ${buff.toString("base64")}`,
                "Content-Type": "application/json",
            },
            method: "PUT",
        }
    );
}
