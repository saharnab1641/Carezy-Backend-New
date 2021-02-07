import { registerApiRoutes } from "./components";
import { registerMiddleware } from "./middleware";

import { Router } from "express";

export function initRestRoutes(router: Router): void {
  const prefix: string = "/api/v1";

  registerMiddleware(router);
  registerApiRoutes(router, prefix);
}
