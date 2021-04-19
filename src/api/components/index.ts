import { Router } from "express";
import { AppointmentRoutes } from "./appointment/routes";

import { AuthRoutes } from "./auth/routes";
import { PatientRoutes } from "./patient/routes";

export interface IComponentRoutes<T> {
  readonly controller: T;
  readonly router: Router;

  initRoutes(): void;
  initChildRoutes?(): void;
}

export function registerApiRoutes(router: Router, prefix: string = ""): void {
  router.use(`${prefix}/auth`, new AuthRoutes().router);
  router.use(`${prefix}/appointment`, new AppointmentRoutes().router);
}
