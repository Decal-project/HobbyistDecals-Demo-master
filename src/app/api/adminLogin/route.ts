import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // TEMPORARY
  const adminEmail = "admin@example.com";
  const adminPassword = "admin123";

  if (email === adminEmail && password === adminPassword) {
    // JWT/session logic 
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
