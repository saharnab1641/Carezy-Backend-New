import compression from "compression";
import cors from "cors";
import helmet from "helmet";

import { json, NextFunction, Request, Response, Router } from "express";

import { logger } from "../../config/logger";
import { env } from "../../config/globals";

/**
 * Init Express middleware
 *
 * @param {Router} router
 * @returns {void}
 */
export function registerMiddleware(router: Router): void {
  router.use(helmet());

  if (env.NODE_ENV === "development") {
    router.use(cors({ origin: "*" }));
  } else {
    router.use(cors({ origin: ["http://localhost:4200"] }));
  }

  router.use(json());
  router.use(compression());

  // Log incoming requests
  router.use((req: Request, res: Response, next: NextFunction) => {
    if (env.NODE_ENV !== "test") {
      const ip: string | string[] | undefined =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      logger.log({
        isRequest: true,
        level: "info",
        message: `${req.method} ${req.url} ${ip}`,
      });
    }

    return next();
  });

  // Setup passport strategies
}
