import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { authenticate } from "passport";
import { AuthService } from "../../../services/auth";
import { env } from "../../../config/globals";
import { FileTransferService } from "../../../services/file-transfer";
import { AuthModel, IAuth } from "./model";
import { FHIRService } from "../../../services/fhir";
import { PractitionerModel } from "../practitioner/model";
import { PatientModel } from "../patient/model";

export class AuthController {
  private authService: AuthService;
  private fileTransferService: FileTransferService;
  private FHIRService: FHIRService;

  public constructor() {
    this.authService = new AuthService();
    this.fileTransferService = new FileTransferService();
    this.FHIRService = new FHIRService();
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
          userID: user._id,
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
}
