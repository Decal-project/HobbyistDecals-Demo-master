import { NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);

export const config = {
  api: {
    bodyParser: false,
  },
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: Request) {
  const formData = await req.formData();

  const firstName = formData.get("firstName")?.toString() ?? "";
  const phone = formData.get("phone")?.toString() ?? "";
  const email = formData.get("email")?.toString() ?? "";
  const subject = formData.get("subject")?.toString() ?? "";
  const qty = formData.get("qty")?.toString() ?? "";
  const message = formData.get("message")?.toString() ?? "";

  // Narrow file entry to a File or null
  const rawFile = formData.get("file");
  const file = rawFile instanceof File ? rawFile : null;

  let fileUrl: string | null = null;

  try {
    // 1️⃣ Handle file upload if present
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;
      const uploadsDir = path.join(process.cwd(), "public/uploads");

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${fileName}`;
    }

    // 2️⃣ Save everything to the database
    await pool.query(
      `INSERT INTO get_a_quote 
       (first_name, phone, email, subject, qty, message, file_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [firstName, phone, email, subject, qty, message, fileUrl]
    );

    // 3️⃣ Send notification email (with attachment if file was uploaded)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER || "",
        pass: process.env.MAIL_PASS || "",
      },
    });

    const attachments = file
      ? [
          {
            filename: file.name,
            path: path.join(process.cwd(), "public", fileUrl!),
          },
        ]
      : [];

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: "shkerekodi@gmail.com",
      subject: `New Quote Request from ${firstName}`,
      html: `
        <p><strong>Name:</strong> ${firstName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Qty:</strong> ${qty}</p>
        <p><strong>Message:</strong><br/>${message}</p>
        <p><strong>File:</strong> ${fileUrl ?? "No file uploaded"}</p>
      `,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("QUOTE FORM ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
