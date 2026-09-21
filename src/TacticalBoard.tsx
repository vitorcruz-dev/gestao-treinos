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

// Novos tipos para o desenho
interface Point { x: number; y: number; }
interface DrawingLine { points: Point[]; color: string; }

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
        const shortName = nameParts.length > 1 ? `${nameParts[0][0]}.${nameParts[nameParts.length-1]}` : p.name;
        const pos = i < 11 ? startPos[i] : { x: 5 + (i - 11) * 8, y: 94 }; 
        return { id: p.id, team: 'home', x: pos.x, y: pos.y, label: shortName };
      });
    }
    return [...homePieces, ...awayPieces, ballPiece];
  };

  const [pieces, setPieces] = useState<Piece[]>(getInitialPieces());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  // ESTADOS DO LÁPIS MAGNÉTICO
  const [mode, setMode] = useState<'move' | 'draw'>('move');
  const [drawColor, setDrawColor] = useState<string>('#fbbf24'); // Amarelo por defeito
  const [lines, setLines] = useState<DrawingLine[]>([]);
  const [currentLine, setCurrentLine] = useState<DrawingLine | null>(null);
  
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setPieces(getInitialPieces()); }, [players]);

  const resetBoard = () => {
    setPieces(getInitialPieces());
    setLines([]); // Apaga também os desenhos ao reiniciar
  };

  // 1. INICIAR TOQUE (Diferencia se é na Peça ou no Fundo)
  const handlePointerDownBoard = (e: React.PointerEvent) => {
    if (mode !== 'draw' || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCurrentLine({ points: [{x, y}], color: drawColor });
    if (e.target instanceof HTMLElement) e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerDownPiece = (e: React.PointerEvent, id: string) => {
    if (mode === 'draw') return; // Se está a desenhar, ignora as peças
    e.stopPropagation();
    if (e.target instanceof HTMLElement) e.target.setPointerCapture(e.pointerId);
    setDraggingId(id);
  };

  // 2. MOVER O DEDO / RATO
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    let newX = ((e.clientX - rect.left) / rect.width) * 100;
    let newY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Desenhar
    if (mode === 'draw' && currentLine) {
      setCurrentLine(prev => prev ? { ...prev, points: [...prev.points, {x: newX, y: newY}] } : null);
      return;
    }

    // Mover Peça
    if (mode === 'move' && draggingId) {
      newX = Math.max(2, Math.min(98, newX));
      newY = Math.max(2, Math.min(98, newY));
      setPieces(prev => prev.map(p => p.id === draggingId ? { ...p, x: newX, y: newY } : p));
    }
  };

  // 3. LEVANTAR O DEDO / RATO
  const handlePointerUp = (e: React.PointerEvent) => {
    if (mode === 'draw' && currentLine) {
      setLines(prev => [...prev, currentLine]);
      setCurrentLine(null);
    }
    if (draggingId) setDraggingId(null);
    if (e.target instanceof HTMLElement && e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  // Renderizar o traço SVG
  const renderPath = (line: DrawingLine) => {
    if (line.points.length < 2) return null;
    const d = `M ${line.points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    return <path d={d} stroke={line.color} strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))' }} />;
  };

  return (
    <div className="bg-white p-3 md:p-6 rounded-2xl shadow-sm border border-slate-200">
      
      {/* CABEÇALHO E FERRAMENTAS */}
      <div className="flex flex-col gap-3 mb-4 md:mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">Quadro Tático</h2>
            <p className="text-xs md:text-sm text-slate-500 hidden md:block">O plantel reflete-se automaticamente.</p>
          </div>
          <button onClick={resetBoard} className="text-xs font-bold text-slate-500 hover:text-slate-800 underline">
            Repor e Apagar Tudo
          </button>
        </div>

        {/* BARRA DE FERRAMENTAS */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
          <button 
            onClick={() => setMode('move')} 
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'move' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            👆 Mover
          </button>
          <button 
            onClick={() => setMode('draw')} 
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'draw' ? 'bg-yellow-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            ✏️ Desenhar
          </button>

          {mode === 'draw' && (
            <div className="flex flex-1 items-center gap-3 ml-auto pl-3 md:border-l border-slate-300">
              <button onClick={() => setDrawColor('#fbbf24')} className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-yellow-400 border-2 ${drawColor === '#fbbf24' ? 'border-slate-800 scale-110' : 'border-white'} shadow-sm`}></button>
              <button onClick={() => setDrawColor('#ef4444')} className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-red-500 border-2 ${drawColor === '#ef4444' ? 'border-slate-800 scale-110' : 'border-white'} shadow-sm`}></button>
              <button onClick={() => setDrawColor('#ffffff')} className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border-2 ${drawColor === '#ffffff' ? 'border-slate-800 scale-110' : 'border-slate-300'} shadow-sm`}></button>
              
              <div className="flex-1"></div>
              <button onClick={() => setLines([])} className="px-3 py-1.5 text-[10px] md:text-xs font-bold text-red-600 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 transition-colors">
                Apagar Linhas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* O CAMPO DE FUTEBOL */}
      <div 
        ref={boardRef}
        className="relative w-full overflow-hidden rounded-xl shadow-inner bg-green-700 border-2 md:border-4 border-green-800 touch-none select-none cursor-crosshair"
        style={{ aspectRatio: '105 / 68', overscrollBehavior: 'none' }}
        onPointerDown={handlePointerDownBoard}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Camada 1: Linhas do Campo */}
        <svg viewBox="0 0 105 68" className="absolute inset-0 w-full h-full pointer-events-none z-0">
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

        {/* Camada 2: Desenhos Livres (Ficam por cima do campo e das peças para se notar bem) */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-40">
          {lines.map((line, index) => <g key={index}>{renderPath(line)}</g>)}
          {currentLine && renderPath(currentLine)}
        </svg>

        {/* Camada 3: Peças (Jogadores e Bola) */}
        {pieces.map(piece => {
          const isBall = piece.team === 'ball';
          const isHome = piece.team === 'home';
          const isAway = piece.team === 'away';

          // A MAGIA ESTÁ AQUI: Se o modo for 'draw', as peças deixam de reagir ao dedo (pointer-events-none)
          // Isso permite desenhar linhas direitinhas por cima dos jogadores sem os arrastar por engano!
          let classes = `absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 select-none shadow-md transition-transform duration-75 touch-none ${mode === 'draw' ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing'}`;

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
              onPointerDown={(e) => handlePointerDownPiece(e, piece.id)}
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