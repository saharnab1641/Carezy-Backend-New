import RazorPay from "razorpay";
import { env } from "../config/globals";
import { HmacSHA256 } from "crypto-js";

export class PaymentService {
  private payClient: any;

  public constructor() {
    this.payClient = new RazorPay({
      key_id: env.RAZORPAY_ID,
      key_secret: env.RAZORPAY_SECRET,
    });
  }

  public createOrder = (params: any): Promise<any> =>
    new Promise(async (resolve, reject) => {
      try {
        const response = await this.payClient.orders.create(params);
        resolve(response);
      } catch (err) {
        reject(err);
      }
    });

  public refund = (id: String): Promise<any> =>
    new Promise(async (resolve, reject) => {
      try {
        const response = await this.payClient.refund(id);
        resolve(response);
      } catch (err) {
        reject(err);
      }
    });

  public verifyPayment(
    orderId: String,
    paymentId: String,
    signature: String
  ): boolean {
    const body = orderId + "|" + paymentId;
    const signatureForm = HmacSHA256(body, env.RAZORPAY_SECRET).toString();
    return signature === signatureForm ? true : false;
  }
}
