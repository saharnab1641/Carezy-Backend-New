import { hash, compare } from "bcrypt";
import { Schema, Document, model, Model } from "mongoose";

export interface IUser extends Document {
  email: String;
  password: String;
}

const UserSchema: Schema<IUser> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

UserSchema.pre("save", async function (next: Function) {
  const user = this;
  const hashStr: String = await hash(user.password, 10);

  user.password = hashStr;
  next();
});

UserSchema.methods.isValidPassword = async function (password: String) {
  const user = this;
  const compareHash = await compare(password, user.password.toString());

  return compareHash;
};

export const UserModel: Model<IUser> = model("user", UserSchema);
