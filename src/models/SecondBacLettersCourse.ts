import mongoose from "mongoose";

const SecondBacLettersCourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  courseLink: { type: String },
  exerciseLink: { type: String },
  devoirLink: { type: String },
  examenLink: { type: String },
  level: { type: String, required: true, default: "lycee" },
  grade: { type: String, required: true, default: "2bac_letters" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SecondBacLettersCourse ||
  mongoose.model("SecondBacLettersCourse", SecondBacLettersCourseSchema);
