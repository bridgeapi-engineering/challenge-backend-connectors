import dotenv from "dotenv";
import { cacheData } from "../cacheData";

dotenv.config();

const providerUrl = 'http://localhost:3000';

/**
 * Place header for current provider
 * @param provider 
 */
function getHeaders(isJson: boolean, secret?: string): any {
    let commonObject: any = {};
    if (!isJson) { commonObject['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'; }
    else { commonObject['Content-Type'] = 'application/json'; }
    if (secret) commonObject['Authorization'] = secret;
    return commonObject;
}

export async function getAccountsWithHistory() {
    let secretAccessToken: Promise<string> = cacheData.getSecret() ? Promise.resolve(cacheData.getSecret()) : await getSecret();
    const secretAccess = ` Bearer ${secretAccessToken}`;
    return fetchRequestJSON('get', '/accounts', { isJson: true, secret: secretAccess }).then((users: any) => {
        let promiseAccountDetails: Promise<any>[] = [];
        let userAccountDetails: { acc_number: string, amount: string, transactions?: { label: string, amount: string, currency: string }[] }[] = [];
        if (users.account) {
            for (const user of users.account) {
                userAccountDetails.push({
                    acc_number: user.acc_number,
                    amount: user.amount,
                    transactions: []
                });
                promiseAccountDetails.push(fetchRequestJSON('get', `/accounts/${user.acc_number}/transactions`, {
                    isJson: true,
                    secret: secretAccess
                }));
            }
            return Promise.all(promiseAccountDetails).then((details) => {
                let i = 0;
                for (const detail of details) {
                    if (detail.transaction && detail.transaction.length) {
                        userAccountDetails[i].transactions = detail.transaction.map((x:any)=>{return {
                            label: x.label, amount: x.amount, currency: x.currency 
                        }});
                    }
                    i++;
                }
                return userAccountDetails;
            });
        }
    });
}

export function getSecret(): Promise<any> {
    const secretAccess = `Basic ${Buffer.from(`${process.env.APP_CLIENT_ID}${process.env.APP_CLIENT_PASS}`).toString('base64')}`;
    const payload = {
        user: `${process.env.LOGIN_BACK}`,
        password: `${process.env.PASSWORD_BACK}`
    };
    return fetchRequestJSON('post', '/login', {
        body: payload,
        isJson: true,
        secret: secretAccess
    }).then((refreshToken: any) => {
        if (refreshToken?.refresh_token) throw new Error("No login possible");
        if (refreshToken.refresh_token) {
            const accessString = `grant_type=refresh_token&refresh_token=${refreshToken.refresh_token}`;
            return fetchRequestJSON('post', '/token', { body: accessString, isJson: false }).then((finalToken: any) => {
                if (finalToken?.access_token) throw new Error("Cannot get token");
                cacheData.setSecret(finalToken.access_token);
                return finalToken?.access_token;
            });
        }
    });
}

export function logToServer() {

}


/**
 * Trigger fetch and json response each time
 * @param method -- method used
 * @param provider -- provider selected
 * @param restUrl -- url for get request
 * @param body -- body to use with fetch
 */
export function fetchRequestJSON(method: string, restUrl: string, options: { body?: any, isJson: boolean, secret?: string }): any {
    const fullUrl = `${providerUrl}${restUrl ?? ''}`;
    const body = options?.body ?? null;
    console.log(body)
    return fetch(fullUrl, {
        method,
        body,
        headers: getHeaders(options?.isJson ?? true, options?.secret)
    }).then(r => {
        if (r.status == 400) {
            return new Error(`Bad request`);
        } else {
            return r.status == 200 ? r.json() : null;
        }
    });
}