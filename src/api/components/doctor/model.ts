import { Schema, Document, model, Model } from "mongoose";
import { hash, compare } from "bcrypt";

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

export interface IDoctor extends Document {
  firstName: String;
  lastName: String;
  gender: String;
  username: String;
  email: String;
  contact: String;
  authId: String;
  specialization: String;
  fees: String;
  slotDuration: number;
  schedule: ISchedule;
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

export const DoctorSchema: Schema<IDoctor> = new Schema<IDoctor>(
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
    specialization: {
      type: String,
      required: true,
    },
    fees: {
      type: String,
      required: true,
    },
    slotDuration: {
      type: Number,
      required: true,
    },
    schedule: {
      type: ScheduleSchema,
      required: true,
    },
  },
  { timestamps: true }
);

export const DoctorModel: Model<IDoctor> = model("doctor", DoctorSchema);

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
