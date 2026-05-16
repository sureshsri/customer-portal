import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload document
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const isPdf = file.type === "application/pdf";

  // Convert file to base64
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;


  // Clean filename for use as public_id
    const originalName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");

    // Upload to Cloudinary - use "raw" for PDFs so they are served correctly
    const result = await cloudinary.uploader.upload(base64, {
      folder: `customer-portal/${params.id}`,
      resource_type: isPdf ? "raw" : "image",
      public_id: originalName,
      use_filename: true,
      unique_filename: true,
      allowed_formats: ["pdf", "jpg", "jpeg", "png"],
    });

    // Build viewable URL for PDFs using Cloudinary's f_pdf transformation
    let viewUrl = result.secure_url;
    if (isPdf) {
      viewUrl = result.secure_url
        .replace("/raw/upload/", "/image/upload/f_pdf/")
        .replace(/(\.[^.]+)?$/, ".pdf");
    }

    await connectDB();
    const customer = await Customer.findByIdAndUpdate(
      params.id,
      {
        $push: {
          documents: {
            name: file.name,
            url: viewUrl,
            downloadUrl: result.secure_url,
            publicId: result.public_id,
            resourceType: isPdf ? "raw" : "image",
            uploadedAt: new Date(),
          },
        },
      },
      { new: true }
    );

  return NextResponse.json(customer);
}

// Delete document
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { publicId, documentId, resourceType } = await req.json();

  // Delete from Cloudinary using correct resource type
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType || "raw",
  });

  await connectDB();
  const customer = await Customer.findByIdAndUpdate(
    params.id,
    { $pull: { documents: { _id: documentId } } },
    { new: true }
  );

  return NextResponse.json(customer);
}
