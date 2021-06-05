import { Schema, Document, model, Model } from "mongoose";
import { hash, compare } from "bcrypt";

export interface IInvestigation extends Document {
  name: String;
  description: String;
  code: String;
  cost: number;
}

export const InvestigationSchema: Schema<IInvestigation> =
  new Schema<IInvestigation>({
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
  });

export const InvestigationModel: Model<IInvestigation> = model(
  "investigation",
  InvestigationSchema
);

export interface ILabReport extends Document {
  investigation: String;
  appointmentId: String;
  patientId: String;
  patientFirstName: String;
  patientLastName: String;
  doctorId: String;
  doctorFirstName: String;
  doctorLastName: String;
  status: String;
  scheduledDateTime: Date;
  instructions: String;
  resultDateTime: Date;
  labInchargeId: String;
  labInchargeFirstName: String;
  labInchargeLastName: String;
  receiptId: String;
  reportMessage: String;
  attachmentName: String;
}

export const LabReportSchema: Schema<ILabReport> = new Schema<ILabReport>(
  {
    investigation: {
      type: String,
      required: true,
    },
    appointmentId: {
      type: String,
      required: true,
    },
    patientId: {
      type: String,
      required: true,
    },
    patientFirstName: {
      type: String,
      required: true,
    },
    patientLastName: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    doctorFirstName: {
      type: String,
      required: true,
    },
    doctorLastName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "scheduled", "completed"],
    },
    scheduledDateTime: {
      type: Date,
    },
    instructions: {
      type: String,
    },
    resultDateTime: {
      type: Date,
    },
    labInchargeId: {
      type: String,
    },
    labInchargeFirstName: {
      type: String,
    },
    lastInchargeLastName: {
      type: String,
    },
    receiptId: {
      type: String,
      required: true,
    },
    reportMessage: {
      type: String,
    },
    attachmentName: {
      type: String,
    },
  },
  { timestamps: true }
);

LabReportSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 20 * 60,
    partialFilterExpression: { status: "pending" },
  }
);

export const LabReportModel: Model<ILabReport> = model(
  "labreport",
  LabReportSchema
);
