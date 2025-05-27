import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth.config";
import Course from "../../../../models/Course";

// Import all course models
import FirstCollegeCourse from "@/models/FirstCollegeCourse";
import SecondCollegeCourse from "@/models/SecondCollegeCourse";
import ThirdCollegeCourse from "@/models/ThirdCollegeCourse";
import FirstBacMathCourse from "@/models/FirstBacMathCourse";
import FirstBacScienceCourse from "@/models/FirstBacScienceCourse";
import FirstBacEconomicsCourse from "@/models/FirstBacEconomicsCourse";
import FirstBacLettersCourse from "@/models/FirstBacLettersCourse";
import SecondBacMathACourse from "@/models/SecondBacMathACourse";
import SecondBacMathBCourse from "@/models/SecondBacMathBCourse";
import CommonCoreCourse from "@/models/CommonCoreCourse";
import CommonCoreLettersCourse from "@/models/CommonCoreLettersCourse";
import CommonCoreScienceCourse from "@/models/CommonCoreScienceCourse";
import CommonCoreTechnicalCourse from "@/models/CommonCoreTechnicalCourse";

// Helper function to get the correct model based on level and grade
const getModel = (level: string, grade: string) => {
  if (level === "college") {
    switch (grade) {
      case "1":
        return FirstCollegeCourse;
      case "2":
        return SecondCollegeCourse;
      case "3":
        return ThirdCollegeCourse;
      default:
        return null;
    }
  } else if (level === "lycee") {
    switch (grade) {
      case "math":
        return FirstBacMathCourse;
      case "science":
        return FirstBacScienceCourse;
      case "economics":
        return FirstBacEconomicsCourse;
      case "letters":
        return FirstBacLettersCourse;
      case "2bac_math_a":
        return SecondBacMathACourse;
      case "2bac_math_b":
        return SecondBacMathBCourse;
      case "common_core":
        return CommonCoreCourse;
      case "common_core_letters":
        return CommonCoreLettersCourse;
      case "common_core_science":
        return CommonCoreScienceCourse;
      case "common_core_technical":
        return CommonCoreTechnicalCourse;
      default:
        return null;
    }
  }
  return null;
};

// GET /api/courses/[id]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, context: any) {
  const { params } = context;
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(request: Request, context: any) {
  const { params } = context;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: Request, context: any) {
  const { params } = context;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Try to delete from all possible collections
    const collections = [
      FirstCollegeCourse,
      SecondCollegeCourse,
      ThirdCollegeCourse,
      FirstBacMathCourse,
      FirstBacScienceCourse,
      FirstBacEconomicsCourse,
      FirstBacLettersCourse,
      SecondBacMathACourse,
      SecondBacMathBCourse,
      CommonCoreCourse,
      CommonCoreLettersCourse,
      CommonCoreScienceCourse,
      CommonCoreTechnicalCourse,
    ];

    let deleted = false;
    for (const Model of collections) {
      const result = await Model.findByIdAndDelete(params.id);
      if (result) {
        deleted = true;
        break;
      }
    }

    if (!deleted) {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(request: Request, context: any) {
  const { params } = context;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { courseLink, exerciseLink } = await request.json();

    await connectDB();

    // First, find the course in all collections to determine its level and grade
    let course = null;
    let model = null;

    // Search in college models
    const collegeModels = [
      { model: FirstCollegeCourse, level: "college", grade: "1" },
      { model: SecondCollegeCourse, level: "college", grade: "2" },
      { model: ThirdCollegeCourse, level: "college", grade: "3" },
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
        { model: FirstBacMathCourse, level: "lycee", grade: "math" },
        { model: FirstBacScienceCourse, level: "lycee", grade: "science" },
        { model: FirstBacEconomicsCourse, level: "lycee", grade: "economics" },
        { model: FirstBacLettersCourse, level: "lycee", grade: "letters" },
        { model: SecondBacMathACourse, level: "lycee", grade: "2bac_math_a" },
        { model: SecondBacMathBCourse, level: "lycee", grade: "2bac_math_b" },
        { model: CommonCoreCourse, level: "lycee", grade: "common_core" },
        {
          model: CommonCoreLettersCourse,
          level: "lycee",
          grade: "common_core_letters",
        },
        {
          model: CommonCoreScienceCourse,
          level: "lycee",
          grade: "common_core_science",
        },
        {
          model: CommonCoreTechnicalCourse,
          level: "lycee",
          grade: "common_core_technical",
        },
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
