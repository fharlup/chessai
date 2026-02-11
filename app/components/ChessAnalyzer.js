"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';

// Komponen Papan Catur Custom - Chess.com Style dengan Captured Pieces
function CustomChessboard({ position }) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  const pieceSymbols = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
  };

  const parseFEN = (fen) => {
    const parts = fen.split(' ');
    const rows = parts[0].split('/');
    const board = [];

    rows.forEach(row => {
      const rank = [];
      for (let char of row) {
        if (isNaN(char)) {
          rank.push(char);
        } else {
          for (let i = 0; i < parseInt(char); i++) {
            rank.push(null);
          }
        }
      }
      board.push(rank);
    });

    return board;
  };

  const calculateCapturedPieces = (fen) => {
    const startingPieces = {
      'P': 8, 'N': 2, 'B': 2, 'R': 2, 'Q': 1, 'K': 1,
      'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1, 'k': 1
    };
    
    const currentPieces = {
      'P': 0, 'N': 0, 'B': 0, 'R': 0, 'Q': 0, 'K': 0,
      'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0, 'k': 0
    };

    const board = parseFEN(fen);
    board.forEach(rank => {
      rank.forEach(piece => {
        if (piece && currentPieces.hasOwnProperty(piece)) {
          currentPieces[piece]++;
        }
      });
    });

    const captured = { white: [], black: [] };
    
    ['q', 'r', 'b', 'n', 'p'].forEach(piece => {
      const count = startingPieces[piece] - currentPieces[piece];
      for (let i = 0; i < count; i++) {
        captured.black.push(piece);
      }
    });

    ['Q', 'R', 'B', 'N', 'P'].forEach(piece => {
      const count = startingPieces[piece] - currentPieces[piece];
      for (let i = 0; i < count; i++) {
        captured.white.push(piece);
      }
    });

    return captured;
  };

  const board = parseFEN(position === 'start' 
    ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' 
    : position);

  const capturedPieces = calculateCapturedPieces(position === 'start' 
    ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' 
    : position);

  return (
    <div className="w-full space-y-3">
      <div className="bg-slate-800 rounded-lg p-3 min-h-[50px] flex items-center gap-1 flex-wrap">
        {capturedPieces.black.length > 0 ? (
          capturedPieces.black.map((piece, idx) => (
            <span 
              key={idx} 
              className="text-2xl text-slate-900"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
            >
              {pieceSymbols[piece]}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-500 italic">Tidak ada bidak hitam yang dimakan</span>
        )}
      </div>

      <div className="w-full aspect-square bg-[#312e2b] p-4 rounded-lg shadow-2xl">
        <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-0">
          {ranks.map((rank, rankIdx) => 
            files.map((file, fileIdx) => {
              const isLight = (rankIdx + fileIdx) % 2 === 0;
              const piece = board[rankIdx][fileIdx];
              const squareName = `${file}${rank}`;
              
              return (
                <div
                  key={squareName}
                  className={`
                    relative flex items-center justify-center
                    ${isLight ? 'bg-[#eeeed2]' : 'bg-[#769656]'}
                    transition-all duration-200
                  `}
                  style={{ aspectRatio: '1/1' }}
                >
                  {piece && (
                    <div 
                      className="select-none transition-all duration-300"
                      style={{
                        fontSize: 'clamp(2rem, 6vw, 4rem)',
                        lineHeight: 1,
                        color: piece === piece.toUpperCase() ? '#f0f0f0' : '#1a1a1a',
                        textShadow: piece === piece.toUpperCase() 
                          ? '0 2px 4px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.8)' 
                          : '0 2px 4px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.5)'
                      }}
                    >
                      {pieceSymbols[piece]}
                    </div>
                  )}
                  
                  {fileIdx === 0 && (
                    <div className={`
                      absolute left-1 top-0.5 text-[10px] font-bold
                      ${isLight ? 'text-[#769656]' : 'text-[#eeeed2]'}
                    `}>
                      {rank}
                    </div>
                  )}
                  
                  {rankIdx === 7 && (
                    <div className={`
                      absolute right-1 bottom-0.5 text-[10px] font-bold
                      ${isLight ? 'text-[#769656]' : 'text-[#eeeed2]'}
                    `}>
                      {file}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-slate-100 rounded-lg p-3 min-h-[50px] flex items-center gap-1 flex-wrap">
        {capturedPieces.white.length > 0 ? (
          capturedPieces.white.map((piece, idx) => (
            <span 
              key={idx} 
              className="text-2xl"
              style={{ 
                color: '#f0f0f0',
                textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.8)'
              }}
            >
              {pieceSymbols[piece]}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-400 italic">Tidak ada bidak putih yang dimakan</span>
        )}
      </div>
    </div>
  );
}

export default function ChessAnalyzer() {
  const [game, setGame] = useState(() => new Chess());
  const [position, setPosition] = useState("start");
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
  
  // Stockfish state
  const [engineEval, setEngineEval] = useState(null);
  const [engineReady, setEngineReady] = useState(false);
  const workerRef = useRef(null);

  // Initialize Stockfish dengan Web Worker
  useEffect(() => {
    const initStockfish = () => {
      try {
        // Buat Web Worker langsung dari stockfish.js di public folder
        const worker = new Worker('/stockfish.js');
        
        workerRef.current = worker;
        
        worker.onmessage = (e) => {
          const message = e.data;
          
          if (message.includes('uciok')) {
            setEngineReady(true);
          }
          
          if (message.includes('info') && message.includes('score')) {
            const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
            if (scoreMatch) {
              const [, type, value] = scoreMatch;
              setEngineEval({
                type,
                value: parseInt(value),
                display: type === 'mate' 
                  ? `M${value}` 
                  : (parseInt(value) / 100).toFixed(1)
              });
            }
          }
        };
        
        worker.postMessage('uci');
        
      } catch (error) {
        console.error('Failed to load Stockfish:', error);
        setStatus('Engine tidak tersedia');
      }
    };

    initStockfish();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Analyze position dengan Stockfish
  useEffect(() => {
    if (!workerRef.current || !engineReady || position === 'start') {
      setEngineEval(null);
      return;
    }

    workerRef.current.postMessage('stop');
    workerRef.current.postMessage(`position fen ${position}`);
    workerRef.current.postMessage('go depth 15');
    
  }, [position, engineReady]);

  useEffect(() => {
    if (history.length === 0) {
      setPosition("start");
      setGame(new Chess());
      setEngineEval(null);
      return;
    }

    const newGame = new Chess();
    
    for (let i = 0; i <= currentMoveIndex; i++) {
      if (history[i]) {
        try {
          newGame.move(history[i]);
        } catch (e) {
          console.error(`Error playing move ${i}:`, e);
        }
      }
    }
    
    setGame(newGame);
    setPosition(newGame.fen());
    
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
    } catch (e) { 
      setStatus("Gagal tarik data."); 
    }
    setLoading(false);
  };

  const selectGame = (index) => {
    const selected = gamesList[index];
    const newGame = new Chess();
    newGame.loadPgn(selected.pgn);
    const moves = newGame.history();

    setHistory(moves);
    setCurrentMoveIndex(-1);
    setMoveComments([]);
    setAnalysis({ review: "", improvements: [] });
    setPlayers({ 
      white: selected.white.username, 
      black: selected.black.username, 
      result: selected.white.result === 'win' ? '1-0' : (selected.black.result === 'win' ? '0-1' : '1/2-1/2') 
    });
    
    setGame(new Chess());
    setPosition("start");
    setEngineEval(null);
    setStatus("Pertandingan dipilih. Navigasi dengan tombol atau klik move.");
  };

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
    } catch (e) { 
      setStatus("Analisis Gagal."); 
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen text-slate-900">
      
      <div className="w-full lg:w-1/2 space-y-6">
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

       {/* Stockfish Evaluation Bar - IMPROVED */}
{engineReady && position !== 'start' && (
  <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-slate-300">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-slate-600 uppercase">Stockfish Analysis</span>
        {engineEval && (
          <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-mono text-slate-500">
            Depth 15
          </span>
        )}
      </div>
      <span className={`text-3xl font-black ${
        !engineEval ? 'text-slate-400' :
        parseFloat(engineEval.display) > 2 ? 'text-emerald-600' :
        parseFloat(engineEval.display) > 0 ? 'text-emerald-500' :
        parseFloat(engineEval.display) < -2 ? 'text-red-600' :
        parseFloat(engineEval.display) < 0 ? 'text-red-500' :
        'text-slate-600'
      }`}>
        {engineEval ? engineEval.display : '0.0'}
      </span>
    </div>
    
    {/* Evaluation Bar - Chess.com Style */}
    <div className="relative w-full h-8 bg-slate-900 rounded-lg overflow-hidden shadow-inner">
      <div 
        className="h-full transition-all duration-500 ease-out"
        style={{ 
          width: `${Math.min(100, Math.max(0, 50 + (engineEval ? parseFloat(engineEval.display) * 8 : 0)))}%`,
          background: engineEval && parseFloat(engineEval.display) > 0 
            ? 'linear-gradient(90deg, #f0f0f0 0%, #ffffff 100%)'
            : '#f0f0f0'
        }}
      />
      
      {/* Center Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700 opacity-50" />
      
      {/* Labels */}
      <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
        <span className="text-[10px] font-black text-white opacity-80">BLACK</span>
        <span className="text-[10px] font-black text-slate-900 opacity-80">WHITE</span>
      </div>
    </div>
    
    {/* Interpretation */}
    {engineEval && (
      <div className="mt-2 text-center">
        <p className="text-[11px] font-bold text-slate-500 italic">
          {parseFloat(engineEval.display) > 3 ? '⚔️ White dominan' :
           parseFloat(engineEval.display) > 1 ? '→ White lebih baik' :
           parseFloat(engineEval.display) > 0.3 ? '≈ White sedikit unggul' :
           parseFloat(engineEval.display) > -0.3 ? '⚖️ Posisi seimbang' :
           parseFloat(engineEval.display) > -1 ? '≈ Black sedikit unggul' :
           parseFloat(engineEval.display) > -3 ? '← Black lebih baik' :
           '⚔️ Black dominan'}
        </p>
      </div>
    )}
  </div>
)}
        
        <CustomChessboard position={position} />

        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentMoveIndex(-1)}
            disabled={currentMoveIndex === -1 || history.length === 0}
            className="flex-1 py-3 rounded-xl font-bold bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ⏮ Awal
          </button>
          <button 
            onClick={() => setCurrentMoveIndex(Math.max(-1, currentMoveIndex - 1))}
            disabled={currentMoveIndex === -1 || history.length === 0}
            className="flex-1 py-3 rounded-xl font-bold bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ◀ Prev
          </button>
          <button 
            onClick={() => setCurrentMoveIndex(Math.min(history.length - 1, currentMoveIndex + 1))}
            disabled={currentMoveIndex >= history.length - 1 || history.length === 0}
            className="flex-1 py-3 rounded-xl font-bold bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next ▶
          </button>
          <button 
            onClick={() => setCurrentMoveIndex(history.length - 1)}
            disabled={currentMoveIndex >= history.length - 1 || history.length === 0}
            className="flex-1 py-3 rounded-xl font-bold bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Akhir ⏭
          </button>
        </div>

        <button 
          onClick={handleGetAnalysis}
          disabled={isAnalyzing || history.length === 0}
          className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all transform active:scale-95 ${isAnalyzing ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isAnalyzing ? "SEDANG MENGANALISIS..." : "🤖 MINTA ANALISIS STRATEGI (GEMINI AI)"}
        </button>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-white border-t-4 border-blue-600 rounded-xl shadow-sm">
            <h4 className="text-xs font-black text-blue-800 uppercase mb-2">Review Strategi</h4>
            <p className="text-sm italic leading-relaxed text-slate-600">{analysis.review || "Belum ada analisis."}</p>
          </div>
          <div className="p-5 bg-white border-t-4 border-emerald-600 rounded-xl shadow-sm">
            <h4 className="text-xs font-black text-emerald-800 uppercase mb-2">Tips Improve</h4>
            <ul className="text-[10px] list-disc pl-5 space-y-1 font-bold text-slate-700">
              {analysis.improvements?.length > 0 ? (
                analysis.improvements.map((item, i) => <li key={i}>{item}</li>)
              ) : (
                <li>Belum ada data.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 space-y-6">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h2 className="text-2xl font-black mb-4 tracking-tighter">🔍 Cari Game Chess.com</h2>
          <div className="flex gap-2 mb-4">
            <input 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              className="flex-1 p-4 border-2 border-slate-200 rounded-2xl font-bold bg-slate-50 focus:border-blue-500 outline-none text-slate-950"
              placeholder="Username Chess.com"
            />
            <button 
              onClick={handleApiSearch} 
              disabled={loading} 
              className="bg-blue-600 text-white px-8 rounded-2xl font-black shadow-lg hover:bg-blue-700 disabled:bg-slate-400 transition-all"
            >
              {loading ? "..." : "CARI"}
            </button>
          </div>
          <select 
            onChange={(e) => e.target.value && selectGame(e.target.value)} 
            className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-900 outline-none cursor-pointer hover:border-blue-400"
            defaultValue=""
          >
            <option value="">-- Pilih Pertandingan --</option>
            {gamesList.map((g, i) => (
              <option key={i} value={i}>
                Vs {g.white.username === username ? g.black.username : g.white.username} 
                ({new Date(g.end_time * 1000).toLocaleDateString()})
              </option>
            ))}
          </select>
          <p className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">
            📊 Status: {status} {engineReady && '| ⚙️ Stockfish Ready'}
          </p>
        </div>

        <div className="bg-white border rounded-3xl overflow-hidden shadow-sm h-[500px] overflow-y-auto">
          <div className="p-4 bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-10">
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">
              📜 Move History
            </h4>
            {history.length > 0 && (
              <p className="text-[10px] text-slate-400 mt-1">
                Move {currentMoveIndex + 1} / {history.length}
              </p>
            )}
          </div>
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-bold">
              Pilih pertandingan untuk melihat langkah
            </div>
          ) : (
            history.map((move, i) => (
              <div 
                key={i} 
                onClick={() => setCurrentMoveIndex(i)} 
                className={`flex gap-4 p-4 border-b cursor-pointer transition-all ${
                  currentMoveIndex === i 
                    ? 'bg-blue-600 text-white shadow-lg scale-[1.02]' 
                    : 'hover:bg-slate-100'
                }`}
              >
                <div className={`font-mono text-xs font-bold min-w-[35px] text-center px-2 py-1 rounded ${
                  currentMoveIndex === i ? 'bg-blue-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {Math.floor(i/2)+1}{i%2===0?'.':'...'}
                </div>
                <div className="flex-1">
                  <div className="font-black text-lg leading-none mb-1">{move}</div>
                  <div className={`text-[11px] italic leading-tight ${
                    currentMoveIndex === i ? 'text-blue-100' : 'text-slate-500'
                  }`}>
                    {moveComments[i] || "Klik tombol analisis untuk insight"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}