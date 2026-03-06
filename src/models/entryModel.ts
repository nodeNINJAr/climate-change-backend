import mongoose, { Schema } from 'mongoose';
import { Division, IEntry } from '../type';

const entrySchema = new Schema<IEntry>({
  division: {
    type: String,
    required: true,
    enum: Object.values(Division)
  },
  climateHazardCategory: {
    type: String,
    required: true,
    trim: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  updatedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedDate before saving
entrySchema.pre('save', function(next) {
  this.updatedDate = new Date();
  next();
});

export default mongoose.model<IEntry>('Entry', entrySchema);