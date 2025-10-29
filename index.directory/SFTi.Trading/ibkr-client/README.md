# IBKR (Interactive Brokers) Web API Client with OAuth support

This TypeScript module is a client for IBKR modern REST Web API: [Official Docs](https://www.interactivebrokers.com/campus/ibkr-api-page/web-api/) & [API Reference](https://www.interactivebrokers.com/campus/ibkr-api-page/webapi-ref/).

It connects both via IB Gateway and directly using OAuth protocol.

It supports both REST API (via Fetch) and WebSocket (via RxJS client with exponential back-off).

It does not work with legacy TWS API, so please don't get confused.

It is highly recommended to read the official documentation and get familiar with IBKR API and connection concepts before using this module and integrating it into a trading system.

## Install
`npm i ibkr-client`

It contains both ESM modern version and CommonJS version for NodeJS legacy.

## Configuration
There are 2 options of connecting to IBKR Web API:
1. Via their intermediate layer called IB Gateway (standard option).
2. Directly using OAuth protocol (available only to institutional users).

### IB Gateway
```
import { IbkrClient } from 'ibkr-client';
const client = new IbkrClient('http://url_to_ib_gateway_instance');
```

### OAuth
OAuth access allows for direct connection, but it's available only for institutional users.

At the moment only OAuth1.0a method is supported.

OAuth2.0 should be available later. Feel free to [fund this package](https://buymeacoffee.com/artico) to speed the work up.

In order to use OAuth1.0a method one first needs to obtain configuration files and generate `oauth1.json` file using `node configure` script bundled with this module.
1. Getting configuration files can be done on this [page](https://ndcdyn.interactivebrokers.com/sso/Login?action=OAUTH&RL=1&ip2loc=US).
2. That page contains instructions on how to manually generate Access Token and Secret.
3. Please note that `openssl` has to be installed to complete this process.
4. After successfully completing OAuth setup process there should be 3 files and 3 strings:
   1. File `dhparam.pem`
   2. File `private_encryption.pem`
   3. File `private_signature.pem`
   4. String `Consumer Key`
   5. String `Access Token`
   6. String `Access Token Secret`
5. Having all those 6 key things one can generate `oauth1.json` configuration file.
6. Go to the module directory: `cd node_modules/ibkr-client`.
7. Put 3 above-mentioned files into that directory.
8. Run generation script: `node configure`.
9. Use 3 above-mentioned strings when requested by the script.
10. As result, file `oauth1.json` will be generated and ready to use by the client.
11. Put `oauth1.json` in some secure location that is not available from outside as it contains secure information that can be used to perform trades on behalf of IBKR account owner.

```
import { IbkrClient } from 'ibkr-client';

const config = JSON.parse(fs.readFileSync('path_to_oauth1.json', 'utf8'));

const client = new IbkrClient(config);
```

### Without `oauth1.json` file
It's possible to pass all required parameters directly to `IbkrClient` during instantiation:
```
import { IbkrClient } from 'ibkr-client';

const config = {
  accessTokenSecret: string;
  accessToken: string;
  consumerKey: string;
  encryption: string;
  signature: string;
  dhPrime: string;
  realm: string;
}

const client = new IbkrClient(config);
```

## Usage

### Initialization
Before making REST API calls or connect to the WebSocket it's needed to initialize a session: 

```
await client.init();
```
This method supports 2 optional arguments, both are `true` by default: `init(compete = true, publish = true)`.

Please refer to the [documentation](https://www.interactivebrokers.com/campus/ibkr-api-page/webapi-ref/#tag/Trading-Session/paths/~1iserver~1auth~1ssodh~1init/post) in order to clarify those parameters meaning.

In case of using OAuth1.0a, live session token will be obtained automatically by calling `init()`.

### Tickle
In order to keep the session alive it's needed to periodically call the [tickle](https://www.interactivebrokers.com/campus/ibkr-api-page/webapi-ref/#tag/Trading-Session/paths/~1tickle/post) endpoint:
```
const res = await client.request({ path: 'tickle', method: 'POST' });

// it will return the session token that can be shown like this:
console.log('session token', res.session);

// the token may be re-generated after some time, so it's required to update it to the client:
client.session = res.session;

// IBKR API is known to be a bit slow during initialization,
// which may cause unexpected issues when API calls are made shortly after the first tickle(),
// so it's a good idea to wait for 1 second before making API requests, for example:
new Promise((r) => setTimeout(r, 1000));
```

### REST API calls
In order to make calls to IBKR REST API use universal `request` method:
```
async request(input: {
  path: string;
  method?: string; // GET by default
  data?: object;
  params?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
})
```

For example, request to get [portfolio accounts](https://www.interactivebrokers.com/campus/ibkr-api-page/webapi-ref/#tag/Trading-Portfolio/paths/~1portfolio~1accounts/get) will look like this:
```
const res = await client.request({ path: 'portfolio/accounts' });
```

And [stocks search](https://www.interactivebrokers.com/campus/ibkr-api-page/webapi-ref/#tag/Trading-Contracts/paths/~1trsrv~1stocks/get) will look like this:
```
const symbols = ['AAPL', 'AMZN'];

const res = await client.request({
  path: 'trsrv/stocks',
  params: { symbols: symbols.join(',') },
});
```

### WebSocket
A lot of data can be received via IBKR WebSocket, for example [live order updates](https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#ws-order-updates-sub):
```
const socket = client.socket();

socket.multiplex(
  () => {
    return 'sor+{}';
  },
  () => {
    return 'uor+{}';
  },
  (data) => {
    return data.topic === 'sor';
  },
);
```

For debugging purposes one may want to watch the data being sent and received through WebSocket, it can be done with the oprional `debug` argument of `client.socket()`:
```
const socket = client.socket(['send', 'receive']);
```
All available values for debug string array are: _open, close, send, receive, error_.

`socket()` method returns `RxWebSocketSubject` that uses [rxwebsocket](https://www.npmjs.com/package/rxwebsocket) module under the hood, which is a wrapper around standard RxJS WebSocketSubject with advanced capabilities, check it out.
