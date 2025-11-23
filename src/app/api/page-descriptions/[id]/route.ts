import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth.config";
import PageDescription from "@/models/PageDescription";

// GET /api/page-descriptions/[id] - Get a single page description
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, context: any) {
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
        { message: "Page description ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const pageDescription = await PageDescription.findById(id);

    if (!pageDescription) {
      return NextResponse.json(
        { message: "Page description not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pageDescription);
  } catch (error) {
    console.error("Error fetching page description:", error);
    return NextResponse.json(
      { message: "Error fetching page description" },
      { status: 500 }
    );
  }
}

// PUT /api/page-descriptions/[id] - Update a page description
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(request: Request, context: any) {
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
        { message: "Page description ID is required" },
        { status: 400 }
      );
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
    const pageDescription = await PageDescription.findByIdAndUpdate(
      id,
      {
        pagePath: pagePath.trim(),
        title: title.trim(),
        description: description.trim(),
        shortDescription: shortDescription?.trim() || "",
        isActive: isActive !== undefined ? isActive : true,
      },
      { new: true, runValidators: true }
    );

    if (!pageDescription) {
      return NextResponse.json(
        { message: "Page description not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pageDescription);
  } catch (error) {
    console.error("Error updating page description:", error);
    
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
      { message: "Error updating page description" },
      { status: 500 }
    );
  }
}

// DELETE /api/page-descriptions/[id] - Delete a page description
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
        { message: "Page description ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const pageDescription = await PageDescription.findByIdAndDelete(id);

    if (!pageDescription) {
      return NextResponse.json(
        { message: "Page description not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Page description deleted successfully" });
  } catch (error) {
    console.error("Error deleting page description:", error);
    return NextResponse.json(
      { message: "Error deleting page description" },
      { status: 500 }
    );
  }
}

