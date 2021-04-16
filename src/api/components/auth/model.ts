import { hash, compare } from "bcrypt";
import { Schema, Document, model, Model } from "mongoose";

export interface IUser extends Document {
  _id: String;
  username: String;
  email: String;
  contact1: String;
  // contact2: String;
  role: String;
  password: String;
  passtest: String;
}

export const UserSchema: Schema<IUser> = new Schema({
  _id: {
    type: String,
    required: true,
    unique: true,
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
  contact1: {
    type: String,
    required: true,
  },
  // contact2: {
  //   type: String,
  // },
  role: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  passtest: {
    type: String,
  },
});

UserSchema.pre("save", async function (next: Function) {
  const user = this;
  const hashStr: String = await hash(user.password, 10);
  console.log(user.password);
  user.password = hashStr;
  next();
});

UserSchema.methods.isValidPassword = async function (password: String) {
  const user = this;
  const compareHash = await compare(password, user.password.toString());

  return compareHash;
};

export const UserModel: Model<IUser> = model("user", UserSchema);
