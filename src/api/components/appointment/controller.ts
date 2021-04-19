import { NextFunction, Request, Response } from "express";
import { MailService } from "../../../services/mail";
import {
  AppointmentModel,
  IAppointment,
  IManageAppointment,
  StatusOptions,
  IConsultation,
} from "./model";
import { bind } from "decko";
import { DoctorModel } from "../doctor/model";
import { PatientModel } from "../patient/model";

export class AppointmentController {
  readonly mailService: MailService;

  constructor() {
    this.mailService = new MailService();
  }

  public async makeAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const newAppointment: Partial<IAppointment> = req.body;

      const appointment: IAppointment = await AppointmentModel.create(
        newAppointment
      );

      await PatientModel.updateOne(
        { _id: appointment.patientid },
        { $push: { appointments: appointment._id } }
      );

      return res.json({ appointmentId: appointment._id });
    } catch (err) {
      return next(err);
    }
  }

  public async manageAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const manageDetails: IManageAppointment = req.body;
      const appointment: IAppointment = await AppointmentModel.findById(
        manageDetails.appointmentId
      );

      await AppointmentModel.updateOne(
        { _id: appointment.id },
        { message: manageDetails.message, status: manageDetails.status }
      );

      if (manageDetails.status === StatusOptions.ACCEPTED) {
        await DoctorModel.updateOne(
          { _id: appointment.doctorid },
          { $push: { appointments: appointment._id } }
        );
      }
      return res.json({});
    } catch (err) {
      return next(err);
    }
  }

  public async endConsultation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const newConsultation: IConsultation = req.body.consultation;

      const appointment = await AppointmentModel.updateOne(
        { _id: req.body.appointmentId },
        {
          consultationDetails: newConsultation,
          status: StatusOptions.CONSULTED,
          message: req.body.message,
        }
      );

      return res.json({ appointmentId: appointment._id });
    } catch (err) {
      return next(err);
    }
  }
}
