"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const definition_1 = require("../commons/definition");
class TransactionRoute extends definition_1.Controller {
    initRoutes() {
        // Get list of all already registered number (Need to keep my google key limit)
        this.getRouter().get('/', (req, res) => {
        });
    }
}
exports.default = TransactionRoute;
//# sourceMappingURL=transactionRoute.js.map