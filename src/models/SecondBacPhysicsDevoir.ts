import mongoose from "mongoose";

const SecondBacPhysicsDevoirSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  semester: { type: Number, required: true },
  level: { type: String, required: true, default: "lycee" },
  grade: { type: String, required: true, default: "2bac_physics" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SecondBacPhysicsDevoir ||
  mongoose.model("SecondBacPhysicsDevoir", SecondBacPhysicsDevoirSchema);
