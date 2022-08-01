const express = require("express");
const axios = require("axios");
const app = express();
const port = 3001;

app.get("/", async (req, res) => {
  let loginData = JSON.stringify({
    user: "BankinUser",
    password: "12345678",
  });
  let clientId = "BankinClientId";
  let clientSecret = "secret";

  let rawCred = Buffer.from(`${clientId}:${clientSecret}`, "utf-8");
  let encodedCred = rawCred.toString("base64");

  let loginOptions = {
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Basic ${encodedCred}`,
      "Content-Length": Buffer.byteLength(loginData),
    },
  };

  let refresh_token = "";
  const doLogin = async () =>
    await axios
      .post("http://localhost:3000/login", loginData, loginOptions)
      .then((res) => {
        console.log(`statusCode: ${res.status}`);
        console.log(res.data);
        refresh_token = res.data.refresh_token;
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(error);
      });

  await doLogin();

  let tokenData = {
    grant_type: "refresh_token",
    refresh_token,
  };
  let access_token = "";

  const doToken = async () =>
    await axios
      .post("http://localhost:3000/token", tokenData)
      .then((res) => {
        console.log(`statusCode: ${res.status}`);
        console.log(res.data);
        access_token = res.data.access_token;
      })
      .catch((error) => {
        // if (error.status === 401) {
        //     doLogin();

        // }
        console.error(error);
        res.status(500).send(error);
      });
  await doToken();

  const doAccounts = async (pageNum) =>
    await axios
      .post(`http://localhost:3000/accounts?page=${pageNum}`, tokenData, {
        Authorization: `Bearer ${access_token}`,
      })
      .then((res) => {
        console.log(`statusCode: ${res.status}`);
        console.log(res.data);
        return res.data.account;
      })
      .catch((error) => {
        // if (error.status === 401) {
        //     doToken();

        // }
        console.error(error);
        res.status(500).send(error);
      });

  // BUG: hardcoding valid pages, /accounts need to be fixed
  let valid_pages = [1, 2, 3];

  const accountsToMap = {};

  for await (let i of valid_pages) {
    Object.assign(accountsToMap, await doAccounts(i));
  }

  res.send({ accountsToMap });
});

app.listen(port, () => {
  console.log(`Solution app listening on port ${port}`);
});
