import { Router } from "express";
import { IComponentRoutes } from "../index";
import { UserController } from "./controller";
import { AuthService } from "../../../services/auth";

export class UserRoutes implements IComponentRoutes<UserController> {
  readonly controller: UserController = new UserController();
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
  }
}
