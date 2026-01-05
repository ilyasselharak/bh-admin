import mongoose from 'mongoose';

const SecondBacMathAExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  pdfUrl: { type: String, required: true },
  content: { type: String, required: true },
  solutionUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure id field is available for serialization
SecondBacMathAExamSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    return ret;
  }
});

export default mongoose.models.SecondBacMathAExam || mongoose.model('SecondBacMathAExam', SecondBacMathAExamSchema);

