import mongoose from 'mongoose';

import Config from '../config';

// Load schemas
import './user';

export const connect = () => mongoose.connect(Config.dburi);
