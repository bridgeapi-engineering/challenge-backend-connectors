"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRequestJSON = exports.logToServer = exports.getSecret = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const cacheData_1 = require("../cacheData");
dotenv_1.default.config();
const providerUrl = 'http://localhost:3000';
/**
 * Place header for current provider
 * @param provider
 */
function getHeaders(isJson, secret) {
    let commonObject = {};
    if (!isJson) {
        commonObject['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    }
    else {
        commonObject['Content-Type'] = 'application/json';
    }
    if (secret)
        commonObject['Authorization'] = secret;
    return commonObject;
}
function getSecret() {
    const secretAccess = `Basic ${Buffer.from(`${process.env.APP_CLIENT_ID}${process.env.APP_CLIENT_PASS}`).toString('base64')}`;
    const payload = {
        user: `${process.env.LOGIN_BACK}`,
        password: `${process.env.PASSWORD_BACK}`
    };
    return fetchRequestJSON('post', '/login', {
        body: payload,
        isJson: true,
        secret: secretAccess
    }).then((refreshToken) => {
        if (refreshToken === null || refreshToken === void 0 ? void 0 : refreshToken.refresh_token)
            throw new Error("No login possible");
        if (refreshToken.refresh_token) {
            const accessString = `grant_type=refresh_token&refresh_token=${refreshToken.refresh_token}`;
            return fetchRequestJSON('post', '/token', { body: accessString, isJson: false }).then((finalToken) => {
                if (finalToken === null || finalToken === void 0 ? void 0 : finalToken.access_token)
                    throw new Error("Cannot get token");
                cacheData_1.cacheData.setSecret(finalToken.access_token);
                return finalToken === null || finalToken === void 0 ? void 0 : finalToken.access_token;
            });
        }
    });
}
exports.getSecret = getSecret;
function logToServer() {
}
exports.logToServer = logToServer;
/**
 * Trigger fetch and json response each time
 * @param method -- method used
 * @param provider -- provider selected
 * @param restUrl -- url for get request
 * @param body -- body to use with fetch
 */
function fetchRequestJSON(method, restUrl, options) {
    var _a, _b;
    const fullUrl = `${providerUrl}${restUrl !== null && restUrl !== void 0 ? restUrl : ''}`;
    const body = (_a = options === null || options === void 0 ? void 0 : options.body) !== null && _a !== void 0 ? _a : null;
    console.log(body);
    return fetch(fullUrl, {
        method,
        body,
        headers: getHeaders((_b = options === null || options === void 0 ? void 0 : options.isJson) !== null && _b !== void 0 ? _b : true, options === null || options === void 0 ? void 0 : options.secret)
    }).then(r => {
        if (r.status == 400) {
            return new Error(`Bad request`);
        }
        else {
            return r.status == 200 ? r.json() : null;
        }
    });
}
exports.fetchRequestJSON = fetchRequestJSON;
//# sourceMappingURL=api.js.map