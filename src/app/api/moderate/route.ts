import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image, mimeType = "image/jpeg" } = await req.json();
    if (!image) return NextResponse.json({ safe: false, reason: "No image" }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn("ANTHROPIC_API_KEY missing — skipping moderation");
      return NextResponse.json({ safe: true, reason: "Dev mode bypass" });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType, data: image } },
            { type: "text", text: 'Analyze this image for moderation. Respond ONLY with JSON: {"safe": true, "categories": {"violence": false, "nsfw": false, "spam": false}}. Set safe to false if violence, nudity, or spam detected.' },
          ],
        }],
      }),
    });

    if (!res.ok) return NextResponse.json({ safe: true, reason: "API unavailable" });

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    try {
      return NextResponse.json(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch {
      return NextResponse.json({ safe: true, reason: "Parse error" });
    }
  } catch (error) {
    return NextResponse.json({ safe: false, reason: "Server error" }, { status: 500 });
  }
}
