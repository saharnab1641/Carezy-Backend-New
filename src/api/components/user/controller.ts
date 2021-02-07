import { NextFunction, Request, Response } from "express";

export class UserController {
  public async readUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const users: String = "Test";

      return res.json({ status: res.statusCode, data: users });
    } catch (err) {
      return next(err);
    }
  }
}
