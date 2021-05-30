import { NextFunction, Request, Response } from "express";
import { MailService } from "../../../services/mail";
import { bind } from "decko";
import {
  IInvestigation,
  ILabReport,
  InvestigationModel,
  LabReportModel,
  LabReportSchema,
} from "./model";
import { v4 as uuidv4 } from "uuid";
import { PaymentService } from "../../../services/payment";
import { IReceipt, ReceiptModel } from "../receipt/model";
import { FileTransferService } from "../../../services/file-transfer";

export class LaboratoryController {
  readonly mailService: MailService;
  readonly paymentService: PaymentService;
  private fileTransferService: FileTransferService;

  constructor() {
    this.mailService = new MailService();
    this.paymentService = new PaymentService();
    this.fileTransferService = new FileTransferService();
  }

  public async addInvestigation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const body: Partial<IInvestigation> = req.body;
      const investigation: IInvestigation = await InvestigationModel.create(
        body
      );
      return res.json({
        message: "Investigation added",
        id: investigation._id,
      });
    } catch (err) {
      return next(err);
    }
  }

  public async getInvestigations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const investigations: Array<IInvestigation> =
        await InvestigationModel.find({}).select({ _id: 0, __v: 0 }).exec();
      return res.json(investigations);
    } catch (err) {
      return next(err);
    }
  }

  @bind
  public async createReportOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const body = {
        amount: req.body.amount,
        paymentRemarks: req.body.paymentRemarks,
      };

      const params = {
        amount: body.amount * 100,
        currency: "INR",
        receipt: uuidv4(),
      };
      const order = await this.paymentService.createOrder(params);

      const newReceipt: Partial<IReceipt> = {
        paymentSource: "app",
        receiptFor: "labreport",
        paymentRemarks: body.paymentRemarks,
        orderId: order.id,
        receiptId: order.receipt,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
      };

      await ReceiptModel.create(newReceipt);

      return res.json(newReceipt);
    } catch (err) {
      return next(err);
    }
  }

  @bind
  public async verifyReportPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const body = {
        receiptId: req.body.receiptId,
        orderId: req.body.razorpay_order_id,
        paymentId: req.body.razorpay_payment_id,
        signature: req.body.razorpay_signature,
        appointmentId: req.body.appointmentId,
        patientUsername: req.body.patientUsername,
        doctorUsername: req.body.doctorUsername,
        investigations: req.body.investigations,
      };

      if (
        !this.paymentService.verifyPayment(
          body.orderId,
          body.paymentId,
          body.signature
        )
      ) {
        res.json({ error: "Payment not verified." });
      }

      const reportArray = new Array();

      for (const investigation in body.investigations) {
        reportArray.push({
          investigation: investigation,
          status: "approved",
          appointmentId: body.appointmentId,
          patientUsername: body.patientUsername,
          doctorUsername: body.doctorUsername,
          receiptId: body.receiptId,
        });
      }

      const labReports: Array<ILabReport> = await LabReportModel.insertMany(
        reportArray
      );

      const resourceIds: Array<String> = labReports.map(
        (report: ILabReport) => {
          return report._id;
        }
      );

      await ReceiptModel.updateOne(
        { receiptId: body.receiptId },
        {
          resourceId: resourceIds,
          paymentId: body.paymentId,
          signature: body.signature,
          status: "paid",
        },
        { new: true }
      );

      return res.json({ message: "Payment verified", reportIds: resourceIds });
    } catch (err) {
      return next(err);
    }
  }

  public async getReports(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const filters: any = {};
      if (req.body.scheduledDateTime) {
        if (
          !req.body.scheduledDateTime.start &&
          !req.body.scheduledDateTime.end
        ) {
          return res.json({ error: "Include start and end date" });
        }

        const dayStart = new Date(req.body.scheduledDateTime.start);
        dayStart.setHours(0, 0, 0);
        const dayEnd = new Date(req.body.scheduledDateTime.end);
        dayEnd.setHours(23, 59, 59);
        filters.scheduledDateTime = {
          $gte: new Date(dayStart.toISOString()),
          $lte: new Date(dayEnd.toISOString()),
        };
      }

      if (req.body.resultDateTime) {
        if (!req.body.resultDateTime.start && !req.body.resultDateTime.end) {
          return res.json({ error: "Include start and end date" });
        }

        const dayStart = new Date(req.body.resultDateTime.start);
        dayStart.setHours(0, 0, 0);
        const dayEnd = new Date(req.body.resultDateTime.end);
        dayEnd.setHours(23, 59, 59);
        filters.resultDateTime = {
          $gte: new Date(dayStart.toISOString()),
          $lte: new Date(dayEnd.toISOString()),
        };
      }

      if (req.body.investigation) {
        filters.investigation = req.body.investigation;
      }

      if (req.body.appointmentId) {
        filters.appointmentId = req.body.appointmentId;
      }

      if (req.body.patientUsername) {
        filters.patientUsername = req.body.patientUsername;
      }

      if (req.body.doctorUsername) {
        filters.doctorUsername = req.body.doctorUsername;
      }

      if (req.body.labInchargeUsername) {
        filters.labInchargeUsername = req.body.labInchargeUsername;
      }

      if (req.body.status) {
        filters.status = req.body.status;
      }

      if (req.body.receiptId) {
        filters.receiptId = req.body.receiptId;
      }

      const reports = await LabReportModel.find(filters)
        .select({ createdAt: 0, updatedAt: 0, __v: 0 })
        .exec();
      return res.json(reports);
    } catch (err) {
      return next(err);
    }
  }

  public async setLabDate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const body = {
        reportId: req.body.reportId,
        scheduledDate: req.body.scheduled,
        scheduledTime: req.body.scheduledTime,
        instructions: req.body.instructions,
      };

      const scheduledDateTime = new Date(body.scheduledDate);
      scheduledDateTime.setHours(
        body.scheduledTime.hours,
        body.scheduledTime.minutes,
        0
      );

      await LabReportModel.findByIdAndUpdate(body.reportId, {
        scheduledDateTime: scheduledDateTime,
        instructions: body.instructions,
        status: "scheduled",
      });

      return res.json({ message: "Date set" });
    } catch (err) {
      return next(err);
    }
  }

  @bind
  public async uploadReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const body = {
        reportId: req.body.reportId,
        labInchargeUsername: req.body.labInchargeUsername,
        uploadDate: req.body.uploadDate,
        uploadTime: req.body.uploadTime,
        reportMessage: req.body.reportMessage,
      };

      if (!req.file) {
        res.json({ error: "File not uploaded" });
      }

      const resultDateTime = new Date(body.uploadDate);
      resultDateTime.setHours(
        body.uploadTime.hours,
        body.uploadTime.minutes,
        0
      );

      const response = await this.fileTransferService.uploadFile(
        "labreport",
        req.file.buffer,
        req.file.originalname
      );

      await LabReportModel.findByIdAndUpdate(body.reportId, {
        labInchargeUsername: body.labInchargeUsername,
        resultDateTime: resultDateTime,
        reportMessage: body.reportMessage,
        status: "completed",
        attachmentName: response,
      });

      return res.json({ message: "Report uploaded" });
    } catch (err) {
      return next(err);
    }
  }

  @bind
  public async downloadReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const body = {
        fileName: req.body.fileName,
      };

      await this.fileTransferService.downloadFile(body.fileName, "Report", res);
    } catch (err) {
      return next(err);
    }
  }
}
