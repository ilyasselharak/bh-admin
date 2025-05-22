import { model, models, Schema } from "mongoose";

const Secondary2BacLyceeTctCourses = new Schema(
  {
    name: String,
    courseLink: String,
    exerciseLink: String,
  },
  { timestamps: true }
);

const Secondary_2Bac_Lycee_Tct_Courses =
  models?.Secondary_2Bac_Lycee_Tct_Courses ||
  model("Secondary_2Bac_Lycee_Tct_Courses", Secondary2BacLyceeTctCourses);

export default Secondary_2Bac_Lycee_Tct_Courses;
