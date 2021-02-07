import { Router } from "express";

import { UserRoutes } from "./user/routes";
import { AuthRoutes } from "./auth/routes";

export interface IComponentRoutes<T> {
  readonly controller: T;
  readonly router: Router;

  initRoutes(): void;
  initChildRoutes?(): void;
}

export function registerApiRoutes(router: Router, prefix: string = ""): void {
  router.use(`${prefix}/user`, new UserRoutes().router);
  router.use(`${prefix}/auth`, new AuthRoutes().router);
}
