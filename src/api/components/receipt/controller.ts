import { NextFunction, Request, Response } from "express";
import { MailService } from "../../../services/mail";
import { bind } from "decko";
import RazorPay from "razorpay";
import { env } from "../../../config/globals";

export class ReceiptController {}
