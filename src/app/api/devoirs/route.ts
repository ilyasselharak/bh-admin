import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import { authOptions } from "../auth/[...nextauth]/auth.config";
import mongoose from "mongoose";

// Import all devoir models
import FirstCollegeDevoir from "@/models/FirstCollegeDevoir";
import SecondCollegeDevoir from "@/models/SecondCollegeDevoir";
import ThirdCollegeDevoir from "@/models/ThirdCollegeDevoir";
import FirstBacMathDevoir from "@/models/FirstBacMathDevoir";
import FirstBacScienceDevoir from "@/models/FirstBacScienceDevoir";
import FirstBacEconomicsDevoir from "@/models/FirstBacEconomicsDevoir";
import FirstBacLettersDevoir from "@/models/FirstBacLettersDevoir";
import SecondBacMathADevoir from "@/models/SecondBacMathADevoir";
import SecondBacMathBDevoir from "@/models/SecondBacMathBDevoir";
import SecondBacEconomicsDevoir from "@/models/SecondBacEconomicsDevoir";
import SecondBacLettersDevoir from "@/models/SecondBacLettersDevoir";
import SecondBacPhysicsChemistryLifeSciencesDevoir from "@/models/SecondBacPhysicsChemistryLifeSciencesDevoir";
import SecondBacTechnicalCommonDevoir from "@/models/SecondBacTechnicalCommonDevoir";
import CommonCoreLettersDevoir from "@/models/CommonCoreLettersDevoir";
import CommonCoreScienceDevoir from "@/models/CommonCoreScienceDevoir";
import CommonCoreTechnicalDevoir from "@/models/CommonCoreTechnicalDevoir";

// GET /api/devoirs
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const model = searchParams.get("model");
    const semester = searchParams.get("semester") || "1";

    if (!model) {
      return NextResponse.json({ message: "Model parameter is required" }, { status: 400 });
    }

    await connectDB();

    // Model mapping
    type DevoirModel = mongoose.Model<{
      title: string;
      content: string;
      semester: number;
      level?: string;
      grade?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }>;

    const modelMap: Record<string, DevoirModel> = {
      "FirstCollegeDevoir": FirstCollegeDevoir,
      "SecondCollegeDevoir": SecondCollegeDevoir,
      "ThirdCollegeDevoir": ThirdCollegeDevoir,
      "FirstBacMathDevoir": FirstBacMathDevoir,
      "FirstBacScienceDevoir": FirstBacScienceDevoir,
      "FirstBacEconomicsDevoir": FirstBacEconomicsDevoir,
      "FirstBacLettersDevoir": FirstBacLettersDevoir,
      "SecondBacMathADevoir": SecondBacMathADevoir,
      "SecondBacMathBDevoir": SecondBacMathBDevoir,
      "SecondBacEconomicsDevoir": SecondBacEconomicsDevoir,
      "SecondBacLettersDevoir": SecondBacLettersDevoir,
      "SecondBacPhysicsChemistryLifeSciencesDevoir": SecondBacPhysicsChemistryLifeSciencesDevoir,
      "SecondBacTechnicalCommonDevoir": SecondBacTechnicalCommonDevoir,
      "CommonCoreLettersDevoir": CommonCoreLettersDevoir,
      "CommonCoreScienceDevoir": CommonCoreScienceDevoir,
      "CommonCoreTechnicalDevoir": CommonCoreTechnicalDevoir,
    };

    const Model = modelMap[model];
    if (!Model) {
      return NextResponse.json({ message: "Invalid model specified" }, { status: 400 });
    }

    const devoirs = await Model.find({ semester: Number(semester) }).sort({
      createdAt: -1,
    });

    return NextResponse.json(devoirs);
  } catch (error) {
    console.error("Error fetching devoirs:", error);
    return NextResponse.json(
      { message: "Error fetching devoirs" },
      { status: 500 }
    );
  }
}

// POST /api/devoirs
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, pdfUrl, semester, model, level, grade } = body;

    if (!title || !content || !semester || !model) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Model mapping
    type DevoirModel = mongoose.Model<{
      title: string;
      content: string;
      pdfUrl?: string;
      semester: number;
      level?: string;
      grade?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }>;

    const modelMap: Record<string, DevoirModel> = {
      "FirstCollegeDevoir": FirstCollegeDevoir,
      "SecondCollegeDevoir": SecondCollegeDevoir,
      "ThirdCollegeDevoir": ThirdCollegeDevoir,
      "FirstBacMathDevoir": FirstBacMathDevoir,
      "FirstBacScienceDevoir": FirstBacScienceDevoir,
      "FirstBacEconomicsDevoir": FirstBacEconomicsDevoir,
      "FirstBacLettersDevoir": FirstBacLettersDevoir,
      "SecondBacMathADevoir": SecondBacMathADevoir,
      "SecondBacMathBDevoir": SecondBacMathBDevoir,
      "SecondBacEconomicsDevoir": SecondBacEconomicsDevoir,
      "SecondBacLettersDevoir": SecondBacLettersDevoir,
      "SecondBacPhysicsChemistryLifeSciencesDevoir": SecondBacPhysicsChemistryLifeSciencesDevoir,
      "SecondBacTechnicalCommonDevoir": SecondBacTechnicalCommonDevoir,
      "CommonCoreLettersDevoir": CommonCoreLettersDevoir,
      "CommonCoreScienceDevoir": CommonCoreScienceDevoir,
      "CommonCoreTechnicalDevoir": CommonCoreTechnicalDevoir,
    };

    const Model = modelMap[model];
    if (!Model) {
      return NextResponse.json({ message: "Invalid model specified" }, { status: 400 });
    }

    const devoir = await Model.create({
      title,
      content,
      pdfUrl: pdfUrl || undefined,
      semester: Number(semester),
      level: level || "college",
      grade: grade || "1",
    });

    return NextResponse.json(devoir);
  } catch (error) {
    console.error("Error creating devoir:", error);
    return NextResponse.json(
      { message: "Error creating devoir" },
      { status: 500 }
    );
  }
}
