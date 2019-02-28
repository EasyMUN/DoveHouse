import { BACKEND } from './config';

async function parseResp(resp) {
  if(resp.status === 204) return null;
  else if(resp.status >= 400)
    throw {
      code: resp.status,
      text: resp.statusText,
      body: await resp.text(),
    };
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
    headers: buildHeaders(),
  });

  return parseResp(resp);
}

export async function get(endpoint, token = null, method = 'GET') {
  const resp = await fetch(BACKEND + endpoint, {
    method,
    headers: buildHeaders(),
  });

  return parseResp(resp);
}
