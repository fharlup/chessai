"use client";

import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

export default function ChessAnalyzer() {
  const [fen, setFen] = useState("start");
  const [gamesList, setGamesList] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [moveComments, setMoveComments] = useState([]);
  const [analysis, setAnalysis] = useState({ review: "", improvements: [] });
  const [players, setPlayers] = useState({ white: "White", black: "Black", result: "0-0" });
  const [username, setUsername] = useState("fharlupTutut");
  const [status, setStatus] = useState("Siap.");
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // LOGIKA PAPAN: Menghitung posisi berdasarkan langkah yang diklik
  useEffect(() => {
    const tempGame = new Chess();
    for (let i = 0; i <= currentMoveIndex; i++) {
      if (history[i]) tempGame.move(history[i]);
    }
    const newFen = tempGame.fen();
    console.log("DEBUG [Board]: User klik langkah, FEN update ke:", newFen);
    setFen(newFen); 
  }, [currentMoveIndex, history]);

  const handleApiSearch = async () => {
    setLoading(true);
    setStatus("Mencari data...");
    try {
      const res = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);
      const { archives } = await res.json();
      const gamesRes = await fetch(archives[archives.length - 1]);
      const { games } = await gamesRes.json();
      setGamesList(games.reverse());
      setStatus(`Ditemukan ${games.length} game.`);
    } catch (e) { setStatus("Gagal tarik data."); }
    setLoading(false);
  };

  const selectGame = (index) => {
    const selected = gamesList[index];
    const newGame = new Chess();
    newGame.loadPgn(selected.pgn);

    // Reset State Game Baru (Tanpa panggil API Gemini dulu)
    setCurrentMoveIndex(-1);
    setHistory(newGame.history());
    setMoveComments([]); // Kosongkan komentar lama
    setAnalysis({ review: "", improvements: [] });
    setPlayers({ 
      white: selected.white.username, 
      black: selected.black.username, 
      result: selected.white.result === 'win' ? '1-0' : (selected.black.result === 'win' ? '0-1' : '1/2-1/2') 
    });
    setStatus("Pertandingan dipilih. Klik 'Minta Analisis AI' untuk mendapatkan strategi.");
  };

  // FUNGSI MANUAL: Jalankan analisis hanya saat tombol diklik
  const handleGetAnalysis = async () => {
    if (history.length === 0) return;
    setIsAnalyzing(true);
    setStatus("Gemini sedang berpikir keras...");
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pgn: history.join(" "), 
          white: players.white, 
          black: players.black 
        }),
      });
      const data = await res.json();
      setMoveComments(data.moveComments || []);
      setAnalysis({ review: data.finalReview, improvements: data.improvements || [] });
      setStatus("Analisis Selesai.");
    } catch (e) { setStatus("Analisis Gagal."); }
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen text-slate-900">
      
      {/* SEKSI PAPAN & NAMA (KONTRAST TINGGI) */}
      <div className="w-full lg:w-1/2 space-y-6">
        {/* Header: Slate-950 dengan Teks Putih Murni agar fharlupTutut terlihat tajam */}
        <div className="bg-slate-950 p-6 rounded-2xl flex justify-between items-center shadow-2xl border-b-4 border-blue-600">
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">PUTIH</span>
            <span className="text-2xl font-black text-white">{players.white}</span>
          </div>
          <div className="bg-slate-800 text-white px-6 py-2 rounded-xl font-mono text-3xl font-black border border-slate-700">
            {players.result}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">HITAM</span>
            <span className="text-2xl font-black text-white">{players.black}</span>
          </div>
        </div>
        
        <div className="shadow-2xl rounded-2xl overflow-hidden border-8 border-slate-950 bg-slate-900">
          {/* FIX: key={fen} memaksa komponen re-mount agar bidak PASTI BERGERAK */}
          <Chessboard key={fen} position={fen} boardOrientation="white" />
        </div>

        {/* Tombol Analisis Manual */}
        <button 
          onClick={handleGetAnalysis}
          disabled={isAnalyzing || history.length === 0}
          className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all transform active:scale-95 ${isAnalyzing ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isAnalyzing ? "SEDANG MENGANALISIS..." : "MINTA ANALISIS STRATEGI (GEMINI AI)"}
        </button>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-white border-t-4 border-blue-600 rounded-xl shadow-sm">
            <h4 className="text-xs font-black text-blue-800 uppercase mb-2">Review Strategi</h4>
            <p className="text-sm italic leading-relaxed text-slate-600">{analysis.review || "Belum ada analisis."}</p>
          </div>
          <div className="p-5 bg-white border-t-4 border-emerald-600 rounded-xl shadow-sm">
            <h4 className="text-xs font-black text-emerald-800 uppercase mb-2">Tips Improve</h4>
            <ul className="text-[10px] list-disc pl-5 space-y-1 font-bold text-slate-700">
              {analysis.improvements?.map((item, i) => <li key={i}>{item}</li>) || <li>Belum ada data.</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* SEKSI SEARCH & LIST INTERAKTIF */}
      <div className="w-full lg:w-1/2 space-y-6">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h2 className="text-2xl font-black mb-4 tracking-tighter">Cari Game Chess.com</h2>
          <div className="flex gap-2 mb-4">
            <input 
              value={username} onChange={e => setUsername(e.target.value)}
              className="flex-1 p-4 border-2 border-slate-200 rounded-2xl font-bold bg-slate-50 focus:border-blue-500 outline-none text-slate-950"
              placeholder="Username"
            />
            <button onClick={handleApiSearch} disabled={loading} className="bg-blue-600 text-white px-8 rounded-2xl font-black shadow-lg">CARI</button>
          </div>
          <select 
            onChange={(e) => selectGame(e.target.value)} 
            className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-900 outline-none cursor-pointer"
          >
            <option value="">-- Pilih Pertandingan --</option>
            {gamesList.map((g, i) => (
              <option key={i} value={i}>Vs {g.white.username === username ? g.black.username : g.white.username} ({new Date(g.end_time * 1000).toLocaleDateString()})</option>
            ))}
          </select>
          <p className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Status: {status}</p>
        </div>

        {/* LIST LANGKAH (KLIK UNTUK GERAKKAN PAPAN) */}
        <div className="bg-white border rounded-3xl overflow-hidden shadow-sm h-[500px] overflow-y-auto">
          <div className="p-4 bg-slate-950 text-white border-b border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">Move History (Click to Move Board)</h4>
          </div>
          {history.map((s, i) => (
            <div 
              key={i} 
              onClick={() => setCurrentMoveIndex(i)} 
              className={`flex gap-4 p-4 border-b cursor-pointer transition-all ${currentMoveIndex === i ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}
            >
              <div className={`font-mono text-xs font-bold min-w-[35px] text-center px-2 py-1 rounded ${currentMoveIndex === i ? 'bg-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                {Math.floor(i/2)+1}{i%2===0?'.':'...'}
              </div>
              <div className="flex-1">
                <div className="font-black text-lg leading-none mb-1">{s}</div>
                <div className={`text-[11px] italic leading-tight ${currentMoveIndex === i ? 'text-blue-100' : 'text-slate-500'}`}>
                  {moveComments[i] || "Analisis belum diminta."}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}