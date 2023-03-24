# Bridge challenge backend connectors

This client must retrieve and aggregate accounts and transactions data as described below :

```json
[
  {
    "acc_number": "0000001",
    "amount": 50,
    "transactions": [
      {
        "id": 1,
        "label": "Label 1",
        "sign": "CDT",
        "amount": 50,
        "currency": "EUR"
      },
      ...
    ]
  },
  ...
]
```

---

## Installing

```
npm install
npm start
```

---

## Swagger

Here is the server swagger : https://dsague.fr/swaggerui/

---

## Endpoints

- [Health](#Health)
- [Accounts](#Accounts)
- [Transactions](#Transactions)

---

## Health

Get API health.

**URL** : `https://dsague.fr/health`

**Method** : `GET`

#### Success Response

**Code** : `200 OK`

**Content**

```
ok
```

---

## Accounts

Get all user's accounts.

**URL** : `https://dsague.fr/accounts`

**Method** : `GET`

**Headers** :

- `Content-Type: application/json`
- `x-api-key: {key provided}`

#### Success Response

**Code** : `200 OK`

**Content example**

```json
{
  "accounts": [
    {
      "acc_number": "000000001",
      "amount": "3000",
      "currency": "EUR"
    }
  ],
  "links": {
    "self": "/accounts?page=1",
    "next": "/accounts?page=2"
  }
}
```

#### Error Response

**Condition** : If access token is wrong.

**Code** : `401 UNAUTHORIZED`

---

## Transactions

Get an account's transactions, by account number

**URL** : `https://dsague.fr/accounts/<acc_number>/transactions`

**Method** : `GET`

**Headers** :

- `Content-Type: application/json`
- `x-api-key: {key provided}`

#### Success Response

**Code** : `200 OK`

**Content example**

```json
{
  "transactions": [
    {
      "id": 1,
      "label": "label 1",
      "sign": "DBT",
      "amount": "30",
      "currency": "EUR"
    }
  ],
  "links": {
    "self": "/accounts/0000001/transactions?page=1",
    "next": "/accounts/0000001/transactions?page=2"
  }
}
```

_Sign references_

| Sign label | Meaning            |
| ---------- | ------------------ |
| DBT        | Debit transaction  |
| CDT        | Credit transaction |

#### Error Response

**Condition** : If key api is wrong.

**Code** : `401 UNAUTHORIZED`
