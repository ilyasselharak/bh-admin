import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth.config";

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
import SecondBacEconomicsCourse from "@/models/SecondBacEconomicsCourse";
import SecondBacLettersCourse from "@/models/SecondBacLettersCourse";
import SecondBacPhysicsChemistryLifeSciencesCourse from "@/models/SecondBacPhysicsChemistryLifeSciencesCourse";
import SecondBacTechnicalCommonCourse from "@/models/SecondBacTechnicalCommonCourse";
import CommonCoreCourse from "@/models/CommonCoreCourse";
import CommonCoreLettersCourse from "@/models/CommonCoreLettersCourse";
import CommonCoreScienceCourse from "@/models/CommonCoreScienceCourse";
import CommonCoreTechnicalCourse from "@/models/CommonCoreTechnicalCourse";
import Course from "@/models/Course";

// Helper function to get the correct model based on model name
const getModel = (modelName: string) => {
  const models = {
    FirstCollegeCourse,
    SecondCollegeCourse,
    ThirdCollegeCourse,
    FirstBacMathCourse,
    FirstBacScienceCourse,
    FirstBacEconomicsCourse,
    FirstBacLettersCourse,
    SecondBacMathACourse,
    SecondBacMathBCourse,
    SecondBacEconomicsCourse,
    SecondBacLettersCourse,
    SecondBacPhysicsChemistryLifeSciencesCourse,
    SecondBacTechnicalCommonCourse,
    CommonCoreCourse,
    CommonCoreLettersCourse,
    CommonCoreScienceCourse,
    CommonCoreTechnicalCourse,
    Course,
  };

  return models[modelName as keyof typeof models] || null;
};

// GET /api/courses
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const modelName = searchParams.get("model");

    if (!modelName) {
      return NextResponse.json(
        { message: "Model parameter is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const Model = getModel(modelName);
    if (!Model) {
      return NextResponse.json(
        { message: "Invalid model specified" },
        { status: 400 }
      );
    }

    const courses = await Model.find().sort({ createdAt: -1 });
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Error fetching courses" },
      { status: 500 }
    );
  }
}

// POST /api/courses
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      model: modelName,
      name,
      courseLink,
      exerciseLink,
      devoirLink,
      examenLink,
    } = body;

    if (!modelName || !name) {
      return NextResponse.json(
        { message: "Model and name are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const Model = getModel(modelName);
    if (!Model) {
      return NextResponse.json(
        { message: "Invalid model specified" },
        { status: 400 }
      );
    }

    const course = await Model.create({
      name,
      courseLink,
      exerciseLink,
      devoirLink,
      examenLink,
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { message: "Error creating course" },
      { status: 500 }
    );
  }
}
