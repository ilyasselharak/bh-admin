import { model, models, Schema } from "mongoose";

const Secondary2BacLyceeEcoCourses = new Schema(
  {
    name: String,
    courseLink: String,
    exerciseLink: String,
  },
  { timestamps: true }
);

const Secondary_2Bac_Lycee_Eco_Courses =
  models?.Secondary_2Bac_Lycee_Eco_Courses ||
  model("Secondary_2Bac_Lycee_Eco_Courses", Secondary2BacLyceeEcoCourses);

export default Secondary_2Bac_Lycee_Eco_Courses;
