import { NextFunction, Request, Response } from "express";
import { MailService } from "../../../services/mail";
import { AppointmentModel, IAppointment, IConsultation } from "./model";
import { bind } from "decko";
import { IPatient, PatientModel } from "../patient/model";
import { SHA1 } from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import { env } from "../../../config/globals";
import { IReceipt, ReceiptModel } from "../receipt/model";
import { FileTransferService } from "../../../services/file-transfer";
import { PaymentService } from "../../../services/payment";
import { IPractitioner, PractitionerModel } from "../practitioner/model";
import { ClientSession, startSession } from "mongoose";

export class AppointmentController {
  readonly mailService: MailService;
  readonly paymentService: PaymentService;
  private fileTransferService: FileTransferService;

  constructor() {
    this.mailService = new MailService();
    this.fileTransferService = new FileTransferService();
    this.paymentService = new PaymentService();
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
        status: env.APPOINTMENT_STATUS.approved,
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

      const patient: IPatient = await PatientModel.findOne({
        username: appointmentBody.patientUsername,
      })
        .select({ firstName: 1, lastName: 1 })
        .exec();

      const doctor: IPractitioner = await PractitionerModel.findOne({
        username: appointmentBody.doctorUsername,
      })
        .select({ firstName: 1, lastName: 1 })
        .exec();

      const newAppointment: Partial<IAppointment> = {
        appointmentDateTime: date,
        problem: appointmentBody.problem,
        patientUsername: appointmentBody.patientUsername,
        patientFirstName: patient.firstName,
        patientLastName: patient.lastName,
        doctorUsername: appointmentBody.doctorUsername,
        doctorFirstName: doctor.firstName,
        doctorLastName: doctor.lastName,
        amount: doctor.fees,
        DDSHash: SHA1(
          appointmentBody.doctorUsername +
            appointmentBody.appointmentDate +
            appointmentBody.appointmentSlot.hours +
            appointmentBody.appointmentSlot.minutes
        ).toString(),
        receiptId: uuidv4(),
        status: env.APPOINTMENT_STATUS.pending,
        paymentSource: req.body.paymentSource,
      };

      const appointment: IAppointment = await AppointmentModel.create(
        newAppointment
      );

      let newReceipt: Partial<IReceipt> = {};

      switch (req.body.paymentSource) {
        case env.PAYMENT_SOURCE.app: {
          const params = {
            amount: appointment.amount * 100,
            currency: "INR",
            receipt: appointment.receiptId,
          };
          const order = await this.paymentService.createOrder(params);

          newReceipt = {
            paymentSource: env.PAYMENT_SOURCE.app,
            resourceId: [appointment._id],
            receiptFor: "appointment",
            orderId: order.id,
            receiptId: order.receipt,
            amount: order.amount,
            currency: order.currency,
            status: order.status,
          };
          break;
        }
        case env.PAYMENT_SOURCE.reception: {
          newReceipt = {
            paymentSource: env.PAYMENT_SOURCE.reception,
            resourceId: [appointment._id],
            receiptFor: "appointment",
            receiptId: appointment.receiptId,
            amount: appointment.amount,
            currency: "INR",
            status: env.RECEIPT_STATUS.created,
          };
          break;
        }
      }

      await ReceiptModel.create(newReceipt);
      return res.json(newReceipt);
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
        { status: env.RECEIPT_STATUS.abandoned }
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
        case env.PAYMENT_SOURCE.app: {
          const paymentDetails = {
            orderId: req.body.paymentDetails.razorpay_order_id,
            paymentId: req.body.paymentDetails.razorpay_payment_id,
            signature: req.body.paymentDetails.razorpay_signature,
          };

          if (
            this.paymentService.verifyPayment(
              paymentDetails.orderId,
              paymentDetails.paymentId,
              paymentDetails.signature
            )
          ) {
            const receipt: IReceipt = await ReceiptModel.updateOne(
              { orderId: paymentDetails.orderId },
              {
                paymentId: paymentDetails.paymentId,
                signature: paymentDetails.signature,
                status: env.RECEIPT_STATUS.paid,
              },
              { new: true }
            );

            await AppointmentModel.updateOne(
              { receiptId: receipt.receiptId },
              {
                status: env.APPOINTMENT_STATUS.approved,
                message: req.body.message,
              }
            );

            return res.json({ status: "Transaction verified" });
          } else {
            return res.json({ error: "Payment Verification Failed" });
          }
        }
        case env.PAYMENT_SOURCE.reception: {
          const paymentDetails = {
            receiptId: req.body.receiptId,
            paymentRemarks: req.body.paymentRemarks,
          };
          await ReceiptModel.updateOne(
            { receiptId: paymentDetails.receiptId },
            {
              paymentRemarks: paymentDetails.paymentRemarks,
              status: env.RECEIPT_STATUS.paid,
            }
          );

          await AppointmentModel.updateOne(
            { receiptId: paymentDetails.receiptId },
            {
              status: env.APPOINTMENT_STATUS.approved,
              message: req.body.message,
            }
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

      if (req.body.patientName) {
        if (
          !(req.body.patientName.firstName && req.body.patientName.lastName)
        ) {
          return res.json({ error: "Provide patient first and last name." });
        }
        filters.$and = [
          {
            patientFirstName: new RegExp(
              "^" + req.body.patientName.firstName + "$",
              "i"
            ),
          },
          {
            patientLastName: new RegExp(
              "^" + req.body.patientName.lastName + "$",
              "i"
            ),
          },
        ];
      }

      if (req.body.doctorName) {
        if (!(req.body.doctorName.firstName && req.body.doctorName.lastName)) {
          return res.json({ error: "Provide doctor first and last name." });
        }
        filters.$and = [
          {
            doctorFirstName: new RegExp(
              "^" + req.body.doctorName.firstName + "$",
              "i"
            ),
          },
          {
            doctorLastName: new RegExp(
              "^" + req.body.doctorName.lastName + "$",
              "i"
            ),
          },
        ];
      }

      const appointments = await AppointmentModel.find(filters)
        .select({ DDSHash: 0, createdAt: 0, updatedAt: 0 })
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
        message: req.body.message,
      };

      const appointment: IAppointment = await AppointmentModel.findById(
        body.appointmentId
      )
        .select({ receiptId: 1, paymentSource: 1 })
        .exec();

      switch (body.status) {
        case env.APPOINTMENT_STATUS.inclinic: {
          await AppointmentModel.findByIdAndUpdate(body.appointmentId, {
            status: body.status,
            message: body.message,
          });
          break;
        }
        case env.APPOINTMENT_STATUS.rejected: {
          if (appointment.paymentSource === env.PAYMENT_SOURCE.app) {
            const receipt: IReceipt = await ReceiptModel.findOne({
              receiptId: appointment.receiptId,
            }).exec();
            await this.paymentService.refund(receipt.paymentId);
          }
          await ReceiptModel.updateOne(
            { receiptId: appointment.receiptId },
            { status: env.RECEIPT_STATUS.refunded }
          );
          await AppointmentModel.updateOne(
            { _id: body.appointmentId },
            {
              status: body.status,
              message: body.message,
              DDSHash: uuidv4(),
            }
          );
          break;
        }
      }
      return res.json({ message: "Status updated" });
    } catch (err) {
      return next(err);
    }
  }

  @bind
  public async endConsultation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { appointmentId, ...consultationDetails }: any = { ...req.body };
      if (req.file) {
        const response = await this.fileTransferService.uploadFile(
          "consultation",
          req.file,
          true
        );

        consultationDetails.attachmentName = response;
      }

      const setFields: any = {};

      for (const field in consultationDetails) {
        setFields["consultationDetails." + field] = consultationDetails[field];
      }

      await AppointmentModel.findByIdAndUpdate(req.body.appointmentId, {
        $set: { ...setFields },
        status: env.APPOINTMENT_STATUS.consulted,
      });
      return res.json({ message: "Session saved" });
    } catch (err) {
      return next(err);
    }
  }

  public async setVitals(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const body: any = {
        nurseUsername: req.body.nurseUsername,
        appointmentId: req.body.appointmentId,
        vitals: req.body.vitals,
      };

      const nurse: IPractitioner = await PractitionerModel.findOne({
        username: body.nurseUsername,
      })
        .select({ firstName: 1, lastName: 1 })
        .exec();

      await AppointmentModel.findByIdAndUpdate(body.appointmentId, {
        nurseUsername: body.nurseUsername,
        nurseFirstName: nurse.firstName,
        nurseLastName: nurse.lastName,
        $set: { "consultationDetails.vitals": body.vitals },
      });

      return res.json({ message: "Vitals set" });
    } catch (err) {
      return next(err);
    }
  }

  @bind
  public async downloadConsultation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const body = {
        fileName: req.body.fileName,
      };

      await this.fileTransferService.downloadFile(
        body.fileName,
        "Consultation",
        res
      );
    } catch (err) {
      return next(err);
    }
  }
}
