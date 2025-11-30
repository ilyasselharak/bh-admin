import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth.config";
import PageDescription from "@/models/PageDescription";

// GET /api/page-descriptions - Get all page descriptions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    const query: { isActive?: boolean } = {};
    if (isActive !== null) {
      query.isActive = isActive === "true";
    }

    const pageDescriptions = await PageDescription.find(query).sort({ createdAt: -1 });
    return NextResponse.json(pageDescriptions);
  } catch (error) {
    console.error("Error fetching page descriptions:", error);
    return NextResponse.json(
      { message: "Error fetching page descriptions" },
      { status: 500 }
    );
  }
}

// POST /api/page-descriptions - Create a new page description
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pagePath, title, description, shortDescription, isActive } = body;

    if (!pagePath || !title || !description) {
      return NextResponse.json(
        { message: "Page path, title, and description are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const pageDescription = await PageDescription.create({
      pagePath: pagePath.trim(),
      title: title.trim(),
      description: description.trim(),
      shortDescription: shortDescription?.trim() || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(pageDescription, { status: 201 });
  } catch (error) {
    console.error("Error creating page description:", error);
    
    // Handle validation errors
    if (error && typeof error === "object" && "name" in error && error.name === "ValidationError" && "errors" in error) {
      const validationError = error as { errors: Record<string, { message: string }> };
      const messages = Object.values(validationError.errors).map((err) => err.message);
      return NextResponse.json(
        { message: messages.join(", ") },
        { status: 400 }
      );
    }

    // Handle duplicate key error
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json(
        { message: "Page path already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error creating page description" },
      { status: 500 }
    );
  }
}

