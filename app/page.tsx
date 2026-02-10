import ChessAnalyzer from './components/ChessAnalyzer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-5xl w-full">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-3">
            CHESS<span className="text-blue-600">RECAP</span>
          </h1>
          <p className="text-lg text-gray-600">
            Analisis langkah catur dari screenshot secara otomatis menggunakan Gemini AI.
          </p>
        </header>

        <ChessAnalyzer />
      </div>
    </div>
  );
}