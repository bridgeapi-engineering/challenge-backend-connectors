//Could make this variable const because it won't change
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
async function fetchTransactions(fromDate, authorization, jws = null, id, page, previousTransactions) {
	console.log(`--- Fetch Trasactions page n°${page} ---`);
	try {
	//Could use let and const globally instead of var
    var headers = {"Authorisation":  authorization }

    //Could make a global variable of headers instead of rewriting it
    //Maybe two versions one with and without jws
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
	//Don't seem to be a doRequest function anywhere
	  var {code, response } = await doRequest('GET',
  	//A bit strange to use two types of concatenation in one string
      domain + '/accounts/'+ id + '/transactions?' + `page=${page}`,
      headers);

	//Check if response is true is useless because it will always be the case
		if (response && code == 200 && response.data) {
	//Could really simplify the if box 
	// if (code == 200 && response.data && response.data.meta)
	// first check the current page before and maybe check if hasPageSuivante later on
      if (response.data.meta) {
        if (response.data.meta.hasPageSuivante) {
	//Could check the value of response.data.Mouvements before assigning it to a variable
          let mouvements = response.data.Mouvements;
          var date = mouvements[mouvements.length -1].dateValeur;
          if (date <= fromDate) {
            console.log("FromDate is Reached - we don't need more transaction");
          } else {
            // if we have mouvements
	  //This condition will always be true
            if (mouvements) {
              if (assertTransactions(mouvements)) {
                return [];
              } else {
                console.log(`Push transactions from page ${page}`);
              }
            } else {
              throw new Error("Empty list of transactions ! " + JSON.stringify(previousTransactions));
            }
            let nextPagesTransactions = fetchTransactions(fromDate, authorization, (jws || null), id, page + 1, mouvements);
            response.data.Mouvements = mouvements.concat(nextPagesTransactions);
          }
        }
      }
	//Why returning response.data.Mouvements instead of mouvements
      return response.data.Mouvements;
	//This error could be more precise with a specific error message
    } else throw new Error();
	//This code won't ever be reach
    return [];
	} catch (err) {
		throw new CustomError({
      function: 'fetchTransactions',
			statusCode: 'CRASH',
			rawError: e,
		});
	}
}
