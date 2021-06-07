import { Schema, Document, model, Model } from "mongoose";
import { env } from "../../../config/globals";

export interface IVisitTime extends Document {
  start: Date;
  end: Date;
}

export interface ISchedule extends Document {
  monday: IVisitTime;
  tuesday: IVisitTime;
  wednesday: IVisitTime;
  thursday: IVisitTime;
  friday: IVisitTime;
  saturday: IVisitTime;
  sunday: IVisitTime;
}

export interface IPractitioner extends Document {
  fhirId: String;
  firstName: String;
  lastName: String;
  gender: String;
  username: String;
  email: String;
  contact: String;
  contactAlternate: String;
  profileImageURL: String;
  dateOfBirth: Date;
  state: String;
  city: String;
  pincode: String;
  address: String;
  identificationType: String;
  identificationNumber: String;
  specializationCode: String;
  specializationName: String;
  fees: number;
  slotDuration: number;
  schedule: ISchedule;
  role: String;
}

const VisitTimeSchema: Schema<IVisitTime> = new Schema<IVisitTime>(
  {
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const ScheduleSchema: Schema<ISchedule> = new Schema<ISchedule>(
  {
    monday: {
      type: VisitTimeSchema,
    },
    tuesday: {
      type: VisitTimeSchema,
    },
    wednesday: {
      type: VisitTimeSchema,
    },
    thursday: {
      type: VisitTimeSchema,
    },
    friday: {
      type: VisitTimeSchema,
    },
    saturday: {
      type: VisitTimeSchema,
    },
    sunday: {
      type: VisitTimeSchema,
    },
  },
  { _id: false }
);

export const PractitionerSchema: Schema<IPractitioner> =
  new Schema<IPractitioner>(
    {
      fhirId: {
        type: String,
      },
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
        enum: env.GENDER_ENUM,
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
      contactAlternate: {
        type: String,
      },
      profileImageURL: {
        type: String,
      },
      dateOfBirth: {
        type: Date,
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
        type: String,
        required: true,
      },
      address: {
        type: String,
      },
      identificationType: {
        type: String,
        required: true,
      },
      identificationNumber: {
        type: String,
        required: true,
      },
      specializationCode: {
        type: String,
        required: true,
      },
      specializationName: {
        type: String,
        required: true,
      },
      fees: {
        type: Number,
      },
      slotDuration: {
        type: Number,
      },
      schedule: {
        type: ScheduleSchema,
      },
      role: {
        type: String,
        required: true,
        enum: env.ROLE_ENUM,
      },
    },
    { timestamps: true }
  );

export const PractitionerModel: Model<IPractitioner> = model(
  "practitioner",
  PractitionerSchema
);

export interface ISpecialization extends Document {
  name: String;
  code: String;
  description: String;
}

export const SpecializationSchema: Schema<ISpecialization> =
  new Schema<ISpecialization>({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
  });

export const SpecializationModel: Model<ISpecialization> = model(
  "specialization",
  SpecializationSchema
);
