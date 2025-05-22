import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Course from "../../../../models/Course";

// Import all course models
import First_Collegue_Course from "@/models/First_Collegue_Course";
import Second_Collegue_Course from "@/models/Second_Collegue_Course";
import Third_Collegue_Course from "@/models/Third_Collegue_Course";
import Secondary_Math_Lycee_Courses from "@/models/Secondary_Math_Lycee_Courses";
import Secondary_Science_Lycee_Courses from "@/models/Secondary_Science_Lycee_Courses";
import Secondary_2Bac_Lycee_Math_Courses from "@/models/Secondary_2Bac_Lycee_Math_Courses";
import Secondary_2Bac_Lycee_Eco_Courses from "@/models/Secondary_2Bac_Lycee_Eco_Courses";
import Secondary_2Bac_Lycee_Pc_Courses from "@/models/Secondary_2Bac_Lycee_Pc_Courses";
import Secondary_2Bac_Lycee_Tct_Courses from "@/models/Secondary_2Bac_Lycee_Tct_Courses";
import Tct_Course from "@/models/Tct_Course";

// Helper function to get the correct model based on level and grade
const getModel = (level: string, grade: string) => {
  if (level === "college") {
    switch (grade) {
      case "1":
        return First_Collegue_Course;
      case "2":
        return Second_Collegue_Course;
      case "3":
        return Third_Collegue_Course;
      default:
        return null;
    }
  } else if (level === "lycee") {
    switch (grade) {
      case "math":
        return Secondary_Math_Lycee_Courses;
      case "science":
        return Secondary_Science_Lycee_Courses;
      case "2bac_math":
        return Secondary_2Bac_Lycee_Math_Courses;
      case "2bac_eco":
        return Secondary_2Bac_Lycee_Eco_Courses;
      case "2bac_pc":
        return Secondary_2Bac_Lycee_Pc_Courses;
      case "2bac_tct":
        return Secondary_2Bac_Lycee_Tct_Courses;
      case "tct":
        return Tct_Course;
      default:
        return null;
    }
  }
  return null;
};

// GET /api/courses/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const course = await Course.findById(params.id);

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { message: "Error fetching course" },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const course = await Course.findByIdAndUpdate(
      params.id,
      { title, description },
      { new: true, runValidators: true }
    );

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { message: "Error updating course" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const course = await Course.findByIdAndDelete(params.id);

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { message: "Error deleting course" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { courseLink, exerciseLink } = await req.json();

    await connectDB();

    // First, find the course in all collections to determine its level and grade
    let course = null;
    let model = null;

    // Search in college models
    const collegeModels = [
      { model: First_Collegue_Course, level: "college", grade: "1" },
      { model: Second_Collegue_Course, level: "college", grade: "2" },
      { model: Third_Collegue_Course, level: "college", grade: "3" },
    ];

    for (const { model: collegeModel, level, grade } of collegeModels) {
      const found = await collegeModel.findById(id);
      if (found) {
        course = found;
        model = getModel(level, grade);
        break;
      }
    }

    // If not found in college models, search in lycee models
    if (!course) {
      const lyceeModels = [
        { model: Secondary_Math_Lycee_Courses, level: "lycee", grade: "math" },
        {
          model: Secondary_Science_Lycee_Courses,
          level: "lycee",
          grade: "science",
        },
        {
          model: Secondary_2Bac_Lycee_Math_Courses,
          level: "lycee",
          grade: "2bac_math",
        },
        {
          model: Secondary_2Bac_Lycee_Eco_Courses,
          level: "lycee",
          grade: "2bac_eco",
        },
        {
          model: Secondary_2Bac_Lycee_Pc_Courses,
          level: "lycee",
          grade: "2bac_pc",
        },
        {
          model: Secondary_2Bac_Lycee_Tct_Courses,
          level: "lycee",
          grade: "2bac_tct",
        },
        { model: Tct_Course, level: "lycee", grade: "tct" },
      ];

      for (const { model: lyceeModel, level, grade } of lyceeModels) {
        const found = await lyceeModel.findById(id);
        if (found) {
          course = found;
          model = getModel(level, grade);
          break;
        }
      }
    }

    if (!course || !model) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Update the course with either courseLink or exerciseLink
    const updateData: { courseLink?: string; exerciseLink?: string } = {};
    if (courseLink !== undefined) updateData.courseLink = courseLink;
    if (exerciseLink !== undefined) updateData.exerciseLink = exerciseLink;

    const updatedCourse = await model.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { message: "Error updating course" },
      { status: 500 }
    );
  }
}
