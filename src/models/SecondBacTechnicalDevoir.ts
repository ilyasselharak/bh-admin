import mongoose from "mongoose";

const SecondBacTechnicalDevoirSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  content: { type: String, required: true },
  semester: { type: Number, required: true },
  level: { type: String, required: true, default: "lycee" },
  grade: { type: String, required: true, default: "2bac_technical" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SecondBacTechnicalDevoir ||
  mongoose.model("SecondBacTechnicalDevoir", SecondBacTechnicalDevoirSchema);
