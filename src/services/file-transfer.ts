import { Multer } from "multer";
import multerInit from "multer";
import { Bucket, Storage } from "@google-cloud/storage";
import { join } from "path";
import { env } from "../config/globals";
import { v4 as uuidv4 } from "uuid";
import { createWriteStream } from "fs";
import { Response } from "express";
import { lookup } from "mime-types";

export class FileTransferService {
  public multer: Multer;
  private storage: Storage;

  public constructor() {
    this.multer = multerInit({
      storage: multerInit.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    });
    this.storage = new Storage({
      credentials: env.GCP_KEYFILE,
    });
  }

  private getFileExtension(fileName: String): String {
    return "." + fileName.split(".").pop() || "";
  }

  public uploadFile = (
    folder: String,
    file: Express.Multer.File,
    privacy: boolean,
    allowedMimeTypes: Array<String> = []
  ): Promise<String> =>
    new Promise((resolve, reject) => {
      try {
        if (allowedMimeTypes.length != 0) {
          if (!allowedMimeTypes.includes(file.mimetype)) {
            reject("File type not allowed");
          }
        }
        const bucket: Bucket = this.storage.bucket(env.GCP_BUCKET);
        const blob = bucket.file(
          folder + "/" + uuidv4() + this.getFileExtension(file.originalname)
        );
        const blobStream = blob.createWriteStream({
          resumable: false,
        });

        blobStream.on("error", (err) => {
          reject("Unable to upload file, something went wrong");
        });

        blobStream.on("finish", async () => {
          if (!privacy) {
            await blob.makePublic();
            resolve(blob.publicUrl());
          } else {
            resolve(blob.name);
          }
        });

        blobStream.end(file.buffer);
      } catch (err) {
        reject(err);
      }
    });

  public downloadFile = (
    fileName: String,
    newName: String,
    res: Response
  ): Promise<String> =>
    new Promise((resolve, reject) => {
      try {
        res.writeHead(200, {
          "Content-Disposition": `attachment; filename="${
            newName.toString() + this.getFileExtension(fileName)
          }"`,
          "Content-Type": lookup(
            this.getFileExtension(fileName).toString()
          ).toString(),
        });
        const bucket: Bucket = this.storage.bucket(env.GCP_BUCKET);
        const blob = bucket.file(fileName.toString());
        const blobStream = blob.createReadStream();

        blobStream
          .on("error", () => {
            reject("Unable to upload file, something went wrong");
          })
          .on("end", () => {
            resolve("Downloaded");
          })
          .pipe(res);
      } catch (err) {
        reject(err);
      }
    });
}
