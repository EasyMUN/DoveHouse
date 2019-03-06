import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  slug: String,
  conference: String,

  title: String,
  abbr: String,

  subject: String,
  background: String,

  special: {
    type: String,
    enum: ['cirsis'],
  },

  questions: [{
    tag: String,

    kind: {
      type: String,
      enum: ['text', 'radio', 'checkbox'],
    },

    title: String,
    desc: String,
    
    options: [String],
  }],

  targets: [String],
});

const Committee = mongoose.model('Committee', schema);

export default Committee;
