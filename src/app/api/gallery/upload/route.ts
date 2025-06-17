import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";

// Helper to save uploaded image
async function saveImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${uuidv4()}-${file.name}`;

  const dir = path.join(process.cwd(), "public/uploads");
  await fs.mkdir(dir, { recursive: true }); // Ensure directory exists

  const uploadPath = path.join(dir, filename);
  await fs.writeFile(uploadPath, buffer);

  return `/uploads/${filename}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("image") as File;
    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const displayOrderRaw = formData.get("display_order")?.toString();
    const display_order = displayOrderRaw ? parseInt(displayOrderRaw) : 0;
    const is_visible = formData.get("is_visible") === "true";

    // Validate required fields
    if (!file || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save image to disk
    const imageUrl = await saveImage(file);

    // Insert into PostgreSQL
    await pool.query(
      `INSERT INTO gallery_items (image_url, title, description, display_order, is_visible)
       VALUES ($1, $2, $3, $4, $5)`,
      [imageUrl, title, description, display_order, is_visible]
    );

    return NextResponse.json({ message: "Item uploaded successfully", imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
