import { NextFunction, Request, Response } from "express";

export class PatientController {
  public async readUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      return res.json({ data: req.user });
    } catch (err) {
      return next(err);
    }
  }
}
