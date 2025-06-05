import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import { authOptions } from "../../auth/[...nextauth]/auth.config";

// Import all devoir models
import FirstCollegeDevoir from "@/models/FirstCollegeDevoir";
import SecondCollegeDevoir from "@/models/SecondCollegeDevoir";
import ThirdCollegeDevoir from "@/models/ThirdCollegeDevoir";
import FirstBacMathDevoir from "@/models/FirstBacMathDevoir";
import FirstBacScienceDevoir from "@/models/FirstBacScienceDevoir";
import FirstBacEconomicsDevoir from "@/models/FirstBacEconomicsDevoir";
import FirstBacLettersDevoir from "@/models/FirstBacLettersDevoir";
import SecondBacMathADevoir from "@/models/SecondBacMathADevoir";
import SecondBacMathBDevoir from "@/models/SecondBacMathBDevoir";
import SecondBacPhysicsDevoir from "@/models/SecondBacPhysicsDevoir";
import SecondBacEconomicsDevoir from "@/models/SecondBacEconomicsDevoir";
import SecondBacTechnicalDevoir from "@/models/SecondBacTechnicalDevoir";
import SecondBacLettersDevoir from "@/models/SecondBacLettersDevoir";
import SecondBacPhysicsChemistryLifeSciencesDevoir from "@/models/SecondBacPhysicsChemistryLifeSciencesDevoir";
import SecondBacTechnicalCommonDevoir from "@/models/SecondBacTechnicalCommonDevoir";
import CommonCoreLettersDevoir from "@/models/CommonCoreLettersDevoir";
import CommonCoreScienceDevoir from "@/models/CommonCoreScienceDevoir";
import CommonCoreTechnicalDevoir from "@/models/CommonCoreTechnicalDevoir";

// PATCH /api/devoirs/[id]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // College
      case "1college":
        Model = FirstCollegeDevoir;
        break;
      case "2college":
        Model = SecondCollegeDevoir;
        break;
      case "3college":
        Model = ThirdCollegeDevoir;
        break;
      // First Bac
      case "1bac_math":
        Model = FirstBacMathDevoir;
        break;
      case "1bac_science":
        Model = FirstBacScienceDevoir;
        break;
      case "1bac_economics":
        Model = FirstBacEconomicsDevoir;
        break;
      case "1bac_letters":
        Model = FirstBacLettersDevoir;
        break;
      // Second Bac
      case "2bac_math_a":
        Model = SecondBacMathADevoir;
        break;
      case "2bac_math_b":
        Model = SecondBacMathBDevoir;
        break;
      case "2bac_physics":
        Model = SecondBacPhysicsDevoir;
        break;
      case "2bac_economics":
        Model = SecondBacEconomicsDevoir;
        break;
      case "2bac_technical":
        Model = SecondBacTechnicalDevoir;
        break;
      case "2bac_letters":
        Model = SecondBacLettersDevoir;
        break;
      case "2bac_pcsvt":
        Model = SecondBacPhysicsChemistryLifeSciencesDevoir;
        break;
      case "2bac_tct":
        Model = SecondBacTechnicalCommonDevoir;
        break;
      // Common Core
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // College
      case "1college":
        Model = FirstCollegeDevoir;
        break;
      case "2college":
        Model = SecondCollegeDevoir;
        break;
      case "3college":
        Model = ThirdCollegeDevoir;
        break;
      // First Bac
      case "1bac_math":
        Model = FirstBacMathDevoir;
        break;
      case "1bac_science":
        Model = FirstBacScienceDevoir;
        break;
      case "1bac_economics":
        Model = FirstBacEconomicsDevoir;
        break;
      case "1bac_letters":
        Model = FirstBacLettersDevoir;
        break;
      // Second Bac
      case "2bac_math_a":
        Model = SecondBacMathADevoir;
        break;
      case "2bac_math_b":
        Model = SecondBacMathBDevoir;
        break;
      case "2bac_physics":
        Model = SecondBacPhysicsDevoir;
        break;
      case "2bac_economics":
        Model = SecondBacEconomicsDevoir;
        break;
      case "2bac_technical":
        Model = SecondBacTechnicalDevoir;
        break;
      case "2bac_letters":
        Model = SecondBacLettersDevoir;
        break;
      case "2bac_pcsvt":
        Model = SecondBacPhysicsChemistryLifeSciencesDevoir;
        break;
      case "2bac_tct":
        Model = SecondBacTechnicalCommonDevoir;
        break;
      // Common Core
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
