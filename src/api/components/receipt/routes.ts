import { Router } from "express";
import { IComponentRoutes } from "../index";
import { ReceiptController } from "./controller";
import { AuthService } from "../../../services/auth";

export class ReceiptRoutes implements IComponentRoutes<ReceiptController> {
  readonly controller: ReceiptController = new ReceiptController();
  readonly router: Router = Router();
  authService: AuthService;

  public constructor() {
    this.authService = new AuthService();
    this.initRoutes();
  }

  initRoutes(): void {}
}
