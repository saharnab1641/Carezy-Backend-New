import { Schema, Document, model, Model } from "mongoose";
import { hash, compare } from "bcrypt";

export interface IPatient extends Document {
  firstname: String;
  lastname: String;
  username: String;
  gender: String;
  email: String;
  contact: String;
  authId: String;
  appointments: String[];
}

export const PatientSchema: Schema<IPatient> = new Schema<IPatient>(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
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
    appointments: {
      type: [String],
    },
  },
  { timestamps: true }
);

export const PatientModel: Model<IPatient> = model("patient", PatientSchema);
