import { Router } from "express";
import { IComponentRoutes } from "../index";
import { PractitionerController } from "./controller";
import { AuthService } from "../../../services/auth";

export class PractitionerRoutes
  implements IComponentRoutes<PractitionerController>
{
  readonly controller: PractitionerController = new PractitionerController();
  readonly router: Router = Router();
  private authService: AuthService;

  public constructor() {
    this.authService = new AuthService();
    this.initRoutes();
  }

  initRoutes(): void {
    this.router.post(
      "/getpractitioners",
      // this.authService.isAuthorized(),
      this.controller.getPractitioners
    );
    this.router.post(
      "/getpractitioner",
      // this.authService.isAuthorized(),
      this.controller.getPractitioner
    );
    this.router.post(
      "/addspecialization",
      // this.authService.isAuthorized(),
      this.controller.addSpecialization
    );
    this.router.get(
      "/getspecializations",
      // this.authService.isAuthorized(),
      this.controller.getSpecializations
    );
  }
}
