import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Counter from "@/models/Counter";

async function getNextIdNo(): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { name: "customer_id" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value.toString().padStart(7, "0");
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const searchType = searchParams.get("type"); // 'id' or 'ite'

  await connectDB();

  let query: any = {};
  if (search && searchType === "id") {
    query.idNo = { $regex: search, $options: "i" };
  } else if (search && searchType === "ite") {
    query.ite = { $regex: search, $options: "i" };
  } else if (search) {
    query.$or = [
      { idNo: { $regex: search, $options: "i" } },
      { ite: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
      { surname: { $regex: search, $options: "i" } },
    ];
  }

  const customers = await Customer.find(query).sort({ createdAt: -1 });
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  await connectDB();

  const idNo = await getNextIdNo();

  const customer = await Customer.create({
    ...body,
    idNo,
    balancePayment: (body.totalAmount || 0) - (body.advancePayment || 0),
  });

  return NextResponse.json(customer, { status: 201 });
}
