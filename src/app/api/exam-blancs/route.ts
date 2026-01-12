import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import { authOptions } from "../auth/[...nextauth]/auth.config";
import mongoose from "mongoose";

// Import all exam blancs models
import SecondBacEconomicsExamBlancs from "@/models/SecondBacEconomicsExamBlancs";
import SecondBacLettersExamBlancs from "@/models/SecondBacLettersExamBlancs";
import SecondBacMathAExamBlancs from "@/models/SecondBacMathAExamBlancs";
import SecondBacMathBExamBlancs from "@/models/SecondBacMathBExamBlancs";
import SecondBacTechExamBlancs from "@/models/SecondBacTechExamBlancs";
import SecondBacPCSVTExamBlancs from "@/models/SecondBacPCSVTExamBlancs";

// GET /api/exam-blancs
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
    type ExamBlancsModel = mongoose.Model<{
      title: string;
      pdfUrl: string;
      content: string;
      solutionUrl?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }>;

    const modelMap: Record<string, ExamBlancsModel> = {
      "SecondBacEconomicsExamBlancs": SecondBacEconomicsExamBlancs,
      "SecondBacLettersExamBlancs": SecondBacLettersExamBlancs,
      "SecondBacMathAExamBlancs": SecondBacMathAExamBlancs,
      "SecondBacMathBExamBlancs": SecondBacMathBExamBlancs,
      "SecondBacTechExamBlancs": SecondBacTechExamBlancs,
      "SecondBacPCSVTExamBlancs": SecondBacPCSVTExamBlancs,
    };

    const Model = modelMap[model];
    if (!Model) {
      return NextResponse.json(
        { message: "Invalid model specified" },
        { status: 400 }
      );
    }

    const examBlancs = await Model.find().sort({ createdAt: -1 });

    return NextResponse.json(examBlancs);
  } catch (error) {
    console.error("Error fetching exam blancs:", error);
    return NextResponse.json(
      { message: "Error fetching exam blancs" },
      { status: 500 }
    );
  }
}

// POST /api/exam-blancs
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, pdfUrl, content, solutionUrl, model } = body;

    if (!title || !pdfUrl || !content || !model) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Model mapping
    type ExamBlancsModel = mongoose.Model<{
      title: string;
      pdfUrl: string;
      content: string;
      solutionUrl?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }>;

    const modelMap: Record<string, ExamBlancsModel> = {
      "SecondBacEconomicsExamBlancs": SecondBacEconomicsExamBlancs,
      "SecondBacLettersExamBlancs": SecondBacLettersExamBlancs,
      "SecondBacMathAExamBlancs": SecondBacMathAExamBlancs,
      "SecondBacMathBExamBlancs": SecondBacMathBExamBlancs,
      "SecondBacTechExamBlancs": SecondBacTechExamBlancs,
      "SecondBacPCSVTExamBlancs": SecondBacPCSVTExamBlancs,
    };

    const Model = modelMap[model];
    if (!Model) {
      return NextResponse.json(
        { message: "Invalid model specified" },
        { status: 400 }
      );
    }

    const examBlanc = await Model.create({
      title,
      pdfUrl,
      content,
      solutionUrl: solutionUrl || undefined,
    });

    return NextResponse.json(examBlanc);
  } catch (error) {
    console.error("Error creating exam blanc:", error);
    return NextResponse.json(
      { message: "Error creating exam blanc" },
      { status: 500 }
    );
  }
}

