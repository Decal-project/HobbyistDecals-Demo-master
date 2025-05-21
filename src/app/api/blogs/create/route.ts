import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const author_name = formData.get("author_name") as string;
    const category_name = formData.get("category_name") as string;
    const status = formData.get("status") as string;
    const published_at = formData.get("published_at") as string;
    const file = formData.get("image") as File;

    if (!title || !content || !file || !author_name || !category_name || !status || !published_at) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure /public/uploads directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save image
    const imageName = `${uuidv4()}-${file.name}`;
    const imagePath = path.join(uploadDir, imageName);
    await writeFile(imagePath, buffer);
    const coverImageUrl = `/uploads/${imageName}`;

    // Insert into the PostgreSQL database
    await pool.query(
      `INSERT INTO blogs (title, content, author_name, category_name, status, published_at, cover_image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [title, content, author_name, category_name, status, published_at, coverImageUrl]
    );

    return NextResponse.json({ message: "Blog created successfully", coverImageUrl });
  } catch (error: any) {
    console.error("Blog creation error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: error.message },
      { status: 500 }
    );
  }
}
