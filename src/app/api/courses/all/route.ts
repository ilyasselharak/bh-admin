import { NextRequest, NextResponse } from "next/server";
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
import SecondBacEconomicsCourse from "@/models/SecondBacEconomicsCourse";
import SecondBacLettersCourse from "@/models/SecondBacLettersCourse";
import SecondBacPhysicsChemistryLifeSciencesCourse from "@/models/SecondBacPhysicsChemistryLifeSciencesCourse";
import SecondBacTechnicalCommonCourse from "@/models/SecondBacTechnicalCommonCourse";
import CommonCoreCourse from "@/models/CommonCoreCourse";
import CommonCoreLettersCourse from "@/models/CommonCoreLettersCourse";
import CommonCoreScienceCourse from "@/models/CommonCoreScienceCourse";
import CommonCoreTechnicalCourse from "@/models/CommonCoreTechnicalCourse";
import Course from "@/models/Course";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const grade = searchParams.get("grade");

    await connectDB();

    // Define all course models with their metadata
    const courseModels = [
      { model: FirstCollegeCourse, level: "college", grade: "1", name: "FirstCollegeCourse" },
      { model: SecondCollegeCourse, level: "college", grade: "2", name: "SecondCollegeCourse" },
      { model: ThirdCollegeCourse, level: "college", grade: "3", name: "ThirdCollegeCourse" },
      { model: FirstBacMathCourse, level: "lycee", grade: "1bac_math", name: "FirstBacMathCourse" },
      { model: FirstBacScienceCourse, level: "lycee", grade: "1bac_science", name: "FirstBacScienceCourse" },
      { model: FirstBacEconomicsCourse, level: "lycee", grade: "1bac_economics", name: "FirstBacEconomicsCourse" },
      { model: FirstBacLettersCourse, level: "lycee", grade: "1bac_letters", name: "FirstBacLettersCourse" },
      { model: SecondBacMathACourse, level: "lycee", grade: "2bac_math_a", name: "SecondBacMathACourse" },
      { model: SecondBacMathBCourse, level: "lycee", grade: "2bac_math_b", name: "SecondBacMathBCourse" },
      { model: SecondBacEconomicsCourse, level: "lycee", grade: "2bac_economics", name: "SecondBacEconomicsCourse" },
      { model: SecondBacLettersCourse, level: "lycee", grade: "2bac_letters", name: "SecondBacLettersCourse" },
      { model: SecondBacPhysicsChemistryLifeSciencesCourse, level: "lycee", grade: "2bac_pcsvt", name: "SecondBacPhysicsChemistryLifeSciencesCourse" },
      { model: SecondBacTechnicalCommonCourse, level: "lycee", grade: "2bac_tct", name: "SecondBacTechnicalCommonCourse" },
      { model: CommonCoreCourse, level: "common_core", grade: "common_core", name: "CommonCoreCourse" },
      { model: CommonCoreLettersCourse, level: "common_core", grade: "common_core_letters", name: "CommonCoreLettersCourse" },
      { model: CommonCoreScienceCourse, level: "common_core", grade: "common_core_science", name: "CommonCoreScienceCourse" },
      { model: CommonCoreTechnicalCourse, level: "common_core", grade: "common_core_technical", name: "CommonCoreTechnicalCourse" },
      { model: Course, level: "general", grade: "general", name: "Course" },
    ];

    // Filter models based on query parameters
    const filteredModels = courseModels.filter(({ level: modelLevel, grade: modelGrade }) => {
      if (level && modelLevel !== level) return false;
      if (grade && modelGrade !== grade) return false;
      return true;
    });

    // Fetch courses from filtered models
    const coursePromises = filteredModels.map(({ model }) => 
      model.find().sort({ createdAt: -1 })
    );
    
    const courseResults = await Promise.all(coursePromises);

    // Combine all courses with their model type and metadata
    const allCourses = [];
    for (let i = 0; i < filteredModels.length; i++) {
      const { name: modelName, level: modelLevel, grade: modelGrade } = filteredModels[i];
      const courses = courseResults[i];
      
      allCourses.push(
        ...courses.map((course) => ({
          ...course.toObject(),
          model: modelName,
          level: modelLevel,
          grade: modelGrade,
        }))
      );
    }

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
