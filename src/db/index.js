import mongoose, { connect } from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );

    console.log(
      `\nconnected to Mongo !! DB host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error while connecting to db: ", error);
    process.exit(1);
  }
};

export { connectDB };
