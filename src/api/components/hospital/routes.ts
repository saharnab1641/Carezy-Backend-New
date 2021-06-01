import { Router } from "express";
import { IComponentRoutes } from "../index";
import { HospitalController } from "./controller";
import { AuthService } from "../../../services/auth";
import { FileTransferService } from "../../../services/file-transfer";

export class HospitalRoutes implements IComponentRoutes<HospitalController> {
  readonly controller: HospitalController = new HospitalController();
  readonly router: Router = Router();
  private authService: AuthService;
  private fileTransferService: FileTransferService;

  public constructor() {
    this.authService = new AuthService();
    this.fileTransferService = new FileTransferService();
    this.initRoutes();
  }

  initRoutes(): void {
    this.router.post(
      "/addArticle",
      // this.authService.isAuthorized(),
      this.fileTransferService.multer.single("file"),
      this.controller.addArticle
    );
    this.router.post(
      "/getArticles",
      // this.authService.isAuthorized(),
      this.controller.getArticles
    );
  }
}
