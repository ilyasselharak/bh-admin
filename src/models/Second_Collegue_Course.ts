import { model, models, Schema } from "mongoose";

const SecondCollegueCourseSchema = new Schema(
  {
    name: String,
    courseLink: String,
    exerciseLink: String,
  },
  { timestamps: true }
);

const Second_Collegue_Course =
  models?.Second_Collegue_Course ||
  model("Second_Collegue_Course", SecondCollegueCourseSchema);

export default Second_Collegue_Course;
