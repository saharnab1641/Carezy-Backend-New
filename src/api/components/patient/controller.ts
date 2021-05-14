import { NextFunction, Request, Response } from "express";
import { MailService } from "../../../services/mail";
import { bind } from "decko";

export class PatientController {
  readonly mailService: MailService;

  constructor() {
    this.mailService = new MailService();
  }
}
