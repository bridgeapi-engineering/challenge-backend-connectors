// Importation du module http
const http = require('http');

// Déclaration des variables :

// Identifiants de l'utilisateur
const userInfos = JSON.stringify({
    "user": "BankinUser",
    "password": "12345678"
})

// ClientId et ClientSecret
const clientId = 'BankinClientId';
const clientSecret = 'secret';

// Paramètres pour les requêtes.
// On ajoutera si besoin le champ auth (ou header/Authorization) à la main.
const params = (path, method, contentType) => {
        return {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': contentType,
            }
        };
};

// Fonction qui éxécute l'appel à l'API et renvoie la réponse.
const doRequest = (params, data = '') => {
    return new Promise((resolve, reject) => {
        const req = http.request(params, (res) => {
            res.on('data', (response) => {
                // Si la requête retourne une erreur, on renvoie dans un reject l'erreur
                if (res.statusCode !== 200) {
                    reject(response.toString());
                }
                // Sinon, on reçoit la donnée attendue, on la renvoie en format JSON dans une resolve.
                else {
                    resolve(JSON.parse(response));
                }
            });
        }); 
    req.write(data);
    req.end();
    });
}

// Fonction qui permet de supprimer les éléments qui se répètent dans un tableau d'objets.
const deleteDouble = (array) => {
    // 1) On convertit les objets en string pour pouvoir utiliser Set
    for (let i = 0 ; i < array.length ; i++) {
        array[i] = JSON.stringify(array[i]);
    }
    // 2) On utilise Set pour supprimer les doublons
    array = Array.from(new Set(array));
    // 3) On re-convertit les string en objet
    for (i = 0 ; i < array.length ; i++) {
        array[i] = JSON.parse(array[i]);
    }
    // 4) On renvoie le tableau modifié
    return array;
}



// Flot principal d'exécution
(async () => {
    try {
        const dataToReturn = [];
        // Etape 1 : On appelle l'API Login via la fonction doRequest et on recupère le refresh token.
        const apiLoginRequestParams = params('/login', 'POST', 'application/json');
        apiLoginRequestParams.auth = clientId+':'+clientSecret;
        // NOTE : équivalent à apiLoginRequestParams.headers.Authorization = 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64');
        const refreshToken = (await doRequest(apiLoginRequestParams, userInfos)).refresh_token;
        // Etape 2 : On appelle l'API Token et on recupère l'access token.
        const accessToken = (await doRequest(params('/token', 'POST', 'application/x-www-form-urlencoded'), 'grant_type=refresh_token&refresh_token='+refreshToken)).access_token;
        // Etape 3 : On appelle l'API Accounts et on recupère les données des utilisateurs.
        let accountsArray = [] // Tableau dans lequel on va stocker les informations des utilisateurs.
        let apiAccountsRequestParams = params('/accounts', 'GET', 'application/json');
        apiAccountsRequestParams.headers.Authorization = 'Bearer ' + accessToken;
        let accountsResponse = await doRequest(apiAccountsRequestParams);
        // On ajoute les comptes un par un au tableau accountsArray
        for (let i = 0 ; i < accountsResponse.account.length ; i++) {
            accountsArray.push(accountsResponse.account[i]);
        }
        // Tant qu'une page suivante existe, on appel l'API avec le bon numéro de page et on ajoute les données des comptes dans le tableau accountsArray.
        while(accountsResponse.link.next) {
            apiAccountsRequestParams = params(accountsResponse.link.next, 'GET', 'application/json');
            apiAccountsRequestParams.headers.Authorization = 'Bearer ' + accessToken;
            accountsResponse = await doRequest(apiAccountsRequestParams);
            for (let i = 0 ; i < accountsResponse.account.length ; i++) {
                accountsArray.push(accountsResponse.account[i]);
            }
        }
        // On remarque que certains comptes apparaissent sur plusieurs pages ce qui crée des doublons. On va les supprimer :
        accountsArray = deleteDouble(accountsArray);
        // Etape 4 : Pour chaque utilisateur, on recupère ces transactions et on stocks les informations attendues dans dataToReturn.
        for (let i = 0 ; i < accountsArray.length ; i++) {
            let accountInfos = accountsArray[i];
            // On supprime l'information sur la devise qui n'est pas demandée dans l'exercice.
            delete accountInfos.currency;
            // Requête à l'API transaction
            let transactionsByAccountArray = [];
            try { // On est obligé de faire ça ici car il y a un compte pour lequel l'appel à l'API transaction ne fonctionne pas toujours et on ne veut pas que ça bloque tout le reste.
                let apiTransactionsRequestParams = params('/accounts/'+accountInfos.acc_number+'/transactions', 'GET', 'application/json');
                apiTransactionsRequestParams['headers']['Authorization'] = 'Bearer ' + accessToken;
                let transactionsByAccount = await doRequest(apiTransactionsRequestParams);
                // On ajoute les transactions par compte une par une au tableau transactionsByAccountArray
                for (let j = 0 ; j < transactionsByAccount.transactions.length ; j++) {
                    transactionsByAccountArray.push(transactionsByAccount.transactions[j]);
                }
                // Tant qu'une page suivante existe, on appel l'API avec le bon numéro de page et on ajoute les données des transactions dans le tableau transactionsByAccountArray.
                while(transactionsByAccount.link.next) {
                    apiTransactionsRequestParams = params(transactionsByAccount.link.next, 'GET', 'application/json');
                    apiTransactionsRequestParams.headers.Authorization = 'Bearer ' + accessToken;
                    transactionsByAccount = await doRequest(apiTransactionsRequestParams);
                    for (j = 0 ; j < transactionsByAccount.transactions.length ; j++) {
                        transactionsByAccountArray.push(transactionsByAccount.transactions[j]);
                    }
                } 
                // On remarque que certains transactions apparaissent sur plusieurs pages ce qui crée des doublons. On va les supprimer grâce à Set :
                transactionsByAccountArray = deleteDouble(transactionsByAccountArray);
                // Pour chaque transaction, on supprime les informations sur la signature et l'id qui ne sont pas demandées dans l'exercice.
                transactionsByAccountArray.forEach(element => {
                    delete element.sign;
                    delete element.id;
                });
            } catch(e) {
                console.log('API Transaction not avaiable for account n°'+accountInfos.acc_number);
            }
            // console.log(accountInfos, transactionsByAccountArray);
            // Ligne précédente à décommenter pour voir le contenu de 'transactions' par utilisateur, car dans la console il s'affichera transactions: [ [Object], [Object], [Object] ] pour le tableau dataToReturn.    
            // On push les infos demandées dans le tableau des informations à renvoyer
            dataToReturn.push({
                ...accountInfos,
                'transactions' : transactionsByAccountArray
            });      
        }
        console.log(dataToReturn);
        return dataToReturn;
    // Si une(des) requête(s) a(ont) été mal formalisée(s), un reject a été renvoyé par la fonction doRequest, on affiche l'erreur.
    } catch(e) {
        console.log(e);
    }
})();