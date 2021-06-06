import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { authenticate } from "passport";
import { AuthService } from "../../../services/auth";
import { env } from "../../../config/globals";
import { FileTransferService } from "../../../services/file-transfer";
import { AuthModel, ChangeTokenModel, IAuth, IChangeToken } from "./model";
import { FHIRService } from "../../../services/fhir";
import { PractitionerModel } from "../practitioner/model";
import { PatientModel } from "../patient/model";
import { hash, compare } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { MailService } from "../../../services/mail";
import { ClientSession, startSession } from "mongoose";

export class AuthController {
  private authService: AuthService;
  private fileTransferService: FileTransferService;
  private FHIRService: FHIRService;
  private mailService: MailService;

  public constructor() {
    this.authService = new AuthService();
    this.fileTransferService = new FileTransferService();
    this.FHIRService = new FHIRService();
    this.mailService = new MailService();
  }

  @bind
  public async doLocalLogin(req: Request, res: Response, next: NextFunction) {
    authenticate("local-login", async (err, user, info) => {
      try {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(401).json({
            data: "User is not authorized",
            status: 401,
          });
        }

        req.login(user, { session: false }, async (error) => {
          if (error) return next(error);

          const body: any = {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          };

          if (user.profileImageURL) body.profileImageURL = user.profileImageURL;

          const token: string = this.authService.createToken(body);

          return res.json({ token });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  }

  public async doLocalRegister(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    req.body.password = "fill";
    req.body.username = "fill";

    authenticate(
      "local-signup",
      { session: false },
      async (err, user, info) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(401).json({
            data: "User not registered. Try again!",
            status: 401,
          });
        }

        res.json({
          message: "Signup successful",
          username: user.username,
        });
      }
    )(req, res, next);
  }

  @bind
  public async updatePicture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.file) {
        return res.json({ error: "File not uploaded" });
      }

      const response = await this.fileTransferService.uploadFile(
        "profilepicture",
        req.file,
        false,
        env.ALLOWEDIMAGETYPES
      );
      await AuthModel.updateOne(
        { username: req.body.username },
        { profileImageURL: response }
      );

      if (req.body.role === env.ROLE_ENUM.patient) {
        await PatientModel.updateOne(
          { username: req.body.username },
          { profileImageURL: response }
        );
      } else {
        await PractitionerModel.updateOne(
          { username: req.body.username },
          { profileImageURL: response }
        );
      }

      const attachmentFHIR = this.FHIRService.getAttachmentFHIR(
        req.file,
        response,
        "Profile Picture",
        new Date()
      );
      const patchOptions = [
        { op: "add", path: "/photo", value: [attachmentFHIR] },
      ];
      await this.FHIRService.patchResource(
        req.body.role === env.ROLE_ENUM.patient ? "Patient" : "Practitioner",
        req.body.fhirId,
        patchOptions
      );

      return res.json({ message: "Picture Updated", response });
    } catch (err) {
      return next(err);
    }
  }

  @bind
  public async initUpdatePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const user: IAuth = await AuthModel.findOne({
        username: req.body.username,
      });

      const changeToken: Partial<IChangeToken> = {
        userAuthId: user._id,
        token: uuidv4(),
        changeResource: env.CHANGE_TOKEN_RESOURCE_ENUM.password,
        status: env.CHANGE_TOKEN_ENUM.created,
      };
      await ChangeTokenModel.create(changeToken);
      this.mailService.sendMail(
        user.email.toString(),
        "Password Update Link",
        `Click on this <a href="${env.CLIENT_BASE_URL}/forgotpassword/${changeToken.token}">link</a> to reset your password. Link is only valid for 10 minutes.`
      );
      return res.json({ message: "Check mail for update link" });
    } catch (err) {
      return next(err);
    }
  }

  @bind
  public async confirmUpdatePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const user: IAuth = await AuthModel.findOne({
        username: req.body.username,
      });
      const token = await ChangeTokenModel.findOne({ userAuthId: user._id });

      const valid = await token.isValidToken(req.body.token);

      if (
        token &&
        token.status === env.CHANGE_TOKEN_ENUM.created &&
        valid &&
        token.changeResource === env.CHANGE_TOKEN_RESOURCE_ENUM.password
      ) {
        if (
          !(req.body.password.length >= 8 && req.body.password.length <= 32)
        ) {
          return res.json({ error: "Invalid password" });
        }
        const hashStr: String = await hash(req.body.password, 10);
        await AuthModel.updateOne(
          { email: req.body.username },
          { password: hashStr }
        );
        await ChangeTokenModel.findByIdAndUpdate(token._id, {
          status: env.CHANGE_TOKEN_ENUM.used,
        });
        return res.json({ message: "Password successfully changed" });
      }

      return res.json({ error: "Invalid link" });
    } catch (err) {
      return next(err);
    }
  }

  @bind
  public async initUpdateEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const user = await AuthModel.findOne({
        username: req.body.username,
      });

      if (!user.isValidPassword(req.body.password)) {
        return res.json({ error: "Invalid request" });
      }

      if (!req.body.newEmail) {
        return res.json({ error: "Enter a valid email" });
      }

      const changeToken: Partial<IChangeToken> = {
        userAuthId: user._id,
        token: uuidv4(),
        changeResource: env.CHANGE_TOKEN_RESOURCE_ENUM.email,
        newEmail: req.body.newEmail,
        status: env.CHANGE_TOKEN_ENUM.created,
      };
      await ChangeTokenModel.create(changeToken);
      this.mailService.sendMail(
        req.body.newEmail,
        "Email Update Link",
        `Click on this <a href="${env.CLIENT_BASE_URL}/confirmemail/${changeToken.token}">link</a> to confirm new email. Link is only valid for 10 minutes.`
      );

      return res.json({ message: "Check mail for update link" });
    } catch (err) {
      return next(err);
    }
  }

  @bind
  public async confirmUpdateEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      var session: ClientSession = await startSession();
      try {
        const user: IAuth = await AuthModel.findOne({
          username: req.body.username,
        });
        const token = await ChangeTokenModel.findOne({ userAuthId: user._id });

        const valid = await token.isValidToken(req.body.token);

        if (
          token &&
          token.status === env.CHANGE_TOKEN_ENUM.created &&
          token.changeResource === env.CHANGE_TOKEN_RESOURCE_ENUM.email &&
          valid
        ) {
          session.startTransaction();
          await AuthModel.updateOne(
            { username: req.body.username },
            { email: token.newEmail },
            { session }
          );
          if (user.role === env.ROLE_ENUM.patient) {
            await PatientModel.updateOne(
              { username: req.body.username },
              { email: token.newEmail },
              { session }
            );
          } else {
            await PractitionerModel.updateOne(
              { username: req.body.username },
              { email: token.newEmail },
              { session }
            );
          }

          await ChangeTokenModel.findByIdAndUpdate(token._id, {
            status: env.CHANGE_TOKEN_ENUM.used,
          });

          await session.commitTransaction();
          session.endSession();
          return res.json({ message: "Email successfully changed" });
        }

        session.endSession();
        return res.json({ error: "Invalid link" });
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return next(err);
      }
    } catch (err) {
      return next(err);
    }
  }

  @bind
  public async updateUserDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      var session: ClientSession = await startSession();
      try {
        const user = await AuthModel.findOne({
          username: req.body.username,
        });

        if (!user.isValidPassword(req.body.password)) {
          session.endSession();
          return res.json({ error: "Invalid request" });
        }

        const setFields: any = {
          contact: req.body.contact,
          contactAlternate: req.body.contactAlternate,
          maritalStatusBoolean: req.body.maritalStatusBoolean,
          state: req.body.state,
          city: req.body.city,
          pincode: req.body.pincode,
          address: req.body.address,
          username: req.body.newUsername,
        };

        Object.keys(setFields).forEach(
          (key) =>
            (setFields[key] === undefined ||
              setFields[key] === null ||
              setFields[key] === NaN) &&
            delete setFields[key]
        );

        session.startTransaction();

        if (setFields) {
          if (setFields.username) {
            await AuthModel.updateOne(
              { username: req.body.username },
              { username: setFields.username },
              { session }
            );
          }

          if (user.role === env.ROLE_ENUM.patient) {
            await PatientModel.updateOne(
              { username: req.body.username },
              setFields,
              { session }
            );
          } else {
            await PractitionerModel.updateOne(
              { username: req.body.username },
              setFields,
              { session }
            );
          }
        }

        await session.commitTransaction();
        session.endSession();
        return res.json({ message: "Details successfully updated", setFields });
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return next(err);
      }
    } catch (err) {
      return next(err);
    }
  }
}
