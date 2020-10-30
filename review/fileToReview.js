const domain = "bank.local.fr";

async function getPageTransactions(authorization, accountId, pageNumber) {
	const { code, response } = await doRequest(
		"GET",
		`${domain}/accounts/${accountId}/transactions?page=${pageNumber}`,
		{
			Authorization: authorization,
			Accept: "application/json",
			"Content-type": "application/json",
		}
	);
	return handleResponse(code, response, accountId, pageNumber);
}

function handleResponse(code, response, accountId, pageNumber) {
	if (!response)
		throw new CustomError({
			function: "fetchPageTransactions",
			statusCode: 500,
			message: `Fetch Transaction failed for account n°${accountId} and page n°${pageNumber}`,
			accountId,
			pageNumber,
		});
	if (code != 200 || !response.data)
		throw new CustomError({
			function: "fetchPageTransactions",
			statusCode: code,
			message: response.statusText,
			accountId,
			pageNumber,
		});
	if (!response.data.mouvements) response.data.mouvements = [];
	if (!response.data.meta || !response.data.meta.hasPageSuivante)
		response.data.meta.hasNextPage = false;
	return response.data;
}

function isTransactionDateInRange(fromDate, transactionDate) {
	fromDate = Date.parse(fromDate);
	transactionDate = Date.parse(transactionDate);
	if (transactionDate <= fromDate) return true;
	return false;
}

/**
 * @description Fetch transactions recursively
 * @param {string} fromDate The maximum date of transactions to return
 * @param {string} authorization Authorization header to authent the user
 * @param {Number} accountId Account id
 * @param {Number} pageNumber Number of the page
 * @param {Object} previousTransactions Previous page of transactions (To ckeck for dupes)
 * @return {Object} All transactions available on the page
 */
async function fetchTransactions(
	fromDate,
	authorization,
	accountId,
	pageNumber = 1,
	previousTransactions = []
) {
	console.log(`--- Fetch Trasactions page n°${pageNumber} ---`);
	try {
		const pageTransactions = await getPageTransactions(
			authorization,
			accountId,
			pageNumber
		);

		const hasNextPage = pageTransactions.meta.hasNextPage;
		const transactionsFilteredByDate = pageTransactions.mouvements.filter(
			(mouvement) => isTransactionDateInRange(fromDate, mouvement.date)
		);

		if (assertTransactions(transactionsFilteredByDate)) {
			return previousTransactions;
		}

		const currentTransactions = [
			...previousTransactions,
			...transactionsFilteredByDate,
		];

		if (!hasNextPage) {
			return currentTransactions;
		}

		return await fetchTransactions(
			fromDate,
			authorization,
			accountId,
			pageNumber + 1,
			currentTransactions
		);
	} catch (err) {
		console.log(err);
		return previousTransactions;
	}
}
