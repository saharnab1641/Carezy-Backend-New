import { NextFunction, Request, Response } from "express";
import { MailService } from "../../../services/mail";
import { bind } from "decko";
import RazorPay from "razorpay";
import { env } from "../../../config/globals";

export class ReceiptController {
  readonly mailService: MailService;
  readonly payClient: any;

  constructor() {
    this.mailService = new MailService();
    this.payClient = new RazorPay({
      key_id: env.RAZORPAY_ID,
      key_secret: env.RAZORPAY_SECRET,
    });
  }

  public async createOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      // const params = {
      //     amount: req.body.amount * 100,
      //     currency: "INR",
      //     receipt: nanoid(),
      //     payment_capture: "1"
      // }
      // razorPayInstance.orders.create(params)
    } catch (err) {
      return next(err);
    }
  }
}
