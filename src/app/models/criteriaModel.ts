import mongoose, { Schema } from 'mongoose';
import { ICriteria } from '../type/index';

const criteriaSchema = new Schema<ICriteria>({
  entryId: {
    type: Schema.Types.ObjectId,
    ref: 'Entry',
    required: true
  },
  criteriaTitle: {
    type: String,
    required: true,
    trim: true
  },
  weight: {  // ← ADD THIS FIELD!
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<ICriteria>('Criteria', criteriaSchema);