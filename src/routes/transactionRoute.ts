import { cacheData } from "../cacheData";
import { Controller } from "../commons/definition";

export default class TransactionRoute extends Controller {


    public initRoutes(): void {
        // Get list of all already registered number (Need to keep my google key limit)
        this.getRouter().get('/', (req, res) => {
            
        });
    }
}