import mongoose from "mongoose";

const SecondBacTechnicalCommonCourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  courseLink: { type: String },
  exerciseLink: { type: String },
  devoirLink: { type: String },
  examenLink: { type: String },
  level: { type: String, required: true, default: "lycee" },
  grade: { type: String, required: true, default: "2bac_tct" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SecondBacTechnicalCommonCourse ||
  mongoose.model(
    "SecondBacTechnicalCommonCourse",
    SecondBacTechnicalCommonCourseSchema
  );
