
const domain = "bank.local.fr";

/**
 * @description Fetch transactions recursively
 * @param {string} fromDate The maximum date of transactions to return
 * @param {string} authorization Authorization header to authenticate the user
 * @param {jws} jws Jws token, mandatory if we get one from login request
 * @param {Number} accountId Account id
 * @param {Number} page Number of the page
 * @param {Object} previousTransactions Previous page of transactions (To check for dupes)
 * @return {Object} allTransactions transactions available on the page
 */
const fetchTransactions = async (
  fromDate,
  authorization,
  jws = null,
  accountId,
  page,
  previousTransactions) => {
  console.log(`--- Fetch Transactions page n°${page} ---`);
  try {
    let headers = {
      "Authorisation":  authorization,
      "Content-type": "application/json",
      "Accept": "application/json"
    };

    if (jws) {
      headers.jws = jws;
    }

    const {code, response} = await doRequest('GET',
      `${domain}/accounts/${accountId}/transactions?page=${page}`,
      headers);


    if (code === 200 && response.data && response.data.meta && response.data.meta.hasNextPage) {
      if (response.data.Mouvements) {
        let mouvements = response.data.Mouvements;
        const date = mouvements[mouvements.length - 1].valueDate;
        if (date <= fromDate) {
          console.log("FromDate is Reached - we don't need more transaction");
        } else {
          if (mouvements) {
            if (assertTransactions(mouvements)) {
              return [];
            } else {
              console.log(`Push transactions from page ${page}`);
            }
          } else {
            throw new Error("Empty list of transactions ! " + JSON.stringify(previousTransactions));
          }
          let nextPagesTransactions = fetchTransactions(fromDate, authorization, (jws || null), accountId, page + 1, mouvements);
          mouvements.concat(nextPagesTransactions);
        }
        return mouvements;
      } else throw new Error();
    }
  } catch (err) {
    throw new CustomError({
      function: 'fetchTransactions',
      statusCode: 400,
      rawError: err,
    });
  }
}
