import { NextFunction, Request, Response } from "express";
import { MailService } from "../../../services/mail";
import { bind } from "decko";
import { FileTransferService } from "../../../services/file-transfer";
import { ArticleModel, IArticle } from "./model";
import { env } from "../../../config/globals";

export class HospitalController {
  readonly mailService: MailService;
  private fileTransferService: FileTransferService;

  constructor() {
    this.mailService = new MailService();
    this.fileTransferService = new FileTransferService();
  }

  @bind
  public async addArticle(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const body = req.body;
      if (req.file) {
        const response = await this.fileTransferService.uploadFile(
          "article",
          req.file,
          false,
          env.ALLOWEDIMAGETYPES
        );
        body.imageURL = response;
      }
      await ArticleModel.create(body);
      return res.json({ message: "Article created" });
    } catch (err) {
      return next(err);
    }
  }

  public async getArticles(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const filters: any = {};
      if (req.body.date) {
        if (!req.body.date.start && !req.body.date.end) {
          return res.json({ error: "Include start and end date" });
        }

        const dayStart = new Date(req.body.date.start);
        dayStart.setHours(0, 0, 0);
        const dayEnd = new Date(req.body.date.end);
        dayEnd.setHours(23, 59, 59);
        filters.date = {
          $gte: new Date(dayStart.toISOString()),
          $lte: new Date(dayEnd.toISOString()),
        };
      }
      const articles: Array<IArticle> = await ArticleModel.find(filters)
        .select({
          _id: 0,
        })
        .exec();
      return res.json(articles);
    } catch (err) {
      return next(err);
    }
  }
}
