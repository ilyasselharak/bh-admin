import { model, models, Schema } from "mongoose";

const FirstCollegueCourseSchema = new Schema(
  {
    name: String,
    courseLink: String,
    exerciseLink: String,
  },
  { timestamps: true }
);

const First_Collegue_Course =
  models?.First_Collegue_Course ||
  model("First_Collegue_Course", FirstCollegueCourseSchema);

export default First_Collegue_Course;
