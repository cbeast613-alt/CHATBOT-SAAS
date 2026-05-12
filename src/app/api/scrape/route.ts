import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cheerio = await import("cheerio");
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, and navigation elements to get clean text
    $("script, style, nav, footer, header, noscript").remove();

    const title = $("title").text();
    const content = $("body").text()
      .replace(/\s+/g, " ") // Replace multiple spaces/newlines with single space
      .trim();

    // Limit content size for demo purposes
    const truncatedContent = content.substring(0, 5000);

    return NextResponse.json({
      title,
      content: truncatedContent,
    });

  } catch (error: unknown) {
    console.error("Scraping error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
