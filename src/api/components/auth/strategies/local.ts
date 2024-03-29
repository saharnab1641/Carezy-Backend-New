import { Strategy } from "passport-local";
import { randomBytes } from "crypto";
import { env } from "../../../../config/globals";
import { v4 as uuidv4 } from "uuid";
import { generate } from "generate-password";
import { MailService } from "../../../../services/mail";
import { IPatient, PatientModel } from "../../patient/model";
import { AuthModel, IAuth } from "../model";
import { ClientSession, startSession } from "mongoose";
import { FHIRService } from "../../../../services/fhir";
import { PractitionerModel } from "../../practitioner/model";

export class LocalStrategy {
  private mailService: MailService;
  private fhirService: FHIRService;

  constructor() {
    this.mailService = new MailService();
    this.fhirService = new FHIRService();
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
            role: req.body.role,
          };

          await AuthModel.create([auth], { session: session });

          let user: any;
          const reqResourceBody = req.body.resource;
          const resource: any = {
            ...auth,
            ...reqResourceBody,
          };

          switch (req.body.role) {
            case env.ROLE_ENUM.patient: {
              if (resource.insurance) {
                resource.insurance.expiryDate = new Date(
                  reqResourceBody.insurance.expiryDate
                );
              }
              resource.dateOfBirth = new Date(reqResourceBody.dateOfBirth);
              const patientFHIR = this.fhirService.getPatientFHIR(resource);
              const { id } = await this.fhirService.createResource(patientFHIR);
              resource.fhirId = id;
              user = await PatientModel.create([resource], {
                session: session,
              });
              break;
            }
            case env.ROLE_ENUM.doctor: {
              if (
                !(
                  reqResourceBody.schedule &&
                  reqResourceBody.slotDuration &&
                  reqResourceBody.fees
                )
              ) {
                throw new Error("More details required for Doctor");
              }
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
            }
            case env.ROLE_ENUM.admin:
            case env.ROLE_ENUM.nurse:
            case env.ROLE_ENUM.laboratory:
            case env.ROLE_ENUM.reception: {
              const practitionerFHIR =
                this.fhirService.getPractitionerFHIR(resource);
              const { id } = await this.fhirService.createResource(
                practitionerFHIR
              );
              resource.fhirId = id;
              user = await PractitionerModel.create([resource], {
                session: session,
              });
              break;
            }
            default:
              throw new Error("Not a valid role");
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
