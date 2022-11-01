import dotenv from "dotenv";
import App from "./app";
import { initCacheData } from "./cacheData";
import UserRoute from "./routes/userRoute";
import TransactionRoute from "./routes/transactionRoute";

// Init with .env file
dotenv.config();

// Init cache data to avoid call of same data x times
initCacheData();

const port = process.env.SERVER_PORT;

const app = new App(
    [
      new UserRoute("/user"),
      new TransactionRoute("/transaction")
    ],
    Number(port),
  );
   
  app.listen();