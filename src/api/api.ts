import dotenv from "dotenv";

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
    if (secret) commonObject['Authorization'] = `Bearer ${secret}`;
    return commonObject;
}

export function getSecret(): Promise<any> {
    const payload = {
        "user": process.env.LOGIN_BACK,
        "password": process.env.PASSWORD_BACK
    };
    console.log(payload);
    return fetchRequestJSON('post', '/login', payload).then((refreshToken: any) => {
        return refreshToken;
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
export function fetchRequestJSON(method: string, restUrl: string, body?: any): any {
    const fullUrl = `${providerUrl}${restUrl ?? ''}`;
    return fetch(fullUrl, {
        method,
        body,
        headers: getHeaders(true)
    }).then(r => {
        return r.json()
    });
}