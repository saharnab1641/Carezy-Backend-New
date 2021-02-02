import mongoose from "mongoose";
import { logger } from "../config/logger";
import { env } from "../config/globals";

const DB_PARA = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
};

/**
 * Connect to MonngoDB via mongoose
 * @param {boolean} production_env - Param if production environment is to be used
 */
export const connectToMongo = async (): Promise<
  mongoose.Mongoose | undefined
> => {
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
};

/**
 * Disconnects from MongoDB via mongoose
 */
export const closeMongo = (): Promise<void> => {
  logger.info("Connection closed");
  return mongoose.disconnect();
};
