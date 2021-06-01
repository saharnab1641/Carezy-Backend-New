import { Handler, NextFunction, Request, Response } from "express";
import { sign, SignOptions } from "jsonwebtoken";
import { authenticate, use } from "passport";

import { LocalStrategy } from "../api/components/auth/strategies/local";
import { JWTStrategy } from "../api/components/auth/strategies/jwt";
import { env } from "../config/globals";
import { bind } from "decko";

export class AuthService {
  private jwtStrategy: JWTStrategy;
  private localStrategy: LocalStrategy;
  readonly signOptions: SignOptions = {
    audience: env.JWT_AUDIENCE,
    expiresIn: "24h",
    issuer: env.JWT_ISSUER,
    algorithm: "RS256",
  };

  public constructor() {
    this.jwtStrategy = new JWTStrategy();
    this.localStrategy = new LocalStrategy();
  }

  public initStrategies(): void {
    use("local-login", this.localStrategy.loginStrategy);
    use("local-signup", this.localStrategy.signUpStrategy);
    use(this.jwtStrategy.jwtStrategy);
  }

  @bind
  public createToken(user: Object): string {
    return sign({ user }, env.JWT_RSA_PRIVATE_KEY, this.signOptions);
  }

  public isAuthorized(): Handler {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        authenticate("jwt", { session: false }, (err, user, info) => {
          if (err) {
            return next(err);
          }
          if (info) {
            switch (info.message) {
              case "No auth token":
                return res.status(401).json({
                  error: "No jwt provided.",
                  status: 401,
                });

              case "jwt expired":
                return res.status(401).json({
                  error: "Jwt expired.",
                  status: 401,
                });
            }
          }

          if (!user) {
            return res.status(401).json({
              data: "User is not authorized",
              status: 401,
            });
          }
          req.user = user;
          return next();
        })(req, res, next);
      } catch (err) {
        return next(err);
      }
    };
  }
}
