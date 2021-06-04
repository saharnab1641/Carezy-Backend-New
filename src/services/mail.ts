import { createTestAccount, createTransport, Transporter } from "nodemailer";
import { env } from "../config/globals";

export class MailService {
  private transporter: Transporter = createTransport({
    service: "gmail",
    auth: {
      user: env.GMAIL_USER,
      pass: env.GMAIL_PASS,
    },
  });

  public sendMail(to: string, subject: string, content: string): void {
    const mailOptions = {
      from: `"Carezy Test Mail" <${env.GMAIL_USER}>`,
      to: to,
      subject: subject,
      html: content,
    };

    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(`error: ${error}`);
      }
      console.log(`Message Sent ${info.response}`);
    });
  }
}
