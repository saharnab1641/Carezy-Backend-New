import { Router } from "express";
import { IComponentRoutes } from "../index";
import { AppointmentController } from "./controller";
import { AuthService } from "../../../services/auth";

export class AppointmentRoutes
  implements IComponentRoutes<AppointmentController>
{
  readonly controller: AppointmentController = new AppointmentController();
  readonly router: Router = Router();
  authService: AuthService;

  public constructor() {
    this.authService = new AuthService();
    this.initRoutes();
  }

  initRoutes(): void {
    this.router.post(
      "/makeappointment",
      // this.authService.isAuthorized(),
      this.controller.makeAppointment
    );
    this.router.post(
      "/getusedslots",
      // this.authService.isAuthorized(),
      this.controller.getUsedSlots
    );
    this.router.post(
      "/freeappointment",
      // this.authService.isAuthorized(),
      this.controller.freeAppointment
    );
    this.router.post(
      "/verifypayment",
      // this.authService.isAuthorized(),
      this.controller.verifyPayment
    );
    this.router.get(
      "/getappointments",
      // this.authService.isAuthorized(),
      this.controller.getAppointments
    );
  }
}
