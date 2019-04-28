import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  interviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  conf: {
    type: String,
    ref: 'Conference',
  },

  creation: Date,
  close: {
    type: Date,
    default: null,
  },

  response: {
    type: String,
    default: null,
  },
});

const Interview = mongoose.model('Interview', schema);

export default Interview;
