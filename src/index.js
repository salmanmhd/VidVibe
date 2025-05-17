import "dotenv/config";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";

const PORT = process.env.PORT;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(`Express serer error: ${error}`);
    });

    app.listen(PORT, () => {
      console.log(`server running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Mongo connection failed: ${error}`);
  });
