import { Router } from "express";
import { AppointmentRoutes } from "./appointment/routes";

import { AuthRoutes } from "./auth/routes";
import { HospitalRoutes } from "./hospital/routes";
import { LaboratoryRoutes } from "./laboratory/routes";
import { PatientRoutes } from "./patient/routes";
import { PractitionerRoutes } from "./practitioner/routes";

export interface IComponentRoutes<T> {
  readonly controller: T;
  readonly router: Router;

  initRoutes(): void;
  initChildRoutes?(): void;
}

export function registerApiRoutes(router: Router, prefix: string = ""): void {
  router.use(`${prefix}/auth`, new AuthRoutes().router);
  router.use(`${prefix}/appointment`, new AppointmentRoutes().router);
  router.use(`${prefix}/practitioner`, new PractitionerRoutes().router);
  router.use(`${prefix}/patient`, new PatientRoutes().router);
  router.use(`${prefix}/laboratory`, new LaboratoryRoutes().router);
  router.use(`${prefix}/hospital`, new HospitalRoutes().router);
}
