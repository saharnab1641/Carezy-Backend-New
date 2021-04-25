import { Schema, Document, model, Model } from "mongoose";
import { hash, compare } from "bcrypt";

export interface IReceipt extends Document {
  resourceId: String;
  receiptFor: String;
  paymentSource: String;
  paymentRemarks: String;
  orderId: String;
  receiptId: String;
  paymentId: String;
  signature: String;
  amount: number;
  currency: String;
  status: String;
}

export const ReceiptSchema: Schema<IReceipt> = new Schema<IReceipt>(
  {
    resourceId: {
      type: String,
      required: true,
      unique: true,
    },
    receiptFor: {
      type: String,
      required: true,
    },
    paymentSource: {
      type: String,
      enum: ["app", "reception"],
      required: true,
    },
    paymentRemarks: {
      type: String,
    },
    orderId: {
      type: String,
    },
    receiptId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
    },
    signature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "created",
    },
  },
  { timestamps: true }
);

export const ReceiptModel: Model<IReceipt> = model("receipt", ReceiptSchema);
