import { sendWelcomeEmail } from "@/lib/emails";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Missing email or name" }, { status: 400 });
    }

    await sendWelcomeEmail(email, name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Welcome email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
