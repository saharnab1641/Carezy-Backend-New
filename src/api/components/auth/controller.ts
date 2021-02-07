import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { authenticate } from "passport";
import { AuthService } from "../../../services/auth";

export class AuthController {
  authService: AuthService;

  public constructor() {
    this.authService = new AuthService();
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

          const body: object = { _id: user._id, email: user.email };
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
    authenticate(
      "local-signup",
      { session: false },
      async (err, user, info) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(401).json({
            data: "User is not authorized",
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
}
