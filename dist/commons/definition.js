"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDER = exports.CacheData = exports.Controller = void 0;
const express_1 = require("express");
class Controller {
    constructor(path) {
        this.path = path;
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    getRouter() {
        return this.router;
    }
    getPath() {
        return this.path;
    }
}
exports.Controller = Controller;
class CacheData {
    constructor() { }
    setSecret(secret) {
        this.secretRequest = secret;
    }
    getSecret() {
        return this.secretRequest;
    }
}
exports.CacheData = CacheData;
var PROVIDER;
(function (PROVIDER) {
    PROVIDER[PROVIDER["GOUV"] = 1] = "GOUV";
    PROVIDER[PROVIDER["GOOGLE"] = 2] = "GOOGLE";
    PROVIDER[PROVIDER["GOOGLE_DETAILS"] = 3] = "GOOGLE_DETAILS";
    PROVIDER[PROVIDER["INSEE"] = 4] = "INSEE";
})(PROVIDER = exports.PROVIDER || (exports.PROVIDER = {}));
//# sourceMappingURL=definition.js.map