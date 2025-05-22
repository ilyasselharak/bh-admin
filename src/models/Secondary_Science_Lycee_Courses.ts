import { model, models, Schema } from "mongoose";

const SecondaryScienceLyceeCoursesSchema = new Schema(
  {
    name: String,
    courseLink: String,
    exerciseLink: String,
  },
  { timestamps: true }
);

const Secondary_Science_Lycee_Courses =
  models?.Secondary_Science_Lycee_Courses ||
  model("Secondary_Science_Lycee_Courses", SecondaryScienceLyceeCoursesSchema);

export default Secondary_Science_Lycee_Courses;
