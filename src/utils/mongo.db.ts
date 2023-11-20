import mongoose from "mongoose";
import config from "./config";

async function connect() {
  const dbUri = config.mongo.url;

  try {
    await mongoose.connect(dbUri);
    console.info("DB connected");
  } catch (error) {
    console.error("Could not connect to db");
    process.exit(1);
  }
}

export default connect;
