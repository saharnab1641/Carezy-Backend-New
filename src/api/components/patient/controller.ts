import { NextFunction, Request, Response } from "express";
import { MailService } from "../../../services/mail";
import { bind } from "decko";

export class PatientController {
  readonly mailService: MailService;

  constructor() {
    this.mailService = new MailService();
  }

  public async readUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      return res.json({ data: req.user });
    } catch (err) {
      return next(err);
    }
  }

  // @bind
  // public async test(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<Response | void> {
  //   try {
  //     this.mailService.sendMail(
  //       "arnab.saha2017@vitstudent.ac.in",
  //       "Test",
  //       "Test"
  //     );
  //     return res.json({ data: "TestData" });
  //   } catch (err) {
  //     return next(err);
  //   }
  // }
}
