import mongoose from 'mongoose';
import crypto from 'crypto';
import { promisify } from 'util';

const randomBytes = promisify(crypto.randomBytes);

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,

    index: {
      unique: true,
    },
  },

  pass: { type: String, required: true },
  salt: { type: String, required: true },

  realname: { type: String, required: true },
  idNumber: { type: String, },

  profile: { type: Object, },

  status: {
    type: String,
    required: true,
    default: 'waiting',
    enum: [
      'waiting',
      'verified',
    ],
  },

  token: String,

  phone: String,

  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
});

schema.methods.setPass = async function(pass) {
  const hash = crypto.createHash('sha256');

  const bytes = await randomBytes(16);
  this.salt = bytes.toString('hex');

  hash.update(this.salt);
  hash.update(pass);

  this.pass = hash.digest('hex');
}

schema.methods.testPass = async function(pass) {
  const hash = crypto.createHash('sha256');

  hash.update(this.salt);
  hash.update(pass);

  return this.pass === hash.digest('hex');
}

const User = mongoose.model('User', schema);

export default User;
