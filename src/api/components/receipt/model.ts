import { Schema, Document, model, Model } from "mongoose";
import { hash, compare } from "bcrypt";
import { env } from "../../../config/globals";

export interface IReceipt extends Document {
  resourceId: String[];
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
      type: [String],
    },
    receiptFor: {
      type: String,
      required: true,
    },
    paymentSource: {
      type: String,
      enum: env.PAYMENT_SOURCE,
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
      default: env.RECEIPT_STATUS.created,
      enum: env.RECEIPT_STATUS,
    },
  },
  { timestamps: true }
);

export const ReceiptModel: Model<IReceipt> = model("receipt", ReceiptSchema);
