import { Schema, Document, model, Model } from "mongoose";
import { hash, compare } from "bcrypt";

export interface IDoctor extends Document {
  firstname: String;
  lastname: String;
  gender: String;
  username: String;
  email: String;
  contact: String;
  authId: String;
  specialization: String;
  appointments: String[];
}

export const DoctorSchema: Schema<IDoctor> = new Schema({
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
  specialization: {
    type: String,
    required: true,
  },
  appointments: {
    type: [String],
  },
});

export const DoctorModel: Model<IDoctor> = model("doctor", DoctorSchema);
