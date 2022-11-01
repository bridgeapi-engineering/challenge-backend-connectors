"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const cacheData_1 = require("./cacheData");
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const transactionRoute_1 = __importDefault(require("./routes/transactionRoute"));
// Init with .env file
dotenv_1.default.config();
// Init cache data to avoid call of same data x times
(0, cacheData_1.initCacheData)();
const port = process.env.SERVER_PORT;
const app = new app_1.default([
    new userRoute_1.default("/user"),
    new transactionRoute_1.default("/transaction")
], Number(port));
app.listen();
//# sourceMappingURL=index.js.map