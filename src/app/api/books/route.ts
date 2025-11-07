import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth.config";
import Book from "@/models/Book";

// GET /api/books - Get all books
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    let query: { isActive?: boolean } = {};
    if (isActive !== null) {
      query.isActive = isActive === "true";
    }

    const books = await Book.find(query).sort({ createdAt: -1 });
    return NextResponse.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { message: "Error fetching books" },
      { status: 500 }
    );
  }
}

// POST /api/books - Create a new book
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    const book = await Book.create({
      title,
      content,
      image: image || null,
      description: description || "",
      author: author || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error: any) {
    console.error("Error creating book:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { message: messages.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error creating book" },
      { status: 500 }
    );
  }
}

