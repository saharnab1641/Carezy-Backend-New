import { NextFunction, Request, Response } from "express";
import { MailService } from "../../../services/mail";

import { bind } from "decko";
import { DoctorModel, IDoctor } from "../doctor/model";
import { PatientModel } from "../patient/model";

export class DoctorController {
  readonly mailService: MailService;

  constructor() {
    this.mailService = new MailService();
  }

  public async getDoctors(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const filters: any = {};
      if (req.body.specialization)
        filters.specialization = req.body.specialization;
      console.log(filters);
      const doctors: Array<IDoctor> = await DoctorModel.find(filters)
        .select({ firstname: 1, lastname: 1, gender: 1, username: 1, _id: 0 })
        .exec();
      return res.json({ doctors });
    } catch (err) {
      return next(err);
    }
  }

  public async getDoctor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const doctorUsername = req.body.doctorUsername;

      const doctor: IDoctor = await DoctorModel.findOne({
        username: doctorUsername,
      })
        .select({ _id: 0, authId: 0, appointments: 0 })
        .exec();
      res;
      return res.json(doctor);
    } catch (err) {
      return next(err);
    }
  }
}
