import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import JobCategory from "@/models/JobCategory";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const categories = await JobCategory.find({}).sort({ name: 1 });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  await connectDB();

  const existing = await JobCategory.findOne({ name });
  if (existing) return NextResponse.json({ error: "Category already exists" }, { status: 400 });

  const category = await JobCategory.create({ name, description });
  return NextResponse.json(category, { status: 201 });
}
