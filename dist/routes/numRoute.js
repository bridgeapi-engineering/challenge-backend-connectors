"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cacheData_1 = require("../cacheData");
const api_1 = require("../api/api");
const definition_1 = require("../commons/definition");
class NumRoute extends definition_1.Controller {
    initRoutes() {
        // Get list of all already registered number (Need to keep my google key limit)
        this.getRouter().get('/', (req, res) => {
            res.status(200);
            res.send(cacheData_1.cacheData.getAllNumber());
        });
        // Get number with name, siren or adress
        this.getRouter().post('/', (req, res, next) => {
            var _a, _b;
            const compagnyName = (_a = req.body.name) !== null && _a !== void 0 ? _a : '';
            try {
                let zipcode = '';
                let city = '';
                const postalCodeReaded = req.body['postal code'];
                if (postalCodeReaded && postalCodeReaded.length > 0) {
                    const postalCodeSplited = postalCodeReaded.split(' ');
                    if (postalCodeSplited.length > 1) {
                        zipcode = postalCodeSplited.shift();
                        city = postalCodeSplited.join(' ');
                    }
                    else
                        throw new Error("Cannot read zipcode and city, must be in the format ZIPCODE CITY");
                }
                (0, api_1.findNum)({
                    name: compagnyName,
                    adress: {
                        city,
                        zipcode
                    },
                    siren: (_b = req.body.siren) !== null && _b !== void 0 ? _b : '',
                }).then((r) => {
                    res.status(200);
                    res.send(r);
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
exports.default = NumRoute;
//# sourceMappingURL=numRoute.js.map