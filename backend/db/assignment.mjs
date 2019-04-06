import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  assignee: mongoose.Schema.Types.ObjectId,
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
