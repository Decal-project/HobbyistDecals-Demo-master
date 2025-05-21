import { NextResponse, NextRequest } from "next/server";
import { Pool } from "pg";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Utility to extract blog ID from pathname
const getIdFromUrl = (req: NextRequest): string => {
  const segments = req.nextUrl.pathname.split("/");
  return segments[segments.length - 1];
};

export async function PUT(req: NextRequest) {
  const id = getIdFromUrl(req);
  const formData = await req.formData();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const author_name = formData.get("author_name") as string;
  const category_name = formData.get("category_name") as string;
  const status = formData.get("status") as string;
  const published_at = formData.get("published_at") as string;

  let cover_image_url: string | null = null;
  const file = formData.get("cover_image");

  if (file && typeof file === "object" && "arrayBuffer" in file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = path.extname((file as File).name);
    const fileName = `${randomUUID()}${fileExt}`;
    const filePath = path.join(process.cwd(), "public/uploads", fileName);
    await writeFile(filePath, buffer);
    cover_image_url = `/uploads/${fileName}`;
  }

  try {
    const client = await pool.connect();

    const query = `
      UPDATE blogs SET
        title = $1,
        content = $2,
        author_name = $3,
        category_name = $4,
        status = $5,
        published_at = $6
        ${cover_image_url ? `, cover_image_url = $8` : ""}
      WHERE id = $7
    `;

    const values = [
      title,
      content,
      author_name,
      category_name,
      status,
      published_at,
      id,
    ];

    if (cover_image_url) values.push(cover_image_url);

    await client.query(query, values);
    client.release();

    return NextResponse.json({ message: "Blog updated successfully" });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = getIdFromUrl(req);

  try {
    const client = await pool.connect();
    await client.query("DELETE FROM blogs WHERE id = $1", [id]);
    client.release();
    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}
