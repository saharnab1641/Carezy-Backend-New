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
import { SHA1, HmacSHA256 } from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import RazorPay from "razorpay";
import { env } from "../../../config/globals";
import { IReceipt, ReceiptModel } from "../receipt/model";

export class AppointmentController {
  readonly mailService: MailService;
  readonly payClient: any;

  constructor() {
    this.mailService = new MailService();
    this.payClient = new RazorPay({
      key_id: env.RAZORPAY_ID,
      key_secret: env.RAZORPAY_SECRET,
    });
  }

  public async getUsedSlots(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const dayStart = new Date(req.body.appointmentDate);
      dayStart.setHours(0, 0, 0);
      const dayEnd = new Date(req.body.appointmentDate);
      dayEnd.setHours(23, 59, 59);
      const slotsTaken = await AppointmentModel.find({
        doctorUsername: req.body.doctorUsername,
        appointmentDateTime: {
          $gte: new Date(dayStart.toISOString()),
          $lte: new Date(dayEnd.toISOString()),
        },
      })
        .sort({ appointmentDateTime: 1 })
        .select({ appointmentDateTime: 1, _id: 0 })
        .exec();

      return res.json({ usedSlots: slotsTaken });
    } catch (err) {
      return next(err);
    }
  }

  @bind
  public async makeAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const appointmentBody = req.body.appointmentDetails;
      const date = new Date(appointmentBody.appointmentDate);
      date.setHours(
        appointmentBody.appointmentSlot.hours,
        appointmentBody.appointmentSlot.minutes,
        0
      );

      const newAppointment: Partial<IAppointment> = {
        appointmentDateTime: date,
        problem: appointmentBody.problem,
        patientUsername: appointmentBody.patientUsername,
        doctorUsername: appointmentBody.doctorUsername,
        amount: appointmentBody.amount,
        DDSHash: SHA1(
          appointmentBody.doctorUsername +
            appointmentBody.appointmentDate +
            appointmentBody.appointmentSlot.hours +
            appointmentBody.appointmentSlot.minutes
        ).toString(),
        receiptId: uuidv4(),
        status: "pending",
        paymentSource: req.body.paymentSource,
      };

      const appointment: IAppointment = await AppointmentModel.create(
        newAppointment
      );

      switch (req.body.paymentSource) {
        case "app": {
          const params = {
            amount: appointment.amount * 100,
            currency: "INR",
            receipt: appointment.receiptId,
          };
          const order = await this.payClient.orders.create(params);

          const newReceipt: Partial<IReceipt> = {
            paymentSource: "app",
            resourceId: appointment._id,
            receiptFor: "appointment",
            orderId: order.id,
            receiptId: order.receipt,
            amount: order.amount,
            currency: order.currency,
            status: order.status,
          };

          await ReceiptModel.create(newReceipt);

          return res.json(newReceipt);
        }
        case "reception": {
          const newReceipt: Partial<IReceipt> = {
            paymentSource: "reception",
            resourceId: appointment._id,
            receiptFor: "appointment",
            receiptId: appointment.receiptId,
            amount: appointment.amount,
            currency: "INR",
            status: "created",
          };

          await ReceiptModel.create(newReceipt);

          return res.json(newReceipt);
        }
      }
    } catch (err) {
      return next(err);
    }
  }

  public async freeAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const freeDetails = {
        receiptId: req.body.receiptId,
      };
      await AppointmentModel.findOneAndDelete({
        receiptId: freeDetails.receiptId,
      });
      await ReceiptModel.findOneAndUpdate(
        { receiptId: freeDetails.receiptId },
        { status: "abandoned" }
      );
      return res.json({ deleted: true });
    } catch (err) {
      return next(err);
    }
  }

  @bind
  public async verifyPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      switch (req.body.paymentSource) {
        case "app": {
          const paymentDetails = {
            orderId: req.body.paymentDetails.razorpay_order_id,
            paymentId: req.body.paymentDetails.razorpay_payment_id,
            signature: req.body.paymentDetails.razorpay_signature,
          };

          const body = paymentDetails.orderId + "|" + paymentDetails.paymentId;
          const signature = HmacSHA256(body, env.RAZORPAY_SECRET).toString();
          if (signature === paymentDetails.signature) {
            const receipt: IReceipt = await ReceiptModel.updateOne(
              { orderId: paymentDetails.orderId },
              {
                paymentId: paymentDetails.orderId,
                signature: signature,
                status: "paid",
              },
              { new: true }
            );

            await AppointmentModel.updateOne(
              { receiptId: receipt.receiptId },
              { status: "approved", message: req.body.message || "approved" }
            );

            return res.json({ status: "Transaction verified" });
          } else {
            return res.json({ error: "Payment Verification Failed" });
          }
        }
        case "reception": {
          const paymentDetails = {
            receiptId: req.body.receiptId,
            paymentRemarks: req.body.paymentRemarks,
          };
          await ReceiptModel.updateOne(
            { receiptId: paymentDetails.receiptId },
            {
              paymentRemarks: paymentDetails.paymentRemarks,
              status: "paid",
            }
          );

          await AppointmentModel.updateOne(
            { receiptId: paymentDetails.receiptId },
            { status: "approved", message: req.body.message || "approved" }
          );

          return res.json({ status: "Transaction saved" });
        }
        default: {
          res.json({ message: "Include valid payment source" });
        }
      }
    } catch (err) {
      return next(err);
    }
  }

  public async getAppointments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const filters: any = {};
      if (req.body.date) {
        if (!req.body.date.start && !req.body.date.end) {
          return res.json({ error: "Include start and end date" });
        }

        const dayStart = new Date(req.body.date.start);
        dayStart.setHours(0, 0, 0);
        const dayEnd = new Date(req.body.date.end);
        dayEnd.setHours(23, 59, 59);
        filters.appointmentDateTime = {
          $gte: new Date(dayStart.toISOString()),
          $lte: new Date(dayEnd.toISOString()),
        };
      }

      if (req.body.patientUsername) {
        filters.patientUsername = req.body.patientUsername;
      }

      if (req.body.doctorUsername) {
        filters.doctorUsername = req.body.doctorUsername;
      }

      if (req.body.status) {
        filters.status = req.body.status;
      }

      const appointments = await AppointmentModel.find(filters)
        .select({ DDSHash: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .exec();
      return res.json({ appointments });
    } catch (err) {
      return next(err);
    }
  }

  public async manageAppointmentStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const body: any = {
        status: req.body.status,
        appointmentId: req.body.appointmentId,
        receiptId: req.body.receiptId,
        paymentSource: req.body.paymentSource,
        message: req.body.message,
      };

      switch (body.status) {
        case "inclinic": {
          await AppointmentModel.updateOne(
            { _id: body.appointmentId },
            { status: body.status, message: body.message }
          );
          break;
        }
        case "rejected": {
          if (body.paymentSource === "app") {
            const receipt: IReceipt = await ReceiptModel.findOne({
              receiptId: body.receiptId,
            }).exec();
            await this.payClient.refund(receipt.paymentId);
          }
          await ReceiptModel.updateOne(
            { receiptId: body.receiptId },
            { status: "refunded" }
          );
          await AppointmentModel.updateOne(
            { _id: body.appointmentId },
            { status: body.status, message: body.message, DDSHash: uuidv4() }
          );
          break;
        }
      }
      return res.json({ message: "Status updated" });
    } catch (err) {
      return next(err);
    }
  }
}
