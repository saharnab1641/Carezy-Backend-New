import { NextFunction, Request, Response } from "express";
import { MailService } from "../../../services/mail";

import {
  PractitionerModel,
  IPractitioner,
  ISpecialization,
  SpecializationModel,
} from "../practitioner/model";

export class PractitionerController {
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
        await SpecializationModel.find({}).select({ _id: 0 }).exec();
      return res.json(specializations);
    } catch (err) {
      return next(err);
    }
  }

  public async getPractitioners(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const filters: any = {
        role: req.body.role,
      };
      if (req.body.specialization)
        filters.specialization = req.body.specialization;
      const practitioners: Array<IPractitioner> = await PractitionerModel.find(
        filters
      )
        .select({
          firstName: 1,
          lastName: 1,
          gender: 1,
          username: 1,
          _id: 0,
        })
        .exec();
      return res.json({ practitioners });
    } catch (err) {
      return next(err);
    }
  }

  public async getPractitioner(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const username = req.body.username;

      const practitioner: IPractitioner = await PractitionerModel.findOne({
        username,
      })
        .select({ _id: 0 })
        .exec();
      res;
      return res.json(practitioner);
    } catch (err) {
      return next(err);
    }
  }
}
