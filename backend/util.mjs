import JWT from 'jsonwebtoken';
import Config from './config';

import crypto from 'crypto';
import { promisify } from 'util';

const randomBytes = promisify(crypto.randomBytes);

export async function generateJWT(user) {
  // TODO: expire
  const bytes = await randomBytes(16);
  const jwtid = bytes.toString('hex');
  return JWT.sign({ user }, Config.secret[0], { jwtid });
};
