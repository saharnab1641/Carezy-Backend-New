import { Schema, Document, model, Model } from "mongoose";
import { hash, compare } from "bcrypt";

export interface IArticle extends Document {
  imageURL: String;
  title: String;
  articleBody: String;
}

export const ArticleSchema: Schema<IArticle> = new Schema<IArticle>(
  {
    imageURL: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    articleBody: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const ArticleModel: Model<IArticle> = model("article", ArticleSchema);
