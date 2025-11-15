// app/api/summarize/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { logs } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        summary: "Error: Missing GEMINI_API_KEY in .env.local",
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const text = logs.map((l: any) => `- ${l.text}`).join("\n");

    const prompt = `
Summarize the user's day based on these logs:

${text}

Write a short, warm, emotional, human-sounding summary (6–8 lines).
Make it friendly and easy to understand.
    `;

    const result = await model.generateContent(prompt);

    const summary = result.response.text() || "No summary generated.";

    return NextResponse.json({ summary });
  } catch (err: any) {
    console.error("❌ GEMINI ERROR:", err);
    return NextResponse.json({ summary: "Error: " + err.message });
  }
}
