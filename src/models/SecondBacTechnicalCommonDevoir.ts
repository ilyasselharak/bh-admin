import mongoose from "mongoose";

const SecondBacTechnicalCommonDevoirSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  semester: { type: Number, required: true },
  level: { type: String, required: true, default: "lycee" },
  grade: { type: String, required: true, default: "2bac_tct" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SecondBacTechnicalCommonDevoir ||
  mongoose.model(
    "SecondBacTechnicalCommonDevoir",
    SecondBacTechnicalCommonDevoirSchema
  );
