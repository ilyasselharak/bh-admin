import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import { authOptions } from "../auth/[...nextauth]/auth.config";
import mongoose from "mongoose";

// Import all exam models
import SecondBacEconomicsExam from "@/models/SecondBacEconomicsExam";
import SecondBacLettersExam from "@/models/SecondBacLettersExam";
import SecondBacMathAExam from "@/models/SecondBacMathAExam";
import SecondBacMathBExam from "@/models/SecondBacMathBExam";
import SecondBacTechExam from "@/models/SecondBacTechExam";
import SecondBacPCSVTExam from "@/models/SecondBacPCSVTExam";

// GET /api/exams
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const model = searchParams.get("model");

    if (!model) {
      return NextResponse.json(
        { message: "Model parameter is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Model mapping
    type ExamModel = mongoose.Model<{
      title: string;
      year: number;
      pdfUrl: string;
      content: string;
      solutionUrl?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }>;

    const modelMap: Record<string, ExamModel> = {
      "SecondBacEconomicsExam": SecondBacEconomicsExam,
      "SecondBacLettersExam": SecondBacLettersExam,
      "SecondBacMathAExam": SecondBacMathAExam,
      "SecondBacMathBExam": SecondBacMathBExam,
      "SecondBacTechExam": SecondBacTechExam,
      "SecondBacPCSVTExam": SecondBacPCSVTExam,
    };

    const Model = modelMap[model];
    if (!Model) {
      return NextResponse.json(
        { message: "Invalid model specified" },
        { status: 400 }
      );
    }

    const exams = await Model.find().sort({ createdAt: -1 });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { message: "Error fetching exams" },
      { status: 500 }
    );
  }
}

// POST /api/exams
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, year, pdfUrl, content, solutionUrl, model } = body;

    if (!title || !year || !pdfUrl || !content || !model) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Model mapping
    type ExamModel = mongoose.Model<{
      title: string;
      year: number;
      pdfUrl: string;
      content: string;
      solutionUrl?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }>;

    const modelMap: Record<string, ExamModel> = {
      "SecondBacEconomicsExam": SecondBacEconomicsExam,
      "SecondBacLettersExam": SecondBacLettersExam,
      "SecondBacMathAExam": SecondBacMathAExam,
      "SecondBacMathBExam": SecondBacMathBExam,
      "SecondBacTechExam": SecondBacTechExam,
      "SecondBacPCSVTExam": SecondBacPCSVTExam,
    };

    const Model = modelMap[model];
    if (!Model) {
      return NextResponse.json(
        { message: "Invalid model specified" },
        { status: 400 }
      );
    }

    const exam = await Model.create({
      title,
      year: Number(year),
      pdfUrl,
      content,
      solutionUrl: solutionUrl || undefined,
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { message: "Error creating exam" },
      { status: 500 }
    );
  }
}

