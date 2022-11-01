"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api/api");
const definition_1 = require("../commons/definition");
class UserRoute extends definition_1.Controller {
    initRoutes() {
        // Get list of all already registered number (Need to keep my google key limit)
        this.getRouter().get('/', (req, res, next) => {
            try {
                (0, api_1.getSecret)().then((data) => {
                    res.status(200);
                    res.send(data);
                }).catch(e => {
                    next(e);
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
}
exports.default = UserRoute;
//# sourceMappingURL=userRoute.js.map