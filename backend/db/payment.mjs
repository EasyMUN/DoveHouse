import mongoose from 'mongoose';
import crypto from 'crypto';
import { promisify } from 'util';

const schema = new mongoose.Schema({
  payee: mongoose.Schema.Types.ObjectId,
  conf: {
    type: String,
    ref: 'Conference',
  },

  ident: String,

  total: Number,
  desc: String,

  status: {
    type: String,
    enum: ['waiting', 'paid', 'closed'],
  },

  discounts: [
    { amount: Number, desc: String, until: Date, },
  ],

  creation: Date,
  confirmation: Date,
});

const Payment = mongoose.model('Payment', schema);

export default Payment;
