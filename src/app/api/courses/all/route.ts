import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

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
import { Document } from "mongoose";

interface Course {
  _id: string;
  name: string;
  courseLink: string;
  exerciseLink: string;
  createdAt: Date;
  updatedAt: Date;
}

type CourseDocument = Document & Course;

// GET /api/courses/all
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level"); // college or lycee
    const grade = searchParams.get("grade"); // 1, 2, or 3 for college, or specific lycee type

    await connectDB();

    let courses: (Course & { level: string; grade: string })[] = [];

    // College courses
    if (level === "college") {
      switch (grade) {
        case "1":
          courses = (
            await First_Collegue_Course.find().sort({ createdAt: -1 })
          ).map((c: CourseDocument) => ({
            ...c.toObject(),
            level: "college",
            grade: "1",
          }));
          break;
        case "2":
          courses = (
            await Second_Collegue_Course.find().sort({ createdAt: -1 })
          ).map((c: CourseDocument) => ({
            ...c.toObject(),
            level: "college",
            grade: "2",
          }));
          break;
        case "3":
          courses = (
            await Third_Collegue_Course.find().sort({ createdAt: -1 })
          ).map((c: CourseDocument) => ({
            ...c.toObject(),
            level: "college",
            grade: "3",
          }));
          break;
        default:
          // If no specific grade, get all college courses
          const [firstCollege, secondCollege, thirdCollege] = await Promise.all(
            [
              First_Collegue_Course.find().sort({ createdAt: -1 }),
              Second_Collegue_Course.find().sort({ createdAt: -1 }),
              Third_Collegue_Course.find().sort({ createdAt: -1 }),
            ]
          );
          courses = [
            ...firstCollege.map((c: CourseDocument) => ({
              ...c.toObject(),
              level: "college",
              grade: "1",
            })),
            ...secondCollege.map((c: CourseDocument) => ({
              ...c.toObject(),
              level: "college",
              grade: "2",
            })),
            ...thirdCollege.map((c: CourseDocument) => ({
              ...c.toObject(),
              level: "college",
              grade: "3",
            })),
          ];
      }
    }
    // Lycee courses
    else if (level === "lycee") {
      switch (grade) {
        case "math":
          courses = (
            await Secondary_Math_Lycee_Courses.find().sort({ createdAt: -1 })
          ).map((c: CourseDocument) => ({
            ...c.toObject(),
            level: "lycee",
            grade: "math",
          }));
          break;
        case "science":
          courses = (
            await Secondary_Science_Lycee_Courses.find().sort({ createdAt: -1 })
          ).map((c: CourseDocument) => ({
            ...c.toObject(),
            level: "lycee",
            grade: "science",
          }));
          break;
        case "2bac_math":
          courses = (
            await Secondary_2Bac_Lycee_Math_Courses.find().sort({
              createdAt: -1,
            })
          ).map((c: CourseDocument) => ({
            ...c.toObject(),
            level: "lycee",
            grade: "2bac_math",
          }));
          break;
        case "2bac_eco":
          courses = (
            await Secondary_2Bac_Lycee_Eco_Courses.find().sort({
              createdAt: -1,
            })
          ).map((c: CourseDocument) => ({
            ...c.toObject(),
            level: "lycee",
            grade: "2bac_eco",
          }));
          break;
        case "2bac_pc":
          courses = (
            await Secondary_2Bac_Lycee_Pc_Courses.find().sort({ createdAt: -1 })
          ).map((c: CourseDocument) => ({
            ...c.toObject(),
            level: "lycee",
            grade: "2bac_pc",
          }));
          break;
        case "2bac_tct":
          courses = (
            await Secondary_2Bac_Lycee_Tct_Courses.find().sort({
              createdAt: -1,
            })
          ).map((c: CourseDocument) => ({
            ...c.toObject(),
            level: "lycee",
            grade: "2bac_tct",
          }));
          break;
        case "tct":
          courses = (await Tct_Course.find().sort({ createdAt: -1 })).map(
            (c: CourseDocument) => ({
              ...c.toObject(),
              level: "lycee",
              grade: "tct",
            })
          );
          break;
        default:
          // If no specific grade, get all lycee courses
          const [
            mathCourses,
            scienceCourses,
            bac2MathCourses,
            bac2EcoCourses,
            bac2PcCourses,
            bac2TctCourses,
            tctCourses,
          ] = await Promise.all([
            Secondary_Math_Lycee_Courses.find().sort({ createdAt: -1 }),
            Secondary_Science_Lycee_Courses.find().sort({ createdAt: -1 }),
            Secondary_2Bac_Lycee_Math_Courses.find().sort({ createdAt: -1 }),
            Secondary_2Bac_Lycee_Eco_Courses.find().sort({ createdAt: -1 }),
            Secondary_2Bac_Lycee_Pc_Courses.find().sort({ createdAt: -1 }),
            Secondary_2Bac_Lycee_Tct_Courses.find().sort({ createdAt: -1 }),
            Tct_Course.find().sort({ createdAt: -1 }),
          ]);

          courses = [
            ...mathCourses.map((c: CourseDocument) => ({
              ...c.toObject(),
              level: "lycee",
              grade: "math",
            })),
            ...scienceCourses.map((c: CourseDocument) => ({
              ...c.toObject(),
              level: "lycee",
              grade: "science",
            })),
            ...bac2MathCourses.map((c: CourseDocument) => ({
              ...c.toObject(),
              level: "lycee",
              grade: "2bac_math",
            })),
            ...bac2EcoCourses.map((c: CourseDocument) => ({
              ...c.toObject(),
              level: "lycee",
              grade: "2bac_eco",
            })),
            ...bac2PcCourses.map((c: CourseDocument) => ({
              ...c.toObject(),
              level: "lycee",
              grade: "2bac_pc",
            })),
            ...bac2TctCourses.map((c: CourseDocument) => ({
              ...c.toObject(),
              level: "lycee",
              grade: "2bac_tct",
            })),
            ...tctCourses.map((c: CourseDocument) => ({
              ...c.toObject(),
              level: "lycee",
              grade: "tct",
            })),
          ];
      }
    } else {
      // If no level specified, get all courses
      const [
        firstCollege,
        secondCollege,
        thirdCollege,
        mathCourses,
        scienceCourses,
        bac2MathCourses,
        bac2EcoCourses,
        bac2PcCourses,
        bac2TctCourses,
        tctCourses,
      ] = await Promise.all([
        First_Collegue_Course.find().sort({ createdAt: -1 }),
        Second_Collegue_Course.find().sort({ createdAt: -1 }),
        Third_Collegue_Course.find().sort({ createdAt: -1 }),
        Secondary_Math_Lycee_Courses.find().sort({ createdAt: -1 }),
        Secondary_Science_Lycee_Courses.find().sort({ createdAt: -1 }),
        Secondary_2Bac_Lycee_Math_Courses.find().sort({ createdAt: -1 }),
        Secondary_2Bac_Lycee_Eco_Courses.find().sort({ createdAt: -1 }),
        Secondary_2Bac_Lycee_Pc_Courses.find().sort({ createdAt: -1 }),
        Secondary_2Bac_Lycee_Tct_Courses.find().sort({ createdAt: -1 }),
        Tct_Course.find().sort({ createdAt: -1 }),
      ]);

      courses = [
        ...firstCollege.map((c: CourseDocument) => ({
          ...c.toObject(),
          level: "college",
          grade: "1",
        })),
        ...secondCollege.map((c: CourseDocument) => ({
          ...c.toObject(),
          level: "college",
          grade: "2",
        })),
        ...thirdCollege.map((c: CourseDocument) => ({
          ...c.toObject(),
          level: "college",
          grade: "3",
        })),
        ...mathCourses.map((c: CourseDocument) => ({
          ...c.toObject(),
          level: "lycee",
          grade: "math",
        })),
        ...scienceCourses.map((c: CourseDocument) => ({
          ...c.toObject(),
          level: "lycee",
          grade: "science",
        })),
        ...bac2MathCourses.map((c: CourseDocument) => ({
          ...c.toObject(),
          level: "lycee",
          grade: "2bac_math",
        })),
        ...bac2EcoCourses.map((c: CourseDocument) => ({
          ...c.toObject(),
          level: "lycee",
          grade: "2bac_eco",
        })),
        ...bac2PcCourses.map((c: CourseDocument) => ({
          ...c.toObject(),
          level: "lycee",
          grade: "2bac_pc",
        })),
        ...bac2TctCourses.map((c: CourseDocument) => ({
          ...c.toObject(),
          level: "lycee",
          grade: "2bac_tct",
        })),
        ...tctCourses.map((c: CourseDocument) => ({
          ...c.toObject(),
          level: "lycee",
          grade: "tct",
        })),
      ];
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Error fetching courses" },
      { status: 500 }
    );
  }
}
