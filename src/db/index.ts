import mongoose from "mongoose";
import { logger } from "../config/logger";
import { env } from "../config/globals";

const DB_PARA = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
};

export class MongoConnect {
  public async connectToMongo(): Promise<mongoose.Mongoose | undefined> {
    try {
      const DB_URI = env.MONGODB_URI;
      let mongooseInstance: mongoose.Mongoose = await mongoose.connect(
        DB_URI,
        DB_PARA
      );
      if (mongooseInstance) logger.info("Connected to Database");
      return mongooseInstance;
    } catch (error) {
      logger.error(error.stack);
    }
  }

  public async closeMongo(): Promise<void> {
    logger.info("Connection closed");
    return mongoose.disconnect();
  }
}
