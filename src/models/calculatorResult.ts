import mongoose, { Schema } from 'mongoose';
import { ICalculationResult } from '../type';

const calculationResultSchema = new Schema<ICalculationResult>({
  division: {
    type: String,
    required: true
  },
  entryId: {
    type: Schema.Types.ObjectId,
    ref: 'Entry',
    required: true
  },
  criteriaResults: [{
    criteriaId: {
      type: Schema.Types.ObjectId,
      ref: 'Criteria'
    },
    criteriaTitle: String,
    selectedConfig: String,
    configValue: Number
  }],
  totalScore: {
    type: Number,
    required: true
  },
  averageScore: {
    type: Number,
    required: true
  },
  riskLevel: {
    type: String,
    required: true
  },
  pdfUrl: {
    type: String
  },
  calculatedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<ICalculationResult>('CalculationResult', calculationResultSchema);