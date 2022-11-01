import { getAccountsWithHistory } from "../api/api";
import { Controller } from "../commons/definition";

export default class UserRoute extends Controller {

    public initRoutes(): void {
        // Get list of all already registered number (Need to keep my google key limit)
        this.getRouter().get('/', (req, res, next) => {
            try {
                getAccountsWithHistory().then((data) => {
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