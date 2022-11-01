"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRequestJSON = exports.logToServer = exports.getSecret = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
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
        commonObject['Authorization'] = `Bearer ${secret}`;
    return commonObject;
}
function getSecret() {
    const payload = {
        "user": process.env.LOGIN_BACK,
        "password": process.env.PASSWORD_BACK
    };
    console.log(payload);
    return fetchRequestJSON('post', '/login', payload).then((refreshToken) => {
        return refreshToken;
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
function fetchRequestJSON(method, restUrl, body) {
    const fullUrl = `${providerUrl}${restUrl !== null && restUrl !== void 0 ? restUrl : ''}`;
    return fetch(fullUrl, {
        method,
        body,
        headers: getHeaders(true)
    }).then(r => {
        return r.json();
    });
}
exports.fetchRequestJSON = fetchRequestJSON;
//# sourceMappingURL=api.js.map