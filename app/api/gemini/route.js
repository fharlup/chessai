import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({});

export async function POST(request) {
  try {
    const { pgn, white, black } = await request.json();

    const prompt = `
      Analisis catur: ${white} vs ${black}.
      PGN: "${pgn}"
      Tugas: Berikan komentar 1 baris untuk SETIAP langkah, review akhir, dan 3 improvement.
      Output WAJIB JSON:
      {
        "moveComments": [...],
        "finalReview": "...",
        "improvements": ["...", "...", "..."]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const cleanJson = response.text.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}