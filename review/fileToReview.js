// review: const should be used here
var domain = "bank.local.fr"

/**
 * @description Fetch transactions recursively
 * @param {string} fromDate The maximum date of transactions to return
 * @param {string} authorization Authorization header to authent the user
 * @param {jws} jws Jws token, mandatory if we get one from login request
 * @param {Number} id Account id
 * @param {Number} page Number of the page
 * @param {Object} previousTransactions Previous page of transactions (To ckeck for dupes)
 * @return {Object} All transactions available on the page
 */
// review: function is not exported
// default param should be last
// the number of param is high, maybe a param like options = {} is a solution
async function fetchTransactions(fromDate, authorization, jws = null, id, page, previousTransactions) {
	console.log(`--- Fetch Trasactions page n°${page} ---`);
	try {
	  // block 1
    var headers = {"Authorisation":  authorization }

    if (jws) {
      headers = {
        "Authorisation": authorization,
        "jws": jws,
        "Content-type": "application/json",
        "Accept": "application/json"
      }
    } else {
      headers = {
        "Authorisation": authorization,
        "Content-type": "application/json",
        "Accept": "application/json",
      }
    }
    // end block 1

    // review: block1 can be simplified like this
    // const headers = {
    //   "Authorisation": authorization,
    //   "Content-type": "application/json",
    //   "Accept": "application/json",
    // }
    // if (jws) {
    //   headers.jws = jws;
    // }

    // review: doRequest id not imported
    // review: domain + '/accounts/'+ id + '/transactions?' + `page=${page}` is more readable if string interpolation is used
    // `${domain}/accounts/${id}/transactions?page=${page}`
	  var {code, response } = await doRequest('GET',
      domain + '/accounts/'+ id + '/transactions?' + `page=${page}`,
      headers);


    // review: === should be used instead == to avoid unexpected type coercion
		if (response && code == 200 && response.data) {
      if (response.data.meta) {
        if (response.data.meta.hasPageSuivante) {
          let mouvements = response.data.Mouvements;
          var date = mouvements[mouvements.length -1].dateValeur;
          if (date <= fromDate) {
            console.log("FromDate is Reached - we don't need more transaction");
          } else {
            // if we have mouvements
            if (mouvements) {
              // review: assertTransactions is not imported
              if (assertTransactions(mouvements)) {
                return [];
              } else {
                console.log(`Push transactions from page ${page}`);
              }
            } else {
              throw new Error("Empty list of transactions ! " + JSON.stringify(previousTransactions));
            }
            // review: fetchTransactions it's an async function, it should be await
            // nextPagesTransactions will not be an array, it will be a Promise
            let nextPagesTransactions = fetchTransactions(fromDate, authorization, (jws || null), id, page + 1, mouvements);
            response.data.Mouvements = mouvements.concat(nextPagesTransactions);
          }
        }
      }
      return response.data.Mouvements;
    } else throw new Error();

    return [];
	} catch (err) {
	  // review: CustomError is not imported
		throw new CustomError({
      function: 'fetchTransactions',
			statusCode: 'CRASH',
      // review: err should be used here
			rawError: e,
		});
	}
}
