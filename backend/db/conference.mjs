import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  _id: String,

  title: String,
  abbr: String,

  logo: String,
  background: String,
  desc: String,

  closed: {
    type: 'String',
    enum: [
      'register',
      'archived',
    ],
  },

  payments: [{
    provider: String,
    qr: String,
  }],

  requiresRealname: {
    type: Boolean,
    default: false,
  },

  registrants: [{
    user: mongoose.Schema.Types.ObjectId,

    stage: {
      type: String,
      enum: [
        'reg',
      ],
      default: 'reg',
    },

    reg: Object,
    extra: String,
  }],
});

const Conference = mongoose.model('Conference', schema);

export default Conference;
