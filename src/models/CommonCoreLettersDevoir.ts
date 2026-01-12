import mongoose from "mongoose";

const CommonCoreLettersDevoirSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  content: { type: String, required: true },
  semester: { type: Number, required: true },
  level: { type: String, required: true },
  grade: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.CommonCoreLettersDevoir ||
  mongoose.model("CommonCoreLettersDevoir", CommonCoreLettersDevoirSchema);
