import { Schema, Document, model, Model } from "mongoose";
import { hash, compare } from "bcrypt";

export interface INurse extends Document {
  firstName: String;
  lastName: String;
  username: String;
  gender: String;
  email: String;
  contact: String;
  authId: String;
}

export const NurseSchema: Schema<INurse> = new Schema<INurse>(
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

export const NurseModel: Model<INurse> = model("nurse", NurseSchema);
