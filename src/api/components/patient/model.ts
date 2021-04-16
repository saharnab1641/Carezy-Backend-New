import { Schema, Document, model, Model } from "mongoose";

export interface IPatient extends Document {
  _id: String;
  firstname: String;
  lastname: String;
  gender: String;
  address: String;
  state: String;
  pincode: Number;
  aadhar: Number;
  maritalstatus: String;
  dob: Date;
  insurance: IInsurance;
  guardian: IGuardian;
  appointments: [String];
}

interface IInsurance extends Document {
  companyname: String;
  insurancenumber: String;
  expiry: Date;
}

interface IGuardian extends Document {
  firstname: String;
  lastname: String;
  gender: String;
  aadhar: Number;
  contact: String;
}

const InsuranceSchema: Schema<IInsurance> = new Schema({
  companyname: {
    type: String,
    required: true,
  },
  insurancenumber: {
    type: String,
    required: true,
    unique: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
});

const GuardianSchema: Schema<IGuardian> = new Schema({
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
  aadhar: {
    type: Number,
    required: true,
    unique: true,
  },
  contact: {
    type: String,
    required: true,
  },
});

export const PatientSchema: Schema<IPatient> = new Schema({
  _id: {
    type: String,
    required: true,
    unique: true,
  },
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
  address: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  aadhar: {
    type: Number,
    required: true,
    unique: true,
  },
  maritalstatus: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  insurance: {
    type: InsuranceSchema,
  },
  guardian: {
    type: GuardianSchema,
  },
  appointments: {
    type: [String],
  },
});

export const PatientModel: Model<IPatient> = model("patient", PatientSchema);
