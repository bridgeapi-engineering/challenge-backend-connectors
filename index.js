require('dotenv').config();
const axios = require('axios');

const getRefreshToken = async () => {
    const basicAuth = {username: process.env.CLIENTID, password: process.env.CLIENTSECRET};
    const data = {user: process.env.LOGIN, password: process.env.PASSWORD}

    const res = await axios.post('http://localhost:3000/login', data, {auth: basicAuth});
    console.log(`statusCode RefreshToken: ${res.status}`);
    return res.data.refresh_token;
}

const getAccessToken = async () => {
    const refreshToken = await getRefreshToken();
    const parameters = new URLSearchParams();
    parameters.append('grant_type', 'refresh_token');
    parameters.append('refresh_token', refreshToken);
    const headers =  {"Content-Type": "application/x-www-form-urlencoded"}

    const res = await axios.post('http://localhost:3000/token', parameters, {headers: headers});
    console.log(`statusCode AccessToken: ${res.status}`);
    return res.data.access_token;
}

const getAccounts = async () => {
    const accessToken = await getAccessToken();
    const config = {headers: {'Authorization': 'Bearer ' + accessToken}}

    const res = await axios.get('http://localhost:3000/accounts', config);
    console.log(`statusCode Accounts: ${res.status}`);
    return res.data.account;
}

getAccounts().then(account => console.log(account)).catch(error => console.log(error.message))
