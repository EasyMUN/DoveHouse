import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  _id: String,
  conference: String,

  title: String,
  abbr: String,

  subject: String,
  desc: String,
});

const Conference = mongoose.model('Conference', schema);

export default Conference;
