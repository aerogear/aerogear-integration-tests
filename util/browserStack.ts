import axios from "axios";
import { BROWSERSTACK_KEY, BROWSERSTACK_USER } from "./config";

function auth(): string {
    const buff = Buffer.from(`${BROWSERSTACK_USER}:${BROWSERSTACK_KEY}`);
    return `Basic: ${buff.toString("base64")}`;
}

/**
 * https://www.browserstack.com/automate/network-simulation
 */
export async function updateNetwork(
    sessionId: string,
    networkProfile: "no-network" | "reset"
) {
    await axios.put(
        `https://api-cloud.browserstack.com/app-automate/sessions/${sessionId}/update_network.json`,
        { networkProfile },
        {
            headers: {
                Authorization: auth(),
                "Content-Type": "application/json",
            },
        }
    );
}
