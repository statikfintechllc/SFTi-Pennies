import * as forge from 'node-forge';
import * as crypto from 'node:crypto';

export type IbkrOauth1Config = {
  accessTokenSecret: string;
  accessToken: string;
  consumerKey: string;
  encryption: string;
  signature: string;
  dhPrime: string;
  realm: string;
};

export class IbkrOauth1 {
  private readonly config: IbkrOauth1Config;
  private readonly host: string;

  constructor(config: IbkrOauth1Config, host = 'api.ibkr.com') {
    this.config = config;
    this.host = host;
  }

  getAccessToken() {
    return this.config.accessToken;
  }

  generateLiveSessionData(url: string): {
    headers: Record<string, string>;
    random: string;
    prepend: string;
  } {
    const random = crypto.randomBytes(32).toString('hex');
    const diffie_hellman_challenge = this.modPow(
      BigInt(2),
      BigInt('0x' + random),
      BigInt('0x' + this.config.dhPrime),
    ).toString(16);
    const prepend = this.calculatePrepend(
      this.config.accessTokenSecret,
      forge.pki.privateKeyFromPem(this.config.encryption),
    );
    const headers = this.generateOauthHeaders(
      url,
      'POST',
      undefined,
      undefined,
      { diffie_hellman_challenge },
      prepend,
    );
    return { headers, random, prepend };
  }

  generateOauthHeaders(
    url: string,
    method: string,
    token?: string,
    params?: Record<string, string>,
    extraHeaders?: Record<string, string>,
    prepend?: string,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      oauth_signature_method: token ? 'HMAC-SHA256' : 'RSA-SHA256',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_consumer_key: this.config.consumerKey,
      oauth_nonce: this.generateOAuthNonce(),
      oauth_token: this.config.accessToken,
      ...extraHeaders,
    };
    const baseString = this.generateBaseString(
      url,
      method,
      headers,
      params,
      prepend,
    );
    headers.realm = this.config.realm;
    headers.oauth_signature = token
      ? this.generateHmacSha256Signature(baseString, token)
      : this.generateRsaSha256Signature(
          baseString,
          forge.pki.privateKeyFromPem(this.config.signature),
        );
    const oauth = Object.entries(headers)
      .sort()
      .map(([key, value]) => `${key}="${value}"`)
      .join(', ');
    return {
      Accept: '*/*',
      'Accept-Encoding': 'gzip,deflate',
      Authorization: `OAuth ${oauth}`,
      Connection: 'keep-alive',
      Host: this.host,
      'User-Agent': 'ClientPortalGW/1',
    };
  }

  generateLiveSessionToken(
    dhResponse: string,
    dhRandom: string,
    prepend: string,
  ): string {
    const challenge = this.modPow(
      BigInt('0x' + dhResponse),
      BigInt('0x' + dhRandom),
      BigInt('0x' + this.config.dhPrime),
    );
    const hmac = crypto.createHmac(
      'sha1',
      Buffer.from(this.toByteArray(challenge)),
    );
    hmac.update(Buffer.from(prepend, 'hex'));
    return hmac.digest('base64');
  }

  validateLiveSessionToken(token: string, signature: string): boolean {
    const hmac = crypto.createHmac('sha1', Buffer.from(token, 'base64'));
    hmac.update(this.config.consumerKey, 'utf8');
    return hmac.digest('hex') === signature;
  }

  /**
   * Private
   */
  private generateOAuthNonce(): string {
    const az = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let nonce = '';
    for (let i = 0; i < 16; i++) {
      nonce += az.charAt(Math.floor(Math.random() * az.length));
    }
    return nonce;
  }

  private generateBaseString(
    url: string,
    method: string,
    headers: Record<string, string>,
    params: Record<string, string> = {},
    prepend?: string,
  ): string {
    const parts: Record<string, string> = {};
    Object.assign(parts, headers);
    Object.assign(parts, params);
    const partsString = Object.entries(parts)
      .sort(([a], [b]) => (a > b ? 1 : a < b ? -1 : 0))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    const baseString = [
      method,
      this.quotePlus(url),
      this.quotePlus(partsString),
    ].join('&');
    return (prepend || '') + baseString;
  }

  private generateRsaSha256Signature(
    baseString: string,
    key: forge.pki.PrivateKey,
  ): string {
    const md = forge.sha256.create();
    md.update(baseString, 'utf8');
    return this.quotePlus(forge.util.encode64((key as any).sign(md)));
  }

  private generateHmacSha256Signature(
    baseString: string,
    token: string,
  ): string {
    const hmac = crypto.createHmac('sha256', Buffer.from(token, 'base64'));
    hmac.update(baseString, 'utf8');
    return this.quotePlus(hmac.digest('base64'));
  }

  private calculatePrepend(secret: string, key: forge.pki.PrivateKey): string {
    // using forge because RSAES-PKCS1-V1_5 is not supported by node anymore
    return forge.util.bytesToHex(
      (key as any).decrypt(
        forge.util.createBuffer(forge.util.decode64(secret), 'raw').bytes(),
        'RSAES-PKCS1-V1_5',
      ),
    );
  }

  /**
   * Utils
   */
  private quotePlus(str: string): string {
    return encodeURIComponent(str).replace(/%20/g, '+');
  }

  private toByteArray(x: bigint): number[] {
    let hexString = x.toString(16);
    if (hexString.length % 2 > 0) hexString = '0' + hexString;
    const byteArray: number[] = [];
    if (x.toString(2).length % 8 === 0) byteArray.push(0);
    for (let i = 0; i < hexString.length; i += 2) {
      byteArray.push(parseInt(hexString.substring(i, i + 2), 16));
    }
    return byteArray;
  }

  private modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    if (modulus === 1n) return 0n;
    let result = 1n;
    base %= modulus;
    while (exponent > 0n) {
      if (exponent % 2n === 1n) result = (result * base) % modulus;
      base = (base * base) % modulus;
      exponent = exponent / 2n;
    }
    return result;
  }
}
