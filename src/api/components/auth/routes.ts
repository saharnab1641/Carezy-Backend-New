import { Router } from "express";
import { FileTransferService } from "../../../services/file-transfer";

import { IComponentRoutes } from "../index";
import { AuthController } from "./controller";

export class AuthRoutes implements IComponentRoutes<AuthController> {
  readonly controller: AuthController = new AuthController();
  readonly router: Router = Router();
  private fileTransferService: FileTransferService;

  public constructor() {
    this.fileTransferService = new FileTransferService();
    this.initRoutes();
  }

  initRoutes(): void {
    this.router.post("/signup", this.controller.doLocalRegister);
    this.router.post("/login", this.controller.doLocalLogin);
    this.router.post(
      "/updatepicture",
      this.fileTransferService.multer.single("file"),
      this.controller.updatePicture
    );
  }
}
