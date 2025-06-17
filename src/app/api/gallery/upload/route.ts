// app/api/gallery/route.ts (assuming this is your gallery route)

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
// import { v4 as uuidv4 } from "uuid"; // Not needed for Base64
// import path from "path"; // Not needed for Base64
// import fs from "fs/promises"; // Not needed for Base64

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("image") as File;
    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const display_order = parseInt(formData.get("display_order") as string) || 0;
    const is_visible = formData.get("is_visible") === "true";

    if (!file || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Convert image to Base64 string
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Assuming your 'gallery_items' table has an 'image_url' column capable of storing TEXT or JSONB
    // If you plan to store multiple images per gallery item, consider changing image_url to JSONB TEXT[] in Postgres
    await pool.query(
      `INSERT INTO gallery_items (image_url, title, description, display_order, is_visible)
       VALUES ($1, $2, $3, $4, $5)`,
      [imageUrl, title, description, display_order, is_visible]
    );

    return NextResponse.json({ message: "Item uploaded successfully" });
  } catch (error) {
    console.error('Error uploading gallery item:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
