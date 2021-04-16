import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { authenticate } from "passport";
import { AuthService } from "../../../services/auth";
import { env } from "../../../config/globals";

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

          const body: object = {
            id: user._id,
            name: user.username,
            role: user.role,
          };
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
    if (req.body.role === env.PATIENT) {
      req.body.password = "fill";
      req.body.username = "fill";
    }

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
}
