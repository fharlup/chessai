"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

export default function ChessAnalyzer() {
  // Gunakan FEN string untuk memaksa board re-render
  const [fen, setFen] = useState("start");
  const [gamesList, setGamesList] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [moveComments, setMoveComments] = useState([]);
  const [analysis, setAnalysis] = useState({ review: "", improvements: [] });
  const [players, setPlayers] = useState({ white: "White", black: "Black", result: "*" });
  const [status, setStatus] = useState("Siap.");
  const [username, setUsername] = useState("fharlupTutut");
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef(null);

  // LOGIKA UTAMA: Gerakkan papan berdasarkan index
  useEffect(() => {
    const tempGame = new Chess();
    // Replay semua langkah sampai index saat ini
    for (let i = 0; i <= currentMoveIndex; i++) {
      if (history[i]) tempGame.move(history[i]);
    }
    const newFen = tempGame.fen();
    console.log("Updating FEN to:", newFen); // Debugging di console
    setFen(newFen); 
  }, [currentMoveIndex, history]);

  // Logic Auto-Play
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentMoveIndex((prev) => {
          if (prev < history.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 1500);
    } else {
      clearInterval(playIntervalRef.current);
    }
    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, history]);

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

  const selectGame = async (index) => {
    setIsPlaying(false);
    setCurrentMoveIndex(-1); // Reset ke awal
    const selected = gamesList[index];
    const newGame = new Chess();
    newGame.loadPgn(selected.pgn);

    setHistory(newGame.history());
    setPlayers({ 
      white: selected.white.username, 
      black: selected.black.username, 
      result: selected.white.result === 'win' ? '1-0' : (selected.black.result === 'win' ? '0-1' : '1/2-1/2') 
    });

    try {
      setStatus("Menganalisis...");
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pgn: selected.pgn, white: selected.white.username, black: selected.black.username }),
      });
      const data = await res.json();
      setMoveComments(data.moveComments || []);
      setAnalysis({ review: data.finalReview, improvements: data.improvements || [] });
      setStatus("Selesai.");
    } catch (e) { setStatus("AI Error."); }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-7xl mx-auto bg-white min-h-screen">
      
      {/* SEKSI PAPAN & NAMA (KONTRAST TINGGI) */}
      <div className="w-full lg:w-1/2 space-y-6">
        <div className="bg-slate-950 p-6 rounded-2xl flex justify-between items-center shadow-2xl border-b-4 border-blue-600">
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-400 font-black uppercase">PUTIH</span>
            {/* Teks Putih Murni agar terlihat jelas */}
            <span className="text-2xl font-black text-white">{players.white}</span>
          </div>
          <div className="bg-slate-800 text-white px-6 py-2 rounded-xl font-mono text-3xl font-black">{players.result}</div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-blue-400 font-black uppercase">HITAM</span>
            <span className="text-2xl font-black text-white">{players.black}</span>
          </div>
        </div>
        
        <div className="shadow-2xl rounded-2xl overflow-hidden border-8 border-slate-950">
          {/* Pastikan position mengambil dari state fen */}
          <Chessboard position={fen} boardOrientation="white" />
        </div>

        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-full py-4 rounded-2xl font-black text-white shadow-lg ${isPlaying ? 'bg-red-500' : 'bg-green-600'}`}
        >
          {isPlaying ? "PAUSE" : "AUTO-PLAY ANALISIS"}
        </button>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border-t-4 border-blue-600 rounded-xl text-slate-900">
            <h4 className="text-xs font-black uppercase mb-1">Review</h4>
            <p className="text-xs italic">{analysis.review || "Pilih game..."}</p>
          </div>
          <div className="p-4 bg-green-50 border-t-4 border-green-600 rounded-xl text-slate-900">
            <h4 className="text-xs font-black uppercase mb-1">Improve</h4>
            <ul className="text-[10px] list-disc pl-4 font-bold">
              {analysis.improvements?.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* SEKSI INPUT (TEKS GELAP AGAR TERBACA) */}
      <div className="w-full lg:w-1/2 space-y-6">
        <div className="bg-slate-50 p-6 rounded-3xl border shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-4">Chess Data</h2>
          <div className="flex gap-2 mb-4">
            <input 
              value={username} onChange={e => setUsername(e.target.value)}
              className="flex-1 p-4 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 bg-white outline-none focus:border-blue-600"
              placeholder="Username"
            />
            <button onClick={handleApiSearch} className="bg-blue-600 text-white px-8 rounded-2xl font-black">CARI</button>
          </div>
          <select 
            onChange={(e) => selectGame(e.target.value)} 
            className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-900"
          >
            <option value="">-- Pilih Pertandingan --</option>
            {gamesList.map((g, i) => (
              <option key={i} value={i}>Vs {g.white.username === username ? g.black.username : g.white.username} ({new Date(g.end_time * 1000).toLocaleDateString()})</option>
            ))}
          </select>
          <p className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Status: {status}</p>
        </div>

        <div className="bg-white border rounded-3xl overflow-hidden shadow-sm h-[400px] overflow-y-auto">
          {history.map((s, i) => (
            <div 
              key={i} 
              onClick={() => {setIsPlaying(false); setCurrentMoveIndex(i);}}
              className={`flex gap-4 p-4 border-b cursor-pointer ${currentMoveIndex === i ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-900'}`}
            >
              <div className="font-mono text-xs font-bold min-w-[30px]">{Math.floor(i/2)+1}{i%2===0?'.':'...'}</div>
              <div className="flex-1">
                <div className="font-black">{s}</div>
                <div className={`text-[10px] mt-1 italic ${currentMoveIndex === i ? 'text-blue-100' : 'text-slate-500'}`}>
                  {moveComments[i] || "Menganalisis..."}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}