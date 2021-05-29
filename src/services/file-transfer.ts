import { Multer } from "multer";
import multerInit from "multer";
import { Bucket, Storage } from "@google-cloud/storage";
import { join } from "path";
import { env } from "../config/globals";
import { v4 as uuidv4 } from "uuid";

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
      credentials: JSON.parse(env.GCP_KEYFILE),
    });
  }

  private getFileExtension(fileName: String): String {
    return "." + fileName.split(".").pop() || "";
  }

  public uploadFile = (
    folder: String,
    fileBuffer: Buffer,
    fileName: String
  ): Promise<String> =>
    new Promise((resolve, reject) => {
      const bucket: Bucket = this.storage.bucket(env.GCP_BUCKET);
      const blob = bucket.file(
        folder + "/" + uuidv4() + this.getFileExtension(fileName)
      );
      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      blobStream.on("error", (err) => {
        reject("Unable to upload file, something went wrong");
      });

      blobStream.on("finish", () => {
        resolve(blob.name);
      });

      blobStream.end(fileBuffer);
    });

  public readFile = (file: String): Promise<String> =>
    new Promise((resolve, reject) => {});
}
