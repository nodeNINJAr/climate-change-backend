import mongoose, { Schema } from 'mongoose';
import { DamageLevel, IConfig } from '../type';

const configSchema = new Schema<IConfig>({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: Object.values(DamageLevel)
  },
  value: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IConfig>('Config', configSchema);