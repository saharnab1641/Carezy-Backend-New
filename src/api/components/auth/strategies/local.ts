import { Strategy } from "passport-local";
import { randomBytes } from "crypto";
import { env } from "../../../../config/globals";
import { v4 as uuidv4 } from "uuid";
import { generate } from "generate-password";
import { MailService } from "../../../../services/mail";
import { IPatient, PatientModel } from "../../patient/model";
import {
  DoctorModel,
  IDoctor,
  ISchedule,
  IVisitTime,
} from "../../doctor/model";
import { AuthModel, IAuth } from "../model";
import { NurseModel } from "../../nurse/model";
import { LaboratoryModel } from "../../laboratory/model";
import { ClientSession, startSession } from "mongoose";

export class LocalStrategy {
  private mailService: MailService;

  constructor() {
    this.mailService = new MailService();
  }

  public signUpStrategy: Strategy = new Strategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      try {
        var session: ClientSession = await startSession();
        try {
          session.startTransaction();
          const auth: IAuth = {
            ...req.body.auth,
            username: randomBytes(5).toString("hex"),
            password: generate({
              length: 8,
              numbers: true,
              strict: true,
            }),
          };

          await AuthModel.create(
            [
              {
                ...auth,
                role: req.body.role,
              },
            ],
            { session: session }
          );

          let user: any;
          const reqResourceBody = req.body.resource;

          switch (req.body.role) {
            case env.PATIENT: {
              const resource: any = {
                ...auth,
                ...reqResourceBody,
              };
              if (resource.insurance) {
                resource.insurance.expiryDate = new Date(
                  reqResourceBody.insurance.expiryDate
                );
              }
              resource.dateOfBirth = new Date(reqResourceBody.dateOfBirth);
              user = await PatientModel.create([resource], {
                session: session,
              });
              break;
            }
            case env.DOCTOR: {
              const resource: any = {
                ...auth,
                ...reqResourceBody,
              };
              const scheduleRaw = reqResourceBody.schedule;
              var schedule: any = {};
              for (const day in scheduleRaw) {
                const timeObj = scheduleRaw[day];
                const start = new Date(0);
                start.setHours(timeObj.start.hours, timeObj.start.minutes, 0);
                const end = new Date(0);
                end.setHours(timeObj.end.hours, timeObj.end.minutes, 0);
                schedule[day] = { start, end };
              }
              resource.schedule = schedule;
              user = await DoctorModel.create([resource], { session: session });
              break;
            }
            case env.NURSE: {
              const resource: any = {
                ...auth,
                ...reqResourceBody,
              };
              user = await NurseModel.create([resource], { session: session });
              break;
            }
            case env.LABORATORY: {
              const resource: any = {
                ...auth,
                ...reqResourceBody,
              };
              user = await LaboratoryModel.create([resource], {
                session: session,
              });
              break;
            }
          }

          await session.commitTransaction();
          session.endSession();

          this.mailService.sendMail(
            auth.email.toString(),
            "Login Details",
            `<b>Username<b>: ${auth.username}<br><b>Password<b>: ${auth.password}`
          );

          return done(null, user);
        } catch (error) {
          await session.abortTransaction();
          session.endSession();
          done(error);
        }
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
