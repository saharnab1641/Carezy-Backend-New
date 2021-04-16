import { Strategy } from "passport-local";
import { UserModel, IUser } from "../model";
import { randomBytes } from "crypto";
import { env } from "../../../../config/globals";
import { v4 as uuidv4 } from "uuid";
import { generate } from "generate-password";
import { MailService } from "../../../../services/mail";

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
        const newUser: Partial<IUser> = {
          email: req.body.email,
          role: req.body.role,
          contact1: req.body.contact1,
          password,
        };
        newUser._id = uuidv4();
        newUser.username = randomBytes(5).toString("hex");
        newUser.password = generate({
          length: 8,
          numbers: true,
          strict: true,
        });

        const user: IUser = await UserModel.create(newUser);

        // switch (user.role) {
        //   case env.PATIENT: {
        //   }
        // }

        mailService.sendMail(
          user.email.toString(),
          "Login Details",
          `<b>Username<b>: ${newUser.username}<br><b>Password<b>: ${newUser.password}`
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
    },
    async (username, password, done) => {
      try {
        const user = await UserModel.findOne({ username });

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
