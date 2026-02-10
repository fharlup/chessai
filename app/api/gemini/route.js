import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({});

export async function POST(request) {
  try {
    const { pgn, white, black } = await request.json();

    const prompt = `
      Analisis strategi catur antara ${white} vs ${black}.
      PGN: "${pgn}"
      TUGAS:
      1. Berikan komentar 1 baris (maks 10 kata) untuk SETIAP langkah.
      2. Berikan review singkat di akhir pertandingan.
      3. Berikan 3 poin improvement untuk pemain Putih.
      
      OUTPUT WAJIB JSON (TANPA TEKS LAIN):
      {
        "moveComments": ["...", "...", ...],
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