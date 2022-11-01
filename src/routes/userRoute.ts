import { getSecret } from "../api/api";
import { cacheData } from "../cacheData";
import { Controller } from "../commons/definition";

export default class UserRoute extends Controller {

    public initRoutes(): void {
        // Get list of all already registered number (Need to keep my google key limit)
        this.getRouter().get('/', (req, res, next) => {
            try {
                getSecret().then((data) => {
                    res.status(200);
                    res.send(data);
                }).catch(e => {
                    next(e)
                });
            } catch (e) {
                next(e);
            }
        });
    }
}