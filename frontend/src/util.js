import { BACKEND } from './config';
import md5 from 'blueimp-md5';

class FetchError extends Error {
  constructor(code, text, body) {
    super(body);

    this.code = code;
    this.text = text;
    this.body = body;
  }

  static async from(resp) {
    return new FetchError(resp.status, resp.statusText, await resp.text())
  }
}

async function parseResp(resp) {
  if(resp.status === 204) return null;
  else if(resp.status >= 400)
    throw await FetchError.from(resp);
  else if(resp.headers.get('Content-Type').indexOf('application/json') === 0)
    return resp.json();
  else return resp.text();
}

function buildHeaders(token) {
  const result = new Headers({
    'Content-Type': 'application/json',
  });

  if(token !== null)
    result.append('Authorization', `Bearer ${token}`);

  return result;
}

export async function post(endpoint, payload, token = null, method = 'POST') {
  const resp = await fetch(BACKEND + endpoint, {
    method,
    body: JSON.stringify(payload),
    headers: buildHeaders(token),
  });

  return parseResp(resp);
}

export async function get(endpoint, token = null, method = 'GET') {
  const resp = await fetch(BACKEND + endpoint, {
    method,
    headers: buildHeaders(token),
  });

  return parseResp(resp);
}

export function gravatar(email, size=80) {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=blank`;
}
