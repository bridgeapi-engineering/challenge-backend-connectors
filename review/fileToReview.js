
const domain = "bank.local.fr"

/**
	* @description Fetch transactions recursively
	* @param {string} fromDate The maximum date of transactions to return
	* @param {string} authorization Authorization header to authent the user
	* @param {jws} jws Jws token, mandatory if we get one from login request
	* @param {Number} accountId Account id
	* @param {Number} numPage Number of the page
	* @param {Object} previousTransactions Previous page of transactions (To check for dupes)
	* @return {Array} allTransactions All transactions available on the page
*/
async function fetchTransactions(fromDate, authorization, jws = null, accountId, numPage, previousTransactions) {
	
	console.log(`--- Fetch Trasactions page n°${numPage} ---`);
	
	try {
		
		let headers = {
			"Authorisation": authorization,
			"Content-type": "application/json",
			"Accept": "application/json",
		}
		if (jws) {
			headers.jws = jws;
		}
		
		let {code, response } = await doRequest('GET', domain + '/accounts/' + accountId + '/transactions?' + `page=${numPage}`, headers);
		
		
		if (code == 200 && response.data) {
			if (response.data.meta) {
				if (response.data.meta.hasPageSuivante) {
				
					let mouvements = response.data.Mouvements;
					let date = mouvements[mouvements.length -1].dateValeur;
					
					if (date <= fromDate) {
						console.log("FromDate is Reached - we don't need more transaction");
					} else {
						// if we have mouvements
						if (mouvements) {
							if (assertTransactions(mouvements)) {
								return [];
							} else {
								console.log(`Push transactions from page ${numPage}`);
							}
						} else {
							throw new Error("Empty list of transactions ! " + JSON.stringify(previousTransactions));
						}
						let nextPagesTransactions = fetchTransactions(fromDate, authorization, (jws || null), accountId, numPage + 1, mouvements);
						response.data.Mouvements = mouvements.concat(nextPagesTransactions);
					}
				}
			}
			return response.data.Mouvements;
		} else throw new Error("Problem with code or response : " + code + " " + response);
		
		return [];
		
	} catch (err) {
		throw new CustomError({
			function: 'fetchTransactions',
			statusCode: 'CRASH',
			rawError: err,
		});
	}
}
