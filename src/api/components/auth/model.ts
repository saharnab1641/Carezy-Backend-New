import { Schema, Document, model, Model } from "mongoose";
import { hash, compare } from "bcrypt";

export interface IAuth extends Document {
  firstname: String;
  lastname: String;
  username: String;
  email: String;
  contact: String;
  password: String;
  role: String;
}

export const AuthSchema: Schema<IAuth> = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
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
  },
  contact: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

AuthSchema.pre("save", async function (next: Function) {
  const user: IAuth = this;
  const hashStr: String = await hash(user.password, 10);
  user.password = hashStr;
  next();
});

AuthSchema.methods.isValidPassword = async function (password: String) {
  const user: IAuth = this;
  const compareHash = await compare(password, user.password.toString());

  return compareHash;
};

export const AuthModel: Model<IAuth> = model("auth", AuthSchema);
