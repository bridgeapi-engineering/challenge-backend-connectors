"use strict";
const axios = require("axios");

const domain = "bank.local.fr";

/**
 * @description Fetch transactions recursively
 * @param {string} fromDate The maximum date of transactions to return
 * @param {string} authorization Authorization header to authenticate the user
 * @param {jws} jws Jws token, mandatory if we get one from login request
 * @param {Number} id Account id
 * @param {Number} page Current page number
 * @param {Object} previousTransactions Previous page of transactions (To check for duplicates)
 * @return {Object} All transactions available on the page
 */
const fetchTransactions = async (
  fromDate,
  authorization,
  jws = null,
  id,
  page,
  previousTransactions
) => {
  try {
    let headers = {
      authorization,
      "Content-type": "application/json",
      Accept: "application/json",
    };

    if (jws) {
      headers = {
        ...headers,
        jws,
      };
    }

    const { code, response } = await doRequest(
      "GET",
      `${domain}/accounts/${id}/transactions?page=${page}`,
      headers
    );

    if (validateResponse(response) && code === 200) {
      if (response.data.meta && response.data.meta.hasPageSuivante) {
        const mouvements = response.data.Mouvements;
        if (!mouvements) return [];

        const date = mouvements[mouvements.length - 1].dateValeur;
        if (date <= fromDate) return [];

        if (assertTransactions(mouvements)) {
          //means no transactions?
          throw new Error(
            `Empty list of transactions ! ${JSON.stringify(
              previousTransactions
            )}`
          );
        }

        const nextPagesTransactions = fetchTransactions(
          fromDate,
          authorization,
          jws || null,
          id,
          page + 1,
          mouvements
        );
        response.data.Mouvements = [...mouvements, ...nextPagesTransactions];
      }

      return response.data.Mouvements;
    } else {
      throw new Error(
        `Invalid response: ${JSON.stringify({ code, response })}`
      );
    }
  } catch (err) {
    throw new CustomError({
      function: "fetchTransactions",
      statusCode: "CRASH",
      rawError: err,
    });
  }
};

const validateResponse = (response) => response && response.data;
const assertTransactions = (mouvements) => mouvements.length > 0;
const doRequest = async (method, url, headers) =>
  axios({ url, headers, method });
