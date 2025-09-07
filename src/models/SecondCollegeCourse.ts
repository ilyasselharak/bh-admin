import mongoose from "mongoose";

const SecondCollegeCourseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this course."],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    courseLink: {
      type: String,
      required: false,
    },
    exerciseLink: {
      type: String,
      required: false,
    },
    devoirLink: {
      type: String,
      required: false,
    },
    examenLink: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SecondCollegeCourse ||
  mongoose.model("Second_College_Course", SecondCollegeCourseSchema);
