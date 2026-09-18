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
  
  // Função que constrói a equipa com base no Plantel atual
  const getInitialPieces = (): Piece[] => {
    let homePieces: Piece[] = [];
    
    if (players.length === 0) {
      // Se não houver ninguém no plantel, usa os nomes genéricos
      homePieces = startPos.map((pos, i) => ({
        id: `h${i}`, team: 'home', x: pos.x, y: pos.y, label: genericLabels[i]
      }));
    } else {
      // Cria uma peça para cada jogador real do Plantel
      homePieces = players.map((p, i) => {
        // Encurtar o nome (Ex: "João Pedro Silva" -> "J. Silva")
        const nameParts = p.name.trim().split(' ');
        const shortName = nameParts.length > 1 
          ? `${nameParts[0][0]}.${nameParts[nameParts.length-1]}` 
          : p.name;
        
        // Os primeiros 11 vão para o campo. Os restantes ficam na linha de fundo (suplentes)
        const pos = i < 11 ? startPos[i] : { x: 5 + (i - 11) * 8, y: 96 }; 
        
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

  // Atualiza as peças no quadro se o plantel mudar
  useEffect(() => {
    setPieces(getInitialPieces());
  }, [players]);

  const resetBoard = () => setPieces(getInitialPieces());

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    let newX = ((e.clientX - rect.left) / rect.width) * 100;
    let newY = ((e.clientY - rect.top) / rect.height) * 100;
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));
    setPieces(prev => prev.map(p => p.id === draggingId ? { ...p, x: newX, y: newY } : p));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingId(null);
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Quadro Tático Interativo</h2>
          <p className="text-sm text-slate-500">Arraste os jogadores pelo campo. Os jogadores adicionados ao <b>Plantel</b> aparecem aqui automaticamente.</p>
        </div>
        <button onClick={resetBoard} className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors shadow-lg">
          Reiniciar Posições
        </button>
      </div>

      {/* O Campo de Futebol */}
      <div 
        ref={boardRef}
        className="relative w-full overflow-hidden rounded-xl shadow-inner bg-green-700 border-4 border-green-800"
        style={{ aspectRatio: '105 / 68', touchAction: 'none' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <svg viewBox="0 0 105 68" className="absolute inset-0 w-full h-full pointer-events-none">
          <g stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" fill="none">
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

          let classes = 'absolute flex items-center justify-center cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 select-none shadow-md transition-transform duration-75';

          if (isBall) {
            classes += ' w-6 h-6 text-xl text-center drop-shadow-lg z-30';
          } else if (isHome) {
            // A nossa equipa usa uma etiqueta (pill) para caber o nome do jogador
            classes += ' bg-blue-600 text-white border border-blue-400 rounded-md px-2 py-1 text-[9px] md:text-xs font-bold whitespace-nowrap z-20';
          } else if (isAway) {
            // Adversários continuam com círculos normais
            classes += ' bg-red-600 text-white border-2 border-red-900 rounded-full w-6 h-6 md:w-8 md:h-8 text-[9px] font-bold z-10';
          }
          
          if (draggingId === piece.id) classes += ' scale-110 md:scale-125 z-50 shadow-2xl';

          return (
            <div
              key={piece.id}
              onPointerDown={(e) => handlePointerDown(e, piece.id)}
              className={classes}
              style={{ left: `${piece.x}%`, top: `${piece.y}%`, touchAction: 'none' }}
            >
              {piece.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}