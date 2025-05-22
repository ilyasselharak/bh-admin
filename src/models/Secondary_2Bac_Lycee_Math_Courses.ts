import { model, models, Schema } from "mongoose";

const Secondary2BacLyceeMathCourses = new Schema(
  {
    name: String,
    courseLink: String,
    exerciseLink: String,
  },
  { timestamps: true }
);

const Secondary_2Bac_Lycee_Math_Courses =
  models?.Secondary_2Bac_Lycee_Math_Courses ||
  model("Secondary_2Bac_Lycee_Math_Courses", Secondary2BacLyceeMathCourses);

export default Secondary_2Bac_Lycee_Math_Courses;
