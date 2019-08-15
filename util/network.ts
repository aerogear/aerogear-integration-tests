// @ts-ignore
const fetch = require("node-fetch");

// @ts-ignore
const setNetwork = async profile => {
    const buff = Buffer.from(
        `${process.env.BROWSERSTACK_USER}:${process.env.BROWSERSTACK_KEY}`
    );
    await fetch(
        // @ts-ignore
        `https://api-cloud.browserstack.com/app-automate/sessions/${client.sessionId}/update_network.json`,
        {
            body: `{"networkProfile":"${profile}"}`,
            headers: {
                Authorization: `Basic ${buff.toString("base64")}`,
                "Content-Type": "application/json",
            },
            method: "PUT",
        }
    );
};

module.exports = { setNetwork };
