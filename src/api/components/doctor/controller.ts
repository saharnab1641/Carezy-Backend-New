import { NextFunction, Request, Response } from "express";
import { MailService } from "../../../services/mail";

import { bind } from "decko";
import { DoctorModel } from "../doctor/model";
import { PatientModel } from "../patient/model";

export class DoctorController {
  readonly mailService: MailService;

  constructor() {
    this.mailService = new MailService();
  }
}
