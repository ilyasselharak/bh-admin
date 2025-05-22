import { model, models, Schema } from "mongoose";

const TctCourseSchema = new Schema(
  {
    name: String,
    courseLink: String,
    exerciseLink: String,
  },
  { timestamps: true }
);

const Tct_Course = models?.Tct_Course || model("Tct_Course", TctCourseSchema);

export default Tct_Course;
