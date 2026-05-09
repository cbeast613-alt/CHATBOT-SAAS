import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data = await pdfParse(buffer);
    
    const content = data.text
      .replace(/\s+/g, " ")
      .trim();

    // Limit content size
    const truncatedContent = content.substring(0, 5000);

    return NextResponse.json({
      content: truncatedContent,
      pages: data.numpages,
      info: data.info,
    });

  } catch (error: unknown) {
    console.error("PDF parsing error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
