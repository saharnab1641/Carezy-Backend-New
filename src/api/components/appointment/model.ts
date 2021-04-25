import { Schema, Document, model, Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IManageAppointment {
  appointmentId: String;
  status: String;
  message: String;
  option: String;
}

export enum StatusOptions {
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  RESCHEDULED = "rescheduled",
  CONSULTED = "consulted",
}

export interface IAppointment extends Document {
  appointmentDateTime: Date;
  problem: String;
  status: String;
  patientUsername: String;
  doctorUsername: String;
  message: String;
  consultationDetails: IConsultation;
  DDSHash: String;
  amount: number;
  receiptId: String;
}

export interface IVitals extends Document {
  temperature: Number;
  bloodPressure: Number;
  pulseRate: Number;
  respiratoryRate: Number;
  height: Number;
  weight: Number;
}

export interface IConsultation extends Document {
  vitals: IVitals;
  chiefComplaints: String;
  diagnosis: String;
  advice: String;
}

const VitalsSchema: Schema<IVitals> = new Schema(
  {
    temperature: {
      type: Number,
    },
    bloodPressure: {
      type: Number,
    },
    pulseRate: {
      type: Number,
    },
    respiratoryRate: {
      type: Number,
    },
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
  },
  { _id: false }
);

const ConsultationSchema: Schema<IConsultation> = new Schema(
  {
    vitals: {
      type: VitalsSchema,
    },
    chiefComplaints: {
      type: String,
    },
    diagnosis: {
      type: String,
    },
    advice: {
      type: String,
    },
  },
  { _id: false }
);

export const AppointmentSchema: Schema<IAppointment> = new Schema(
  {
    appointmentDateTime: {
      type: Date,
      required: true,
    },
    problem: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
    patientUsername: {
      type: String,
      required: true,
    },
    doctorUsername: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    consultationDetails: {
      type: ConsultationSchema,
    },
    DDSHash: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    receiptId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

AppointmentSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 20 * 60,
    partialFilterExpression: { status: "pending" },
  }
);

export const AppointmentModel: Model<IAppointment> = model(
  "appointment",
  AppointmentSchema
);
