import { Schema, Document, model, Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { env } from "../../../config/globals";

export interface IAppointment extends Document {
  appointmentDateTime: Date;
  problem: String;
  status: String;
  patientUsername: String;
  patientFirstName: String;
  patientLastName: String;
  doctorUsername: String;
  doctorFirstName: String;
  doctorLastName: String;
  nurseUsername: String;
  nurseFirstName: String;
  nurseLastName: String;
  message: String;
  consultationDetails: IConsultation;
  DDSHash: String;
  amount: number;
  receiptId: String;
  paymentSource: String;
  fhirId: String;
}

export interface IVitals extends Document {
  temperature: number;
  bloodPressure: String;
  pulseRate: number;
  spO2: number;
  height: number;
  weight: number;
}

export interface IConsultation extends Document {
  vitals: IVitals;
  chiefComplaints: String[];
  examination: String[];
  diagnosis: String[];
  advice: String[];
  investigation: String[];
  medicine: IMedicine[];
  attachmentName: String;
}

export interface IMedicine extends Document {
  name: String;
  company: String;
  timesTakenPerDay: number;
  duration: number;
  mealBoolean: boolean;
  mealCustomInstructions: String;
  intakeMethod: String;
  suggestions: String;
}

const MedicineSchema: Schema<IMedicine> = new Schema<IMedicine>(
  {
    name: {
      type: String,
      required: true,
    },
    company: {
      type: String,
    },
    timesTakenPerDay: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    mealBoolean: {
      type: Boolean,
      required: true,
    },
    mealCustomInstructions: {
      type: String,
    },
    intakeMethod: {
      type: String,
      required: true,
      enum: ["oral", "intravenous", "intramuscular"],
    },
    suggestions: {
      type: String,
    },
  },
  { _id: false }
);

const VitalsSchema: Schema<IVitals> = new Schema<IVitals>(
  {
    temperature: {
      type: Number,
    },
    bloodPressure: {
      type: String,
    },
    pulseRate: {
      type: Number,
    },
    spO2: {
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

const ConsultationSchema: Schema<IConsultation> = new Schema<IConsultation>(
  {
    vitals: {
      type: VitalsSchema,
    },
    chiefComplaints: {
      type: [String],
    },
    diagnosis: {
      type: [String],
    },
    advice: {
      type: [String],
    },
    examination: {
      type: [String],
    },
    investigation: {
      type: [String],
    },
    medicine: {
      type: [MedicineSchema],
    },
    attachmentName: {
      type: String,
    },
  },
  { _id: false }
);

export const AppointmentSchema: Schema<IAppointment> = new Schema<IAppointment>(
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
      default: env.APPOINTMENT_STATUS.pending,
      enum: env.APPOINTMENT_STATUS,
    },
    patientUsername: {
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
    doctorUsername: {
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
    nurseUsername: {
      type: String,
    },
    nurseFirstName: {
      type: String,
    },
    nurseLastName: {
      type: String,
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
    paymentSource: {
      type: String,
      enum: env.PAYMENT_SOURCE,
      required: true,
    },
    fhirId: {
      type: String,
    },
  },
  { timestamps: true }
);

AppointmentSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 20 * 60,
    partialFilterExpression: { status: env.APPOINTMENT_STATUS.pending },
  }
);

export const AppointmentModel: Model<IAppointment> = model(
  "appointment",
  AppointmentSchema
);
