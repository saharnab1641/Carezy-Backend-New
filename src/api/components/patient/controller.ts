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
      });
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
      const body: any = {
        bloodGroup: req.body.bloodGroup,
        personalHistory: req.body.personalHistory,
        familyHistory: req.body.familyHistory,
        ongoingMedications: req.body.ongoingMedications,
        allergies: req.body.allergies,
        lifestyle: req.body.lifestyle,
        surgeries: req.body.surgeries,
        immunization: req.body.immunization,
      };

      Object.keys(body).forEach(
        (key) =>
          (body[key] === undefined ||
            body[key] === null ||
            body[key] === NaN) &&
          delete body[key]
      );

      await PatientModel.updateOne(
        { username: req.body.patientUsername },
        body
      );
      return res.json({ message: "Details updated" });
    } catch (err) {
      return next(err);
    }
  }
}
