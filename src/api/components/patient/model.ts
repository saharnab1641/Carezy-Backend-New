import { Schema, Document, model, Model } from "mongoose";
import { hash, compare } from "bcrypt";

export interface IGuardian extends Document {
  firstName: String;
  lastName: String;
  gender: String;
  identificationType: String;
  identificationNumber: String;
  contact: String;
  contactAlternate: String;
}

export interface IInsurance extends Document {
  insuranceCompany: String;
  insuranceNumber: String;
  expiryDate: Date;
}

export interface IPatient extends Document {
  firstName: String;
  lastName: String;
  username: String;
  gender: String;
  email: String;
  contact: String;
  authId: String;
  contactAlternate: String;
  age: number;
  dateOfBirth: Date;
  deceasedBoolean: boolean;
  maritalStatusBoolean: boolean;
  state: String;
  city: String;
  pincode: number;
  address: String;
  bloodGroup: String;
  personalHistory: String[];
  familyHistory: String[];
  ongoingMedications: String[];
  allergies: String[];
  lifestyle: String[];
  surgeries: String[];
  immunization: String[];
  identificationType: String;
  identificationNumber: String;
  guardian: IGuardian;
  insurance: IInsurance;
}

const InsuranceSchema: Schema<IInsurance> = new Schema<IInsurance>(
  {
    insuranceCompany: {
      type: String,
      required: true,
    },
    insuranceNumber: {
      type: String,
      required: true,
    },
    expiry: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const GuardianSchema: Schema<IGuardian> = new Schema<IGuardian>(
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
    identificationType: {
      type: String,
      required: true,
    },
    identificationNumber: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
      unique: true,
    },
    contactAlternate: {
      type: String,
    },
  },
  { _id: false }
);

export const PatientSchema: Schema<IPatient> = new Schema<IPatient>(
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
    contactAlternate: {
      type: String,
    },
    age: {
      type: Number,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    deceasedBoolean: {
      type: Boolean,
      default: false,
    },
    maritalStatusBoolean: {
      type: Boolean,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    personalHistory: {
      type: [String],
    },
    familyHistory: {
      type: [String],
    },
    ongoingMedications: {
      type: [String],
    },
    allergies: {
      type: [String],
    },
    lifestyle: {
      type: [String],
    },
    surgeries: {
      type: [String],
    },
    immunization: {
      type: [String],
    },
    identificationType: {
      type: String,
      required: true,
    },
    identificationNumber: {
      type: String,
      required: true,
    },
    guardian: {
      type: GuardianSchema,
    },
    insurance: {
      type: InsuranceSchema,
    },
  },
  { timestamps: true }
);

export const PatientModel: Model<IPatient> = model("patient", PatientSchema);
