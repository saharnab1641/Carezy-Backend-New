import { Schema, Document, model, Model } from "mongoose";
import { hash, compare } from "bcrypt";
import { env } from "../../../config/globals";

export interface IAuth extends Document {
  firstName: String;
  lastName: String;
  username: String;
  email: String;
  profileImageURL: String;
  password: String;
  role: String;
}

export const AuthSchema: Schema<IAuth> = new Schema<IAuth>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
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
    profileImageURL: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: env.ROLE_ENUM,
    },
  },
  { timestamps: true }
);

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

export interface IChangeToken extends Document {
  userAuthId: String;
  token: String;
  status: String;
  changeResource: String;
  newEmail: String;
  createdAt: Date;
}

export const ChangeTokenSchema: Schema<IChangeToken> = new Schema<IChangeToken>(
  {
    userAuthId: {
      type: String,
      required: true,
      unique: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
      enum: env.CHANGE_TOKEN_ENUM,
    },
    changeResource: {
      type: String,
      required: true,
      enum: env.CHANGE_TOKEN_RESOURCE_ENUM,
    },
    newEmail: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: new Date(),
      expires: 10 * 60,
    },
  }
);

ChangeTokenSchema.pre("save", async function (next: Function) {
  const token: IChangeToken = this;
  const hashStr: String = await hash(token.token, 10);
  token.token = hashStr;
  next();
});

ChangeTokenSchema.methods.isValidToken = async function (tokenString: String) {
  const token: IChangeToken = this;
  const compareHash = await compare(tokenString, token.token.toString());

  return compareHash;
};

export const ChangeTokenModel: Model<IChangeToken> = model(
  "changetoken",
  ChangeTokenSchema
);
