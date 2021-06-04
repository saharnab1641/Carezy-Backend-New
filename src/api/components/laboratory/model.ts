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
  patientUsername: String;
  doctorUsername: String;
  status: String;
  scheduledDateTime: Date;
  instructions: String;
  resultDateTime: Date;
  labInchargeUsername: String;
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
    patientUsername: {
      type: String,
      required: true,
    },
    doctorUsername: {
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
    labInchargeUsername: {
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
