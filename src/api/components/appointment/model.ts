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
  problem: String;
  status: String;
  patientid: String;
  doctorid: String;
  message: String;
  consultationDetails: IConsultation;
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

const VitalsSchema: Schema<IVitals> = new Schema({
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
});

const ConsultationSchema: Schema<IConsultation> = new Schema({
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
});

export const AppointmentSchema: Schema<IAppointment> = new Schema({
  problem: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  patientid: {
    type: String,
    required: true,
  },
  doctorid: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: "Pending",
  },
  consultationDetails: {
    type: ConsultationSchema,
  },
});

export const AppointmentModel: Model<IAppointment> = model(
  "appointment",
  AppointmentSchema
);
