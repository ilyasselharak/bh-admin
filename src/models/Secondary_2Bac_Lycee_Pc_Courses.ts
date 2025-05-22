import { model, models, Schema } from "mongoose";

const Secondary2BacLyceePcCourses = new Schema(
  {
    name: String,
    courseLink: String,
    exerciseLink: String,
  },
  { timestamps: true }
);

const Secondary_2Bac_Lycee_Pc_Courses =
  models?.Secondary_2Bac_Lycee_Pc_Courses ||
  model("Secondary_2Bac_Lycee_Pc_Courses", Secondary2BacLyceePcCourses);

export default Secondary_2Bac_Lycee_Pc_Courses;
