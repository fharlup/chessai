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
1. Berikan komentar 1 baris (maks 10 kata) untuk SETIAP langkah
2. Berikan review singkat di akhir pertandingan  
3. Berikan 3 poin improvement untuk pemain Putih

OUTPUT WAJIB JSON MURNI (TANPA MARKDOWN, TANPA BACKTICKS):
{
  "moveComments": ["komentar move 1", "komentar move 2", ...],
  "finalReview": "review singkat pertandingan",
  "improvements": ["tip 1", "tip 2", "tip 3"]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    // PERBAIKAN: response.text adalah property, bukan method
    const responseText = response.text;
    
    console.log('Raw response:', responseText);
    
    // Bersihkan dari markdown
    let cleanJson = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    // Ekstrak JSON jika ada teks lain
    const firstBracket = cleanJson.indexOf('{');
    const lastBracket = cleanJson.lastIndexOf('}');
    
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
    }

    const parsedData = JSON.parse(cleanJson);
    
    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("API Error Details:", error);
    return NextResponse.json({ 
      error: error.message,
      moveComments: [],
      finalReview: "Analisis gagal. Silakan coba lagi.",
      improvements: ["Pastikan API key valid", "Coba model lain", "Cek kuota API"]
    }, { status: 500 });
  }
}