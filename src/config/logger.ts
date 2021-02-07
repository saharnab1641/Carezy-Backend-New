import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { createLogger, format, transports } from "winston";

import { env } from "./globals";

const logDir = "logs";

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

const errorLog = join(logDir, "error.log");
const requestLog = join(logDir, "request.log");
const combinedLog = join(logDir, "combined.log");
const exceptionsLog = join(logDir, "exceptions.log");

const isRequest = format((info, opts) => {
  if (info.isRequest) {
    return info;
  }
  return false;
});

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.File({
      filename: errorLog,
      level: "error",
    }),
    new transports.File({
      filename: requestLog,
      format: format.combine(isRequest()),
    }),
    new transports.File({
      filename: combinedLog,
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: exceptionsLog,
    }),
  ],
});

if (env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
      level: "debug",
    })
  );
}
