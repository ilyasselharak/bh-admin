import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth.config";

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch courses from all models
    const [
      firstCollegeCourses,
      secondCollegeCourses,
      thirdCollegeCourses,
      firstBacMathCourses,
      firstBacScienceCourses,
      firstBacEconomicsCourses,
      firstBacLettersCourses,
      secondBacMathACourses,
      secondBacMathBCourses,
      commonCoreCourses,
      commonCoreLettersCourses,
      commonCoreScienceCourses,
      commonCoreTechnicalCourses,
    ] = await Promise.all([
      FirstCollegeCourse.find().sort({ createdAt: -1 }),
      SecondCollegeCourse.find().sort({ createdAt: -1 }),
      ThirdCollegeCourse.find().sort({ createdAt: -1 }),
      FirstBacMathCourse.find().sort({ createdAt: -1 }),
      FirstBacScienceCourse.find().sort({ createdAt: -1 }),
      FirstBacEconomicsCourse.find().sort({ createdAt: -1 }),
      FirstBacLettersCourse.find().sort({ createdAt: -1 }),
      SecondBacMathACourse.find().sort({ createdAt: -1 }),
      SecondBacMathBCourse.find().sort({ createdAt: -1 }),
      CommonCoreCourse.find().sort({ createdAt: -1 }),
      CommonCoreLettersCourse.find().sort({ createdAt: -1 }),
      CommonCoreScienceCourse.find().sort({ createdAt: -1 }),
      CommonCoreTechnicalCourse.find().sort({ createdAt: -1 }),
    ]);

    // Combine all courses with their model type
    const allCourses = [
      ...firstCollegeCourses.map((course) => ({
        ...course.toObject(),
        model: "FirstCollegeCourse",
      })),
      ...secondCollegeCourses.map((course) => ({
        ...course.toObject(),
        model: "SecondCollegeCourse",
      })),
      ...thirdCollegeCourses.map((course) => ({
        ...course.toObject(),
        model: "ThirdCollegeCourse",
      })),
      ...firstBacMathCourses.map((course) => ({
        ...course.toObject(),
        model: "FirstBacMathCourse",
      })),
      ...firstBacScienceCourses.map((course) => ({
        ...course.toObject(),
        model: "FirstBacScienceCourse",
      })),
      ...firstBacEconomicsCourses.map((course) => ({
        ...course.toObject(),
        model: "FirstBacEconomicsCourse",
      })),
      ...firstBacLettersCourses.map((course) => ({
        ...course.toObject(),
        model: "FirstBacLettersCourse",
      })),
      ...secondBacMathACourses.map((course) => ({
        ...course.toObject(),
        model: "SecondBacMathACourse",
      })),
      ...secondBacMathBCourses.map((course) => ({
        ...course.toObject(),
        model: "SecondBacMathBCourse",
      })),
      ...commonCoreCourses.map((course) => ({
        ...course.toObject(),
        model: "CommonCoreCourse",
      })),
      ...commonCoreLettersCourses.map((course) => ({
        ...course.toObject(),
        model: "CommonCoreLettersCourse",
      })),
      ...commonCoreScienceCourses.map((course) => ({
        ...course.toObject(),
        model: "CommonCoreScienceCourse",
      })),
      ...commonCoreTechnicalCourses.map((course) => ({
        ...course.toObject(),
        model: "CommonCoreTechnicalCourse",
      })),
    ];

    // Sort all courses by creation date
    allCourses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json(allCourses);
  } catch (error) {
    console.error("Error fetching all courses:", error);
    return NextResponse.json(
      { message: "Error fetching all courses" },
      { status: 500 }
    );
  }
}
