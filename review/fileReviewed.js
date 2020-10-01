
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
    /**
        @description Review 1 : 
        Il est possible ici de définir un objet header par défaut puis ajouter l'objet jws si ce dernier est existant.
        Authorization s'écrit avec la lettre "z"
    */
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

    /**
        @description Review 2 : 
        La fonction doRequest fait elle partie d'un package non importé ?
        Cette fonction n'est définie nul part dans le code
    */
	  var {code, response } = await doRequest('GET',
      domain + '/accounts/'+ id + '/transactions?' + `page=${page}`,
      headers);


    /**
        @description Review 3 : 
        Il serait préférable de mieux indenter les if pour la lisibilité du code
        Possibilité d'ajouter une condition au premier if pour factoriser la condition
    */
		if (response && code == 200 && response.data) {
      if (response.data.meta) {
        if (response.data.meta.hasPageSuivante) {


    /**
        @description Review 3 : 
        La garantie de l'existance de la propriété Mouvements est elle définie par l'API ?
        Peut être testé l'existence de cette propriété (par exemple tester sa valeur .length) pour éviter l'erreur undefined
        On a ici le seul commentaire du code qui explique ce que fait le if, peut être ajouter plus de commentaire pour comprendre l'interaction entre les objets que l'on manipule plutôt que de décrire l'action d'une condition qu'il est plus facile de lire et de comprendre
    */
          let mouvements = response.data.Mouvements;
          var date = mouvements[mouvements.length -1].dateValeur;
          if (date <= fromDate) {
            console.log("FromDate is Reached - we don't need more transaction");
          } else {
            // if we have mouvements
        
    /**
        @description Review 4 : 
        La fonction assertTransactions n'est pas définie et ne semble appartenir à aucun package publique
        Si cette fonction retourne true, nous retournons une empty array alors que la fonction doit retourner un objet
        Si cette fonction ne retourne pas la valeur true, un console.log est affiché
    */
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
      return response.data.Mouvements;
    } else throw new Error();

    /**
        @description Review 5 : 
        Unreachable code detected = La ligne ci dessous ne sera jamais interprêtée 
    */
    return [];

    /**
        @description Review 6 : 
        statusCode est par définition une variable de type integer contenant un nombre qui indique le type d'erreur, il est préférable de changer le nom de la variable pour éviter les erreurs d'interprétation
        e n'est pas une variable définie, il faut utiliser la variable err qui a été définie (ou remplacer err par e)
    */
	} catch (err) {
		throw new CustomError({
      function: 'fetchTransactions',
			statusCode: 'CRASH',
			rawError: e,
		});
	}
}
