import { createLogger, format, transports } from "winston";

export const log = createLogger({
    transports: [
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
            level: "debug",
        }),
    ],
});
