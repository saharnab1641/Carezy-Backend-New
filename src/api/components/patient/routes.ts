import { Router } from "express";
import { IComponentRoutes } from "../index";
import { PatientController } from "./controller";
import { AuthService } from "../../../services/auth";

export class PatientRoutes implements IComponentRoutes<PatientController> {
  readonly controller: PatientController = new PatientController();
  readonly router: Router = Router();
  authService: AuthService;

  public constructor() {
    this.authService = new AuthService();
    this.initRoutes();
  }

  initRoutes(): void {
    this.router.get(
      "/profile",
      this.authService.isAuthorized(),
      this.controller.readUsers
    );
    this.router.get("/test", this.controller.test);
  }
}