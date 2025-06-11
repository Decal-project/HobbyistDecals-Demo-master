// app/api/gallery/route.ts
// Make sure this file handles all POST, GET, PUT, DELETE operations for /api/gallery

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs"; // Import existsSync for checking file existence

// Helper function to save uploaded image
async function saveImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${uuidv4()}-${file.name}`;
  const uploadDir = path.join(process.cwd(), "public/uploads");
  // Ensure the uploads directory exists
  await fs.mkdir(uploadDir, { recursive: true });
  const uploadPath = path.join(uploadDir, filename);
  await fs.writeFile(uploadPath, buffer);
  return `/uploads/${filename}`;
}

// Helper function to delete an image
async function deleteImage(imageUrl: string): Promise<void> {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
    // Not an uploaded image or invalid URL, do nothing
    return;
  }
  const filePath = path.join(process.cwd(), "public", imageUrl);
  try {
    if (existsSync(filePath)) { // Check if file exists before attempting to delete
      await fs.unlink(filePath);
    } else {
      console.warn(`File not found, skipping deletion: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting image file ${filePath}:`, error);
    // You might want to throw the error or handle it based on your needs
  }
}

// POST: Add new gallery item
export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get("image") as File;
  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  const display_order = parseInt(formData.get("display_order") as string) || 0;
  const is_visible = formData.get("is_visible") === "true";

  if (!file || !title) {
    return NextResponse.json({ error: "Missing required fields: image and title" }, { status: 400 });
  }

  try {
    const imageUrl = await saveImage(file);

    await pool.query(
      `INSERT INTO gallery_items (image_url, title, description, display_order, is_visible)
       VALUES ($1, $2, $3, $4, $5)`,
      [imageUrl, title, description, display_order, is_visible]
    );

    return NextResponse.json({ message: "Item uploaded successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error uploading item:", error);
    return NextResponse.json({ error: "Failed to upload item" }, { status: 500 });
  }
}

// GET: Fetch all gallery items
export async function GET(req: NextRequest) {
  try {
    const { rows } = await pool.query(
      `SELECT id, image_url, title, description, display_order, is_visible, created_at
       FROM gallery_items
       ORDER BY display_order ASC, created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery items" },
      { status: 500 }
    );
  }
}

// PUT: Update an existing gallery item
export async function PUT(req: NextRequest) {
  const formData = await req.formData();
  const id = formData.get("id")?.toString(); // Get ID from form data
  const file = formData.get("image") as File | null; // Image is optional for update
  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  const display_order = parseInt(formData.get("display_order") as string) || 0;
  const is_visible = formData.get("is_visible") === "true";
  const existingImageUrl = formData.get("existing_image_url")?.toString() || ""; // To delete old image if new one is uploaded

  if (!id || !title) {
    return NextResponse.json({ error: "Missing required fields: ID and title" }, { status: 400 });
  }

  let imageUrlToSave = existingImageUrl; // Default to existing image URL

  try {
    if (file) {
      // If a new file is uploaded, save it and delete the old one
      imageUrlToSave = await saveImage(file);
      if (existingImageUrl) {
        await deleteImage(existingImageUrl);
      }
    }

    await pool.query(
      `UPDATE gallery_items
       SET image_url = $1, title = $2, description = $3, display_order = $4, is_visible = $5
       WHERE id = $6`,
      [imageUrlToSave, title, description, display_order, is_visible, id]
    );

    return NextResponse.json({ message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE: Delete a gallery item
export async function DELETE(req: NextRequest) {
  // For DELETE, you typically send the ID in the query params or body.
  // Using query params for simplicity here: /api/gallery?id=123
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
  }

  try {
    // First, get the image_url to delete the file from the public folder
    const { rows } = await pool.query(
      `SELECT image_url FROM gallery_items WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const imageUrlToDelete = rows[0].image_url;

    await pool.query(
      `DELETE FROM gallery_items WHERE id = $1`,
      [id]
    );

    // After successful database deletion, delete the image file
    if (imageUrlToDelete) {
      await deleteImage(imageUrlToDelete);
    }

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}