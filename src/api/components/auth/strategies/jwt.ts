import { Strategy, ExtractJwt } from "passport-jwt";
import { env } from "../../../../config/globals";
import { StrategyOptions } from "passport-jwt";
import { SignOptions } from "jsonwebtoken";

export class JWTStrategy {
  readonly strategyOptions: StrategyOptions = {
    audience: env.JWT_AUDIENCE,
    issuer: env.JWT_ISSUER,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.JWT_SECRET,
  };

  readonly signOptions: SignOptions = {
    audience: this.strategyOptions.audience,
    expiresIn: "8h",
    issuer: this.strategyOptions.issuer,
  };

  public jwtStrategy: Strategy = new Strategy(
    this.strategyOptions,
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  );
}
