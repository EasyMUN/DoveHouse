import JWT from 'jsonwebtoken';
import Config from './config';

import crypto from 'crypto';
import { promisify } from 'util';

const randomBytes = promisify(crypto.randomBytes);

export async function generateJWT(value, key = 'user') {
  // TODO: expire
  const bytes = await randomBytes(16);
  const jwtid = bytes.toString('hex');
  return JWT.sign({ [key]: value }, Config.secret[0], { jwtid });
};
