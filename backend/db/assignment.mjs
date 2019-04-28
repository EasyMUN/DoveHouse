import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  conf: {
    type: String,
    ref: 'Conference',
  },

  title: String,

  probs: [String],
  ans: [String],

  creation: Date,
  submitted: Boolean,
  deadline: Date,
});

const Assignment = mongoose.model('Assignment', schema);

export default Assignment;
