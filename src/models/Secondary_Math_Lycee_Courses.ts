import { model, models, Schema } from "mongoose";

const SecondaryMathLyceeCoursesSchema = new Schema(
  {
    name: String,
    courseLink: String,
    exerciseLink: String,
  },
  { timestamps: true }
);

const Secondary_Math_Lycee_Courses =
  models?.Secondary_Math_Lycee_Courses ||
  model("Secondary_Math_Lycee_Courses", SecondaryMathLyceeCoursesSchema);

export default Secondary_Math_Lycee_Courses;
