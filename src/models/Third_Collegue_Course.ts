import { model, models, Schema } from "mongoose";

const ThirdCollegueCourseSchema = new Schema(
  {
    name: String,
    courseLink: String,
    exerciseLink: String,
  },
  { timestamps: true }
);

const Third_Collegue_Course =
  models?.Third_Collegue_Course ||
  model("Third_Collegue_Course", ThirdCollegueCourseSchema);

export default Third_Collegue_Course;
