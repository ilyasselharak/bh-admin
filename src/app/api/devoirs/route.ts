import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import CommonCoreLettersDevoir from "@/models/CommonCoreLettersDevoir";
import CommonCoreScienceDevoir from "@/models/CommonCoreScienceDevoir";
import CommonCoreTechnicalDevoir from "@/models/CommonCoreTechnicalDevoir";
import { authOptions } from "../auth/[...nextauth]/auth.config";

// GET /api/devoirs
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "letters";
    const semester = searchParams.get("semester") || "1";

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

    const devoir = await Model.create({
      title,
      content,
      semester: Number(semester),
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
