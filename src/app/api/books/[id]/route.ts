import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth.config";
import Book from "@/models/Book";

// GET /api/books/[id] - Get a single book
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
        { message: "Book ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const book = await Book.findById(id);

    if (!book) {
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { message: "Error fetching book" },
      { status: 500 }
    );
  }
}

// PUT /api/books/[id] - Update a book
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
        { message: "Book ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, image, description, author, isActive } = body;

    if (!title || !content) {
      return NextResponse.json(
        { message: "Title and content are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const book = await Book.findByIdAndUpdate(
      id,
      {
        title,
        content,
        image: image || null,
        description: description || "",
        author: author || "",
        isActive: isActive !== undefined ? isActive : true,
      },
      { new: true, runValidators: true }
    );

    if (!book) {
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("Error updating book:", error);
    
    // Handle validation errors
    if (error && typeof error === "object" && "name" in error && error.name === "ValidationError" && "errors" in error) {
      const validationError = error as { errors: Record<string, { message: string }> };
      const messages = Object.values(validationError.errors).map((err) => err.message);
      return NextResponse.json(
        { message: messages.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error updating book" },
      { status: 500 }
    );
  }
}

// DELETE /api/books/[id] - Delete a book
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
        { message: "Book ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { message: "Error deleting book" },
      { status: 500 }
    );
  }
}

