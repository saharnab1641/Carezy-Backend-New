import { Schema, Document, model, Model } from "mongoose";
import { hash, compare } from "bcrypt";

export interface ILaboratory extends Document {
  firstName: String;
  lastName: String;
  username: String;
  gender: String;
  email: String;
  contact: String;
  authId: String;
}

export const LaboratorySchema: Schema<ILaboratory> = new Schema<ILaboratory>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    contact: {
      type: String,
      required: true,
      unique: true,
    },
    authId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const LaboratoryModel: Model<ILaboratory> = model(
  "laboratory",
  LaboratorySchema
);

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
