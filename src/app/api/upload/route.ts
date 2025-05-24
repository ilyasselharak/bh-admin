import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth.config";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const ALLOWED_PDF_TYPES = ["application/pdf"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File size too large. Maximum size is 50MB" },
        { status: 400 }
      );
    }

    // Check file type
    if (
      ![
        ...ALLOWED_IMAGE_TYPES,
        ...ALLOWED_VIDEO_TYPES,
        ...ALLOWED_PDF_TYPES,
      ].includes(file.type)
    ) {
      return NextResponse.json(
        { message: "File type not allowed" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${file.name}`;

    // Determine the upload directory based on file type
    let uploadDir;
    if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
      uploadDir = join(process.cwd(), "public", "uploads/videos");
    } else if (ALLOWED_PDF_TYPES.includes(file.type)) {
      uploadDir = join(process.cwd(), "public", "uploads/pdfs");
    } else {
      uploadDir = join(process.cwd(), "public", "uploads/images");
    }

    const filepath = join(uploadDir, filename);

    // Write the file
    await writeFile(filepath, buffer);

    // Return the URL of the uploaded file
    let url;
    if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
      url = `/uploads/videos/${filename}`;
    } else if (ALLOWED_PDF_TYPES.includes(file.type)) {
      url = `/uploads/pdfs/${filename}`;
    } else {
      url = `/uploads/images/${filename}`;
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { message: "Error uploading file" },
      { status: 500 }
    );
  }
}
