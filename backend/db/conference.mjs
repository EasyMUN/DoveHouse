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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    stage: {
      type: String,
      enum: [
        'reg',
      ],
      default: 'reg',
    },

    tags: [String],

    reg: Object,
    extra: String,
  }],

  moderators: [
    mongoose.Schema.Types.ObjectId,
  ],

  publishes: [
    {
      title: String,
      main: String,

      date: String,
    },
  ],
});

const Conference = mongoose.model('Conference', schema);

export default Conference;
