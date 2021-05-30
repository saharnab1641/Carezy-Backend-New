import { NextFunction, Request, Response } from "express";
import { MailService } from "../../../services/mail";

import { bind } from "decko";
import {
  DoctorModel,
  IDoctor,
  ISpecialization,
  SpecializationModel,
} from "../doctor/model";
import { PatientModel } from "../patient/model";

export class DoctorController {
  readonly mailService: MailService;

  constructor() {
    this.mailService = new MailService();
  }

  public async addSpecialization(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const body: Partial<ISpecialization> = req.body;
      const specialization: ISpecialization = await SpecializationModel.create(
        body
      );
      return res.json({
        message: "Specialization added",
        id: specialization._id,
      });
    } catch (err) {
      return next(err);
    }
  }

  public async getSpecializations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const specializations: Array<ISpecialization> =
        await SpecializationModel.find({}).select({ _id: 0, __v: 0 }).exec();
      return res.json(specializations);
    } catch (err) {
      return next(err);
    }
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
      const doctors: Array<IDoctor> = await DoctorModel.find(filters)
        .select({
          firstName: 1,
          lastName: 1,
          gender: 1,
          username: 1,
          _id: 0,
          __v: 0,
        })
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
        .select({ _id: 0, authId: 0, appointments: 0, __v: 0 })
        .exec();
      res;
      return res.json(doctor);
    } catch (err) {
      return next(err);
    }
  }
}
