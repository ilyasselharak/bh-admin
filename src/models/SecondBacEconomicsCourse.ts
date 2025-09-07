import mongoose from "mongoose";

const SecondBacEconomicsCourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  courseLink: { type: String },
  exerciseLink: { type: String },
  devoirLink: { type: String },
  examenLink: { type: String },
  level: { type: String, required: true, default: "lycee" },
  grade: { type: String, required: true, default: "2bac_eco" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SecondBacEconomicsCourse ||
  mongoose.model("SecondBacEconomicsCourse", SecondBacEconomicsCourseSchema);
