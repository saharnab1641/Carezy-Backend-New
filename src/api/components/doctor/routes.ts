import { Router } from "express";
import { IComponentRoutes } from "../index";
import { DoctorController } from "./controller";
import { AuthService } from "../../../services/auth";

export class DoctorRoutes implements IComponentRoutes<DoctorController> {
  readonly controller: DoctorController = new DoctorController();
  readonly router: Router = Router();
  authService: AuthService;

  public constructor() {
    this.authService = new AuthService();
    this.initRoutes();
  }

  initRoutes(): void {}
}
