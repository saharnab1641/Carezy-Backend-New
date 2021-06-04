import { Strategy, ExtractJwt } from "passport-jwt";
import { env } from "../../../../config/globals";
import { StrategyOptions } from "passport-jwt";
import { SignOptions } from "jsonwebtoken";

export class JWTStrategy {
  readonly strategyOptions: StrategyOptions = {
    audience: env.JWT_AUDIENCE,
    issuer: env.JWT_ISSUER,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.JWT_RSA_PUBLIC_KEY,
    algorithms: ["RS256"],
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
