import mongoose from "mongoose";

const FirstBacEconomicsDevoirSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  semester: { type: Number, required: true },
  level: { type: String, required: true, default: "lycee" },
  grade: { type: String, required: true, default: "economics" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.FirstBacEconomicsDevoir ||
  mongoose.model("FirstBacEconomicsDevoir", FirstBacEconomicsDevoirSchema);
