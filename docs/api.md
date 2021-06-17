# LiquiChain API

## Endpoint /meveo/rest/jsonrpc

this is a rest api based o the ethereum json-rpc API

```
{
    "id":<requestId>,
    "jsonrpc":"2.0",
    "method":"<methofdName>",
    "params":["paramValue1","paramValue2",...]
}
```

In case of success the response is in the form 
```
{
  "id": <requestId>,
  "jsonrpc": "2.0",
  "result": "<resultData>"
}
```

In case of  error the response is in the form
```
{
  "id":  <requestId>,
  "jsonrpc": "2.0",
  "error": { "code" :  <errorCode> , "message" : <errorMessage>}
}
```

### eth_getTransactionCount

returns the number of transactions sent by the given wallet

method name : eth_getTransactionCount

params:
* wallet hash

result : the number of transaction sent from the wallet (pending, valid or invalid)

Ex: request
```
{
    "id":12,
    "jsonrpc":"2.0",
    "method":"eth_getTransactionCount",
    "params":["0xef678007d18427e6022059dbc264f27507cd1ffc"]
}
```

response 
```
{
  "id": 12,
  "jsonrpc": "2.0",
  "result": "0x1"
}
```

### wallet_creation

method name : wallet_creation

params :
* wallet name
* wallet address
* wallet public key

```
{
    "id":12,
    "jsonrpc":"2.0",
    "method":"wallet_creation",
    "params":["myWallet","0xef678007d18427e6022059dbc264f27507cd1ffc","0x506bc1dc099358e5137292f4efdd57e400f29ba5132aa5d12b18dac1c1f6aaba645c0b7b58158babbfa6c6cd5a48aa7340a8749176b120e8516216787a13dc76"]
}
```
