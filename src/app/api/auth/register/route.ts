import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    // Validate request body
    if (!req.body) {
      return NextResponse.json(
        { message: "Request body is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Connect to database
    try {
      await connectDB();
    } catch (error) {
      console.error("Database connection error:", error);
      return NextResponse.json(
        { message: "Database connection error" },
        { status: 500 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      username,
      password,
      role: "admin", // You might want to change this based on your requirements
    });

    await user.save();

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Error registering user" },
      { status: 500 }
    );
  }
}
 