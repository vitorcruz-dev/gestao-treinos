import React, { useState, useRef } from 'react';

interface Piece {
  id: string;
  team: 'home' | 'away' | 'ball';
  x: number;
  y: number;
  label: string;
}

// Posições iniciais (Tática 4-3-3 para ambas as equipas)
const initialPieces: Piece[] = [
  // Nossa Equipa (Azul)
  { id: 'h1', team: 'home', x: 8, y: 50, label: 'GR' },
  { id: 'h2', team: 'home', x: 22, y: 20, label: 'DD' },
  { id: 'h3', team: 'home', x: 20, y: 40, label: 'DC' },
  { id: 'h4', team: 'home', x: 20, y: 60, label: 'DC' },
  { id: 'h5', team: 'home', x: 22, y: 80, label: 'DE' },
  { id: 'h6', team: 'home', x: 35, y: 50, label: 'MDC' },
  { id: 'h7', team: 'home', x: 42, y: 30, label: 'MC' },
  { id: 'h8', team: 'home', x: 42, y: 70, label: 'MC' },
  { id: 'h9', team: 'home', x: 55, y: 20, label: 'ED' },
  { id: 'h10', team: 'home', x: 55, y: 80, label: 'EE' },
  { id: 'h11', team: 'home', x: 55, y: 50, label: 'PL' },

  // Adversário (Vermelho)
  { id: 'a1', team: 'away', x: 92, y: 50, label: 'GR' },
  { id: 'a2', team: 'away', x: 78, y: 20, label: 'DE' },
  { id: 'a3', team: 'away', x: 80, y: 40, label: 'DC' },
  { id: 'a4', team: 'away', x: 80, y: 60, label: 'DC' },
  { id: 'a5', team: 'away', x: 78, y: 80, label: 'DD' },
  { id: 'a6', team: 'away', x: 65, y: 50, label: 'MDC' },
  { id: 'a7', team: 'away', x: 58, y: 30, label: 'MC' },
  { id: 'a8', team: 'away', x: 58, y: 70, label: 'MC' },
  { id: 'a9', team: 'away', x: 45, y: 20, label: 'EE' },
  { id: 'a10', team: 'away', x: 45, y: 80, label: 'ED' },
  { id: 'a11', team: 'away', x: 45, y: 50, label: 'PL' },

  // Bola
  { id: 'ball', team: 'ball', x: 50, y: 50, label: '⚽' },
];

export default function TacticalBoard() {
  const [pieces, setPieces] = useState<Piece[]>(initialPieces);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const resetBoard = () => setPieces(initialPieces);

  // Iniciar o arrasto
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingId(id);
  };

  // Mover a peça
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();

    // Calcular a posição em percentagem (%) para o layout ser responsivo
    let newX = ((e.clientX - rect.left) / rect.width) * 100;
    let newY = ((e.clientY - rect.top) / rect.height) * 100;

    // Limites do campo (não deixar sair das 4 linhas)
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    setPieces((prev) =>
      prev.map((p) => (p.id === draggingId ? { ...p, x: newX, y: newY } : p))
    );
  };

  // Terminar o arrasto
  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingId(null);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">
          Quadro Tático Interativo
        </h2>
        <button
          onClick={resetBoard}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-bold hover:bg-gray-300"
        >
          Reiniciar Posições
        </button>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        * Arraste os jogadores e a bola pelo campo para explicar movimentações
        táticas.
      </div>

      {/* O Campo de Futebol */}
      <div
        ref={boardRef}
        className="relative w-full overflow-hidden rounded shadow-inner"
        style={{ aspectRatio: '105 / 68', touchAction: 'none' }} // touch-action: none previne scroll no telemóvel ao arrastar
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Fundo SVG do Campo (As Linhas) */}
        <svg
          viewBox="0 0 105 68"
          className="absolute inset-0 w-full h-full bg-green-700 pointer-events-none"
        >
          <g stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" fill="none">
            {/* Linhas Laterais e de Fundo */}
            <rect x="2.5" y="2.5" width="100" height="63" />

            {/* Linha de Meio Campo e Círculo Central */}
            <line x1="52.5" y1="2.5" x2="52.5" y2="65.5" />
            <circle cx="52.5" cy="34" r="9.15" />
            <circle cx="52.5" cy="34" r="0.5" fill="white" />

            {/* Grande Área Esquerda */}
            <rect x="2.5" y="13.8" width="16.5" height="40.3" />
            {/* Pequena Área Esquerda */}
            <rect x="2.5" y="24.8" width="5.5" height="18.3" />
            {/* Marca de Penálti Esquerda */}
            <circle cx="13.5" cy="34" r="0.5" fill="white" />
            {/* Meia-lua Esquerda (arco simples usando path) */}
            <path d="M 19 25.5 A 9.15 9.15 0 0 1 19 42.5" />

            {/* Grande Área Direita */}
            <rect x="86" y="13.8" width="16.5" height="40.3" />
            {/* Pequena Área Direita */}
            <rect x="97" y="24.8" width="5.5" height="18.3" />
            {/* Marca de Penálti Direita */}
            <circle cx="91.5" cy="34" r="0.5" fill="white" />
            {/* Meia-lua Direita */}
            <path d="M 86 25.5 A 9.15 9.15 0 0 0 86 42.5" />
          </g>
        </svg>

        {/* As Peças (Jogadores e Bola) */}
        {pieces.map((piece) => {
          const isBall = piece.team === 'ball';
          const isHome = piece.team === 'home';
          const size = isBall ? 'w-6 h-6 text-xl' : 'w-8 h-8 text-xs font-bold';

          let bgColor = 'bg-white';
          if (isHome)
            bgColor = 'bg-blue-600 text-white border-2 border-blue-900';
          if (piece.team === 'away')
            bgColor = 'bg-red-600 text-white border-2 border-red-900';
          if (isBall) bgColor = 'text-center drop-shadow-md';

          return (
            <div
              key={piece.id}
              onPointerDown={(e) => handlePointerDown(e, piece.id)}
              className={`absolute flex items-center justify-center rounded-full cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 select-none shadow ${size} ${bgColor} ${
                draggingId === piece.id
                  ? 'z-50 scale-125'
                  : 'z-10 transition-transform'
              }`}
              style={{
                left: `${piece.x}%`,
                top: `${piece.y}%`,
                touchAction: 'none',
              }}
            >
              {!isBall && piece.label}
              {isBall && piece.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
