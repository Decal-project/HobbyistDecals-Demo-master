import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";

// Save uploaded image
async function saveImage(file: File): Promise<{ data: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${uuidv4()}-${file.name}`;
  const uploadPath = path.join(process.cwd(), "public/uploads", filename);
  await fs.writeFile(uploadPath, buffer);
  return { data: `/uploads/${filename}` }; // Modified to return an object
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get("image") as File;
  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  const display_order = parseInt(formData.get("display_order") as string) || 0;
  const is_visible = formData.get("is_visible") === "true";

  if (!file || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const imageResult = await saveImage(file); // Renamed to imageResult
  const imageUrl = imageResult.data; // Extract the actual URL from the data property

  await pool.query(
    `INSERT INTO gallery_items (image_url, title, description, display_order, is_visible)
     VALUES ($1, $2, $3, $4, $5)`,
    [imageUrl, title, description, display_order, is_visible]
  );

  return NextResponse.json({ message: "Item uploaded successfully" });
}
