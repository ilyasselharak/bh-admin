import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import CommonCoreLettersDevoir from "@/models/CommonCoreLettersDevoir";
import CommonCoreScienceDevoir from "@/models/CommonCoreScienceDevoir";
import CommonCoreTechnicalDevoir from "@/models/CommonCoreTechnicalDevoir";

// PATCH /api/devoirs/[id]
export async function PATCH(request: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { params } = context;
    const body = await request.json();
    const { title, content, semester, type } = body;

    if (!title || !content || !semester || !type) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    let Model;
    switch (type) {
      case "letters":
        Model = CommonCoreLettersDevoir;
        break;
      case "science":
        Model = CommonCoreScienceDevoir;
        break;
      case "technical":
        Model = CommonCoreTechnicalDevoir;
        break;
      default:
        return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    const devoir = await Model.findByIdAndUpdate(
      params.id,
      {
        title,
        content,
        semester: Number(semester),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!devoir) {
      return NextResponse.json(
        { message: "Devoir not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(devoir);
  } catch (error) {
    console.error("Error updating devoir:", error);
    return NextResponse.json(
      { message: "Error updating devoir" },
      { status: 500 }
    );
  }
}

// DELETE /api/devoirs/[id]
export async function DELETE(request: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { params } = context;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "letters";

    await connectDB();

    let Model;
    switch (type) {
      case "letters":
        Model = CommonCoreLettersDevoir;
        break;
      case "science":
        Model = CommonCoreScienceDevoir;
        break;
      case "technical":
        Model = CommonCoreTechnicalDevoir;
        break;
      default:
        return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    const devoir = await Model.findByIdAndDelete(params.id);

    if (!devoir) {
      return NextResponse.json(
        { message: "Devoir not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Devoir deleted successfully" });
  } catch (error) {
    console.error("Error deleting devoir:", error);
    return NextResponse.json(
      { message: "Error deleting devoir" },
      { status: 500 }
    );
  }
}
