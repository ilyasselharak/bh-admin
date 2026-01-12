import mongoose from 'mongoose';

const SecondBacMathBExamBlancsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  content: { type: String, required: true },
  solutionUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure id field is available for serialization
SecondBacMathBExamBlancsSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    return ret;
  }
});

export default mongoose.models.SecondBacMathBExamBlancs || mongoose.model('SecondBacMathBExamBlancs', SecondBacMathBExamBlancsSchema);

