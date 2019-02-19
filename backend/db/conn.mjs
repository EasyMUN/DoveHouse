import mongoose from 'mongoose';

const DBURI = process.env.DBURI || 'mongodb://localhost/dovehouse';

export default () => mongoose.connect(DBURI);
