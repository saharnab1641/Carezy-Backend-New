import { Router } from "express";
import { IComponentRoutes } from "../index";
import { LaboratoryController } from "./controller";
import { AuthService } from "../../../services/auth";
import { FileTransferService } from "../../../services/file-transfer";

export class LaboratoryRoutes
  implements IComponentRoutes<LaboratoryController>
{
  readonly controller: LaboratoryController = new LaboratoryController();
  readonly router: Router = Router();
  private fileTransferService: FileTransferService;
  private authService: AuthService;

  public constructor() {
    this.authService = new AuthService();
    this.fileTransferService = new FileTransferService();
    this.initRoutes();
  }

  initRoutes(): void {
    this.router.post(
      "/addinvestigation",
      // this.authService.isAuthorized(),
      this.controller.addInvestigation
    );
    this.router.get(
      "/getinvestigations",
      // this.authService.isAuthorized(),
      this.controller.getInvestigations
    );
    this.router.post(
      "/createappointmentreportorder",
      // this.authService.isAuthorized(),
      this.controller.createAppointmentReportOrder
    );
    this.router.post(
      "/verifyappointmentreportpayment",
      // this.authService.isAuthorized(),
      this.controller.verifyAppointmentReportPayment
    );
    this.router.get(
      "/getreports",
      // this.authService.isAuthorized(),
      this.controller.getReports
    );
    this.router.post(
      "/setlabdate",
      // this.authService.isAuthorized(),
      this.controller.setLabDate
    );
    this.router.post(
      "/uploadreport",
      // this.authService.isAuthorized(),
      this.fileTransferService.multer.single("file"),
      this.controller.uploadReport
    );
    this.router.get(
      "/downloadreport",
      // this.authService.isAuthorized(),
      this.controller.downloadReport
    );
  }
}
