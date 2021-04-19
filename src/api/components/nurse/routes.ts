import { Router } from "express";
import { IComponentRoutes } from "../index";
import { NurseController } from "./controller";
import { AuthService } from "../../../services/auth";

export class NurseRoutes implements IComponentRoutes<NurseController> {
  readonly controller: NurseController = new NurseController();
  readonly router: Router = Router();
  authService: AuthService;

  public constructor() {
    this.authService = new AuthService();
    this.initRoutes();
  }

  initRoutes(): void {}
}
