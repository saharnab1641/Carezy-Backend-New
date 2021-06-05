import { NextFunction, Request, Response } from "express";
import { MailService } from "../../../services/mail";
import { bind } from "decko";
import { IPatient, PatientModel } from "./model";

export class PatientController {
  readonly mailService: MailService;

  constructor() {
    this.mailService = new MailService();
  }

  // public async getPatients(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<Response | void> {
  //   try {
  //     const filters: any = {};
  //     if (req.body.specialization)
  //       filters.specialization = req.body.specialization;
  //     const doctors: Array<IDoctor> = await DoctorModel.find(filters)
  //       .select({ firstname: 1, lastname: 1, gender: 1, username: 1, _id: 0 })
  //       .exec();
  //     return res.json({ doctors });
  //   } catch (err) {
  //     return next(err);
  //   }
  // }

  public async getPatient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const username = req.body.username;

      const patient: IPatient = await PatientModel.findOne({
        username: username,
      })
        .select({ _id: 0 })
        .exec();
      return res.json(patient);
    } catch (err) {
      return next(err);
    }
  }

  public async fillPatientInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      await PatientModel.updateOne(
        { username: req.body.patientUsername },
        req.body.patientInfo
      );
      return res.json({ message: "Details updated" });
    } catch (err) {
      return next(err);
    }
  }
}
