import debug = require("debug");
import * as os from "os";

const logger = debug("util/ip");

/**
 * Try to guess the LAN IP of the OS
 */
export function luckyIp(): string | null {
    const faces = os.networkInterfaces();

    for (const key in faces) {
        if (faces.hasOwnProperty(key)) {
            for (const info of faces[key]) {
                // only IPv4
                if ("IPv4" !== info.family) {
                    continue;
                }

                // skip local address
                if (info.internal) {
                    continue;
                }

                logger("using lucy ip: %s", info.address);

                // return of the first matched ip
                return info.address;
            }
        }
    }

    logger("no lucky ip founded");

    return null;
}
