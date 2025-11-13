import mongoose from "mongoose";

const FirstBacScienceDevoirSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  semester: { type: Number, required: true },
  level: { type: String, required: true, default: "lycee" },
  grade: { type: String, required: true, default: "science" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.FirstBacScienceDevoir ||
  mongoose.model("FirstBacScienceDevoir", FirstBacScienceDevoirSchema);
