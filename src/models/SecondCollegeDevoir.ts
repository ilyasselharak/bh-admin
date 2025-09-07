import mongoose from "mongoose";

const SecondCollegeDevoirSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  semester: { type: Number, required: true },
  level: { type: String, required: true, default: "college" },
  grade: { type: String, required: true, default: "2" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SecondCollegeDevoir ||
  mongoose.model("SecondCollegeDevoir", SecondCollegeDevoirSchema);
