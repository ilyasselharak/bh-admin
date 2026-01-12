import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import { authOptions } from "../../auth/[...nextauth]/auth.config";

// Import all exam models
import SecondBacEconomicsExam from "@/models/SecondBacEconomicsExam";
import SecondBacLettersExam from "@/models/SecondBacLettersExam";
import SecondBacMathAExam from "@/models/SecondBacMathAExam";
import SecondBacMathBExam from "@/models/SecondBacMathBExam";
import SecondBacTechExam from "@/models/SecondBacTechExam";
import SecondBacPCSVTExam from "@/models/SecondBacPCSVTExam";

// PATCH /api/exams/[id]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(request: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { params } = context;
    // Handle both sync and async params (Next.js 15 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json(
        { message: "Exam ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, year, pdfUrl, content, solutionUrl, type } = body;

    if (!title || !year || !pdfUrl || !content || !type) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    let Model;
    switch (type) {
      case "2bac_economics":
        Model = SecondBacEconomicsExam;
        break;
      case "2bac_letters":
        Model = SecondBacLettersExam;
        break;
      case "2bac_math_a":
        Model = SecondBacMathAExam;
        break;
      case "2bac_math_b":
        Model = SecondBacMathBExam;
        break;
      case "2bac_tech":
        Model = SecondBacTechExam;
        break;
      case "2bac_pcsvt":
        Model = SecondBacPCSVTExam;
        break;
      default:
        return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    const updateData: {
      title: string;
      year: number;
      pdfUrl: string;
      content: string;
      solutionUrl?: string;
      updatedAt: Date;
    } = {
      title,
      year: Number(year),
      pdfUrl,
      content,
      updatedAt: new Date(),
    };

    if (solutionUrl !== undefined) {
      updateData.solutionUrl = solutionUrl || undefined;
    }

    const exam = await Model.findByIdAndUpdate(id, updateData, { new: true });

    if (!exam) {
      return NextResponse.json(
        { message: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { message: "Error updating exam" },
      { status: 500 }
    );
  }
}

// DELETE /api/exams/[id]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { params } = context;
    // Handle both sync and async params (Next.js 15 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json(
        { message: "Exam ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Try to delete from all possible collections
    const collections = [
      SecondBacEconomicsExam,
      SecondBacLettersExam,
      SecondBacMathAExam,
      SecondBacMathBExam,
      SecondBacTechExam,
      SecondBacPCSVTExam,
    ];

    let deleted = false;
    for (const Model of collections) {
      const result = await Model.findByIdAndDelete(id);
      if (result) {
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      return NextResponse.json(
        { message: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { message: "Error deleting exam" },
      { status: 500 }
    );
  }
}

