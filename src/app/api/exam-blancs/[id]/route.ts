import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import { authOptions } from "../../auth/[...nextauth]/auth.config";

// Import all exam blancs models
import SecondBacEconomicsExamBlancs from "@/models/SecondBacEconomicsExamBlancs";
import SecondBacLettersExamBlancs from "@/models/SecondBacLettersExamBlancs";
import SecondBacMathAExamBlancs from "@/models/SecondBacMathAExamBlancs";
import SecondBacMathBExamBlancs from "@/models/SecondBacMathBExamBlancs";
import SecondBacTechExamBlancs from "@/models/SecondBacTechExamBlancs";
import SecondBacPCSVTExamBlancs from "@/models/SecondBacPCSVTExamBlancs";

// PATCH /api/exam-blancs/[id]
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
        { message: "Exam Blanc ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, pdfUrl, content, solutionUrl, type } = body;

    if (!title || !pdfUrl || !content || !type) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    let Model;
    switch (type) {
      case "2bac_economics":
        Model = SecondBacEconomicsExamBlancs;
        break;
      case "2bac_letters":
        Model = SecondBacLettersExamBlancs;
        break;
      case "2bac_math_a":
        Model = SecondBacMathAExamBlancs;
        break;
      case "2bac_math_b":
        Model = SecondBacMathBExamBlancs;
        break;
      case "2bac_tech":
        Model = SecondBacTechExamBlancs;
        break;
      case "2bac_pcsvt":
        Model = SecondBacPCSVTExamBlancs;
        break;
      default:
        return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    const updateData: {
      title: string;
      pdfUrl: string;
      content: string;
      solutionUrl?: string;
      updatedAt: Date;
    } = {
      title,
      pdfUrl,
      content,
      updatedAt: new Date(),
    };

    if (solutionUrl !== undefined) {
      updateData.solutionUrl = solutionUrl || undefined;
    }

    const examBlanc = await Model.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!examBlanc) {
      return NextResponse.json(
        { message: "Exam Blanc not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(examBlanc);
  } catch (error) {
    console.error("Error updating exam blanc:", error);
    return NextResponse.json(
      { message: "Error updating exam blanc" },
      { status: 500 }
    );
  }
}

// DELETE /api/exam-blancs/[id]
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
        { message: "Exam Blanc ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Try to delete from all possible collections
    const collections = [
      SecondBacEconomicsExamBlancs,
      SecondBacLettersExamBlancs,
      SecondBacMathAExamBlancs,
      SecondBacMathBExamBlancs,
      SecondBacTechExamBlancs,
      SecondBacPCSVTExamBlancs,
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
        { message: "Exam Blanc not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Exam Blanc deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam blanc:", error);
    return NextResponse.json(
      { message: "Error deleting exam blanc" },
      { status: 500 }
    );
  }
}

