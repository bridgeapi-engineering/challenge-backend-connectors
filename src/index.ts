import dotenv from "dotenv";
import App from "./app";
import { initCacheData } from "./cacheData";
import HistoryRoute from "./routes/userRoute";

// Init with .env file
dotenv.config();

// Init cache data to avoid call of same data x times
initCacheData();

const port = process.env.SERVER_PORT;

const app = new App(
    [
      new HistoryRoute("/history"),
    ],
    Number(port),
  );
   
  app.listen();