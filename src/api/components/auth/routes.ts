import { Router } from "express";

import { IComponentRoutes } from "../index";
import { AuthController } from "./controller";

export class AuthRoutes implements IComponentRoutes<AuthController> {
  readonly controller: AuthController = new AuthController();
  readonly router: Router = Router();

  public constructor() {
    this.initRoutes();
  }

  initRoutes(): void {
    this.router.post("/signup", this.controller.doLocalRegister);
    this.router.post("/login", this.controller.doLocalLogin);
  }
}
