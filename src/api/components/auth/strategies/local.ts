import { Strategy } from "passport-local";
import { randomBytes } from "crypto";
import { env } from "../../../../config/globals";
import { v4 as uuidv4 } from "uuid";
import { generate } from "generate-password";
import { MailService } from "../../../../services/mail";
import { IPatient, PatientModel } from "../../patient/model";
import { DoctorModel, IDoctor } from "../../doctor/model";
import { AuthModel, IAuth } from "../model";

export class LocalStrategy {
  public signUpStrategy: Strategy = new Strategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      const mailService: MailService = new MailService();
      try {
        const auth: IAuth = {
          ...req.body.auth,
          username: randomBytes(5).toString("hex"),
          password: generate({
            length: 8,
            numbers: true,
            strict: true,
          }),
        };

        const newAuth: IAuth = await AuthModel.create({
          ...auth,
          role: req.body.role,
        });

        let user: any;

        switch (req.body.role) {
          case env.PATIENT: {
            const resource: IPatient = {
              ...auth,
              ...req.body.resource,
              authId: newAuth._id,
            };
            user = await PatientModel.create(resource);
            break;
          }
          case env.DOCTOR: {
            const resource: IDoctor = {
              ...auth,
              ...req.body.resource,
              authId: newAuth._id,
            };
            user = await DoctorModel.create(resource);
            break;
          }
        }

        mailService.sendMail(
          auth.email.toString(),
          "Login Details",
          `<b>Username<b>: ${auth.username}<br><b>Password<b>: ${auth.password}`
        );

        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  );

  public loginStrategy: Strategy = new Strategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      try {
        const user = await AuthModel.findOne({ username });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const validate = await user.isValidPassword(password);

        if (!validate) {
          return done(null, false, { message: "Wrong Password" });
        }

        return done(null, user, { message: "Logged in Successfully" });
      } catch (error) {
        return done(error);
      }
    }
  );
}
