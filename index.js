require('dotenv').config();
const axios = require('axios');

const getRefreshToken = async () => {
    const basicAuth = {
        username: process.env.CLIENTID,
        password: process.env.CLIENTSECRET
    };

    const data = {
        user: process.env.LOGIN,
        password: process.env.PASSWORD
    }

    const res = await axios.post('http://localhost:3000/login', data, {auth: basicAuth});
    console.log(`statusCode: ${res.status}`);
    return res.data.refresh_token;
}


getRefreshToken().then(refreshToken => console.log(refreshToken));
