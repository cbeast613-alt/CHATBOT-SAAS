import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfParser = new PDFParse({ data: buffer });
    const textResult = await pdfParser.getText();
    const infoResult = await pdfParser.getInfo();

    const content = textResult.text
      .replace(/\s+/g, " ")
      .trim();

    const truncatedContent = content.substring(0, 5000);

    return NextResponse.json({
      content: truncatedContent,
      pages: textResult.total,
      info: infoResult,
    });

  } catch (error: unknown) {
    console.error("PDF parsing error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
