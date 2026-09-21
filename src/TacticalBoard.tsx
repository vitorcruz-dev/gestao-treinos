import React, { useState, useRef, useEffect } from 'react';
import { Player } from './types';

interface TacticalBoardProps {
  players: Player[];
}

interface Piece {
  id: string;
  team: 'home' | 'away' | 'ball';
  x: number;
  y: number;
  label: string;
}

// Posições base do 4-3-3 para os primeiros 11 jogadores
const startPos = [
  {x: 8, y: 50}, {x: 22, y: 20}, {x: 20, y: 40}, {x: 20, y: 60}, {x: 22, y: 80},
  {x: 35, y: 50}, {x: 42, y: 30}, {x: 42, y: 70}, {x: 55, y: 20}, {x: 55, y: 80}, {x: 55, y: 50}
];
const genericLabels = ['GR','DD','DC','DC','DE','MDC','MC','MC','ED','EE','PL'];

const awayPieces: Piece[] = [
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
];

const ballPiece: Piece = { id: 'ball', team: 'ball', x: 50, y: 50, label: '⚽' };

export default function TacticalBoard({ players }: TacticalBoardProps) {
  
  const getInitialPieces = (): Piece[] => {
    let homePieces: Piece[] = [];
    
    if (players.length === 0) {
      homePieces = startPos.map((pos, i) => ({
        id: `h${i}`, team: 'home', x: pos.x, y: pos.y, label: genericLabels[i]
      }));
    } else {
      homePieces = players.map((p, i) => {
        const nameParts = p.name.trim().split(' ');
        const shortName = nameParts.length > 1 
          ? `${nameParts[0][0]}.${nameParts[nameParts.length-1]}` 
          : p.name;
        
        const pos = i < 11 ? startPos[i] : { x: 5 + (i - 11) * 8, y: 94 }; 
        return {
          id: p.id,
          team: 'home',
          x: pos.x,
          y: pos.y,
          label: shortName
        };
      });
    }
    return [...homePieces, ...awayPieces, ballPiece];
  };

  const [pieces, setPieces] = useState<Piece[]>(getInitialPieces());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPieces(getInitialPieces());
  }, [players]);

  const resetBoard = () => setPieces(getInitialPieces());

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    // Bloqueia o scroll nativo do telemóvel ao tocar numa peça
    if (e.target instanceof HTMLElement) {
      e.target.setPointerCapture(e.pointerId);
    }
    setDraggingId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    
    let newX = ((e.clientX - rect.left) / rect.width) * 100;
    let newY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Evita que as peças saiam completamente fora do quadrado
    newX = Math.max(2, Math.min(98, newX));
    newY = Math.max(2, Math.min(98, newY));
    
    setPieces(prev => prev.map(p => p.id === draggingId ? { ...p, x: newX, y: newY } : p));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      if (e.target instanceof HTMLElement && e.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
      }
      setDraggingId(null);
    }
  };

  return (
    <div className="bg-white p-3 md:p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900">Quadro Tático</h2>
          <p className="text-xs md:text-sm text-slate-500">Arraste os jogadores. O plantel reflete-se automaticamente.</p>
        </div>
        <button onClick={resetBoard} className="w-full md:w-auto bg-slate-800 text-white px-5 py-3 md:py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors shadow-lg active:scale-95">
          Reiniciar Posições
        </button>
      </div>

      {/* O Campo de Futebol com proteções Mobile (overscroll, touch-none) */}
      <div 
        ref={boardRef}
        className="relative w-full overflow-hidden rounded-xl shadow-inner bg-green-700 border-2 md:border-4 border-green-800 touch-none select-none"
        style={{ aspectRatio: '105 / 68', overscrollBehavior: 'none' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}   // <--- Crucial para mobile: se o dedo for interrompido por um popup, larga a peça
        onPointerLeave={handlePointerUp}    // <--- Crucial: se o dedo escorregar para fora do ecrã, larga a peça
      >
        <svg viewBox="0 0 105 68" className="absolute inset-0 w-full h-full pointer-events-none">
          <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" fill="none">
            <rect x="2.5" y="2.5" width="100" height="63" />
            <line x1="52.5" y1="2.5" x2="52.5" y2="65.5" />
            <circle cx="52.5" cy="34" r="9.15" />
            <circle cx="52.5" cy="34" r="0.5" fill="white" />
            <rect x="2.5" y="13.8" width="16.5" height="40.3" />
            <rect x="2.5" y="24.8" width="5.5" height="18.3" />
            <circle cx="13.5" cy="34" r="0.5" fill="white" />
            <path d="M 19 25.5 A 9.15 9.15 0 0 1 19 42.5" />
            <rect x="86" y="13.8" width="16.5" height="40.3" />
            <rect x="97" y="24.8" width="5.5" height="18.3" />
            <circle cx="91.5" cy="34" r="0.5" fill="white" />
            <path d="M 86 25.5 A 9.15 9.15 0 0 0 86 42.5" />
          </g>
        </svg>

        {/* Peças (Jogadores e Bola) */}
        {pieces.map(piece => {
          const isBall = piece.team === 'ball';
          const isHome = piece.team === 'home';
          const isAway = piece.team === 'away';

          // A classe touch-none em cada peça também ajuda a bloquear swipes acidentais
          let classes = 'absolute flex items-center justify-center cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 select-none shadow-md transition-transform duration-75 touch-none';

          if (isBall) {
            classes += ' w-8 h-8 md:w-10 md:h-10 text-xl md:text-3xl text-center drop-shadow-lg z-30';
          } else if (isHome) {
            classes += ' bg-blue-600 text-white border border-blue-300 rounded-md px-1.5 py-0.5 md:px-2 md:py-1 text-[9px] md:text-xs font-bold whitespace-nowrap z-20';
          } else if (isAway) {
            classes += ' bg-red-600 text-white border-2 border-red-900 rounded-full w-5 h-5 md:w-7 md:h-7 text-[8px] md:text-[10px] font-bold z-10';
          }
          
          if (draggingId === piece.id) classes += ' scale-125 md:scale-150 z-50 shadow-2xl ring-2 ring-white/50';

          return (
            <div
              key={piece.id}
              onPointerDown={(e) => handlePointerDown(e, piece.id)}
              className={classes}
              style={{ left: `${piece.x}%`, top: `${piece.y}%` }}
            >
              {piece.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}