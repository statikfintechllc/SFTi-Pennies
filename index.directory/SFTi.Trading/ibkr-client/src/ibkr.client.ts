import { rxWebSocket, RxWebSocketSubject } from 'rxwebsocket';
import { Agent, fetch } from 'undici';
import ws from 'ws';
import { IbkrOauth1, IbkrOauth1Config } from './ibkr.oauth1';

export class IbkrClient {
  readonly host: string = 'api.ibkr.com';
  readonly oauth1?: IbkrOauth1;
  session?: string;
  private token?: string;
  private readonly apiPath = '/v1/api/';
  private readonly url = {
    api: `https://${this.host}${this.apiPath}`,
    ws: `wss://${this.host}${this.apiPath}ws`,
  };

  constructor(config: string | IbkrOauth1Config) {
    if (typeof config === 'string') {
      this.host = config;
      this.url = {
        api: `https://${this.host}${this.apiPath}`,
        ws: `wss://${this.host}${this.apiPath}ws`,
      };
    } else {
      this.oauth1 = new IbkrOauth1(config);
      this.url.ws += '?oauth_token=' + this.oauth1.getAccessToken();
    }
  }

  async live(): Promise<{
    token: string;
    signature: string;
    expiration: string;
  }> {
    if (!this.oauth1) throw new Error('OAuth1 is not enabled');
    const path = 'oauth/live_session_token';
    const { headers, random, prepend } = this.oauth1.generateLiveSessionData(
      this.url.api + path,
    );
    const {
      diffie_hellman_response: response,
      live_session_token_signature: signature,
      live_session_token_expiration: expiration,
    } = await this.request({ path, method: 'POST', headers });
    const token = this.oauth1.generateLiveSessionToken(
      response,
      random,
      prepend,
    );
    if (!this.oauth1.validateLiveSessionToken(token, signature)) {
      throw new Error('Cannot validate live session token');
    }
    return { token, signature, expiration };
  }

  async init(compete = true, publish = true) {
    if (this.oauth1) this.token = (await this.live()).token;
    return this.request({
      path: 'iserver/auth/ssodh/init',
      method: 'POST',
      data: { publish, compete },
    });
  }

  socket(debug: string[] = []): RxWebSocketSubject<any> {
    const getSession = () => this.session;
    const rejectUnauthorized = !!this.oauth1;
    let interval: NodeJS.Timeout;
    const WebSocketCtor = function (url: string) {
      const socket = new ws.WebSocket(url, {
        headers: {
          Cookie: `api=${getSession()}`,
          'User-Agent': 'ClientPortalGW/1',
        },
        rejectUnauthorized,
      });
      socket.on('open', () => {
        if (debug.includes('open')) console.debug('[IBKR WebSocket] open');
        interval = setInterval(() => socket.send('tic'), 60000);
      });
      socket.on('close', (code) => {
        if (debug.includes('close')) {
          console.debug('[IBKR WebSocket] close', code);
        }
        clearInterval(interval);
      });
      if (debug.includes('error')) {
        socket.on('error', (error) =>
          console.debug('[IBKR WebSocket] error', error),
        );
      }
      if (debug.includes('receive')) {
        socket.on('message', (data) =>
          console.debug('[IBKR WebSocket] receive', data.toString()),
        );
      }
      return socket;
    } as unknown as new () => WebSocket;
    return rxWebSocket({
      WebSocketCtor,
      url: this.url.ws,
      serializer: (value) => {
        if (debug.includes('send')) {
          console.debug('[IBKR WebSocket] send', value);
        }
        return value;
      },
      openObserver: {
        next: () => console.debug('Connected to IBKR WebSocket'),
      },
      closeObserver: {
        next: () => console.debug('Disconnected from IBKR WebSocket'),
      },
      debug: true,
    });
  }

  async request(input: {
    path: string;
    method?: string;
    data?: object;
    params?: Record<string, string | number | boolean | null | undefined>;
    headers?: Record<string, string>;
  }): Promise<any> {
    const { path, data, method = 'GET' } = input;
    const baseUrl = this.url.api + path;
    const url = new URL(baseUrl);
    const params: Record<string, string> = {};
    Object.entries(input.params || {}).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (typeof value === 'number' || typeof value === 'boolean') {
        value = value.toString();
      }
      url.searchParams.append(key, value);
      params[key] = value;
    });
    const dispatcher = this.oauth1
      ? undefined
      : new Agent({ connect: { rejectUnauthorized: false } });
    const res = await fetch(url, {
      dispatcher,
      method,
      body: JSON.stringify(data),
      headers: {
        ...(input.headers ||
          this.oauth1?.generateOauthHeaders(
            baseUrl,
            method,
            this.token,
            params,
          )),
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      let body = await res.text();
      try {
        body = JSON.parse(body).error || body;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {}
      throw new Error(`Response status ${res.status}: ${body}`);
    }
    return res.json();
  }
}
