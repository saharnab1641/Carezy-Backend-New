import { Schema, Document, model, Model } from "mongoose";
import { hash, compare } from "bcrypt";

export interface INurse extends Document {
  firstname: String;
  lastname: String;
  username: String;
  gender: String;
  email: String;
  contact: String;
  authId: String;
}

export const NurseSchema: Schema<INurse> = new Schema({
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
});

export const NurseModel: Model<INurse> = model("nurse", NurseSchema);
