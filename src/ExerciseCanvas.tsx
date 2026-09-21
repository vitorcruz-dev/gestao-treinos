import React, { useState, useRef, useEffect } from 'react';

export interface CanvasItem {
  id: string;
  type: 'blue' | 'red' | 'yellow' | 'green' | 'cone' | 'goal' | 'barrier' | 'ball' | 'player_home' | 'player_away';
  x: number;
  y: number;
}

interface ExerciseCanvasProps {
  initialItems?: CanvasItem[];
  onChange?: (items: CanvasItem[]) => void;
  readOnly?: boolean;
}

interface Point { x: number; y: number; }
export interface DrawingLine { points: Point[]; color: string; }

export default function ExerciseCanvas({ initialItems = [], onChange, readOnly = false }: ExerciseCanvasProps) {
  const [items, setItems] = useState<CanvasItem[]>(initialItems);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  // Estados para o Lápis
  const [mode, setMode] = useState<'move' | 'draw'>('move');
  const [drawColor, setDrawColor] = useState<string>('#ffffff'); 
  const [lines, setLines] = useState<DrawingLine[]>([]);
  const [currentLine, setCurrentLine] = useState<DrawingLine | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handlePointerDownBoard = (e: React.PointerEvent) => {
    if (readOnly) return;
    if (mode === 'draw' && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setCurrentLine({ points: [{x, y}], color: drawColor });
      if (e.target instanceof HTMLElement) e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerDownItem = (e: React.PointerEvent, id: string) => {
    if (readOnly || mode === 'draw') return;
    e.stopPropagation();
    if (e.target instanceof HTMLElement) e.target.setPointerCapture(e.pointerId);
    setDraggingId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!boardRef.current || readOnly) return;
    const rect = boardRef.current.getBoundingClientRect();
    let newX = ((e.clientX - rect.left) / rect.width) * 100;
    let newY = ((e.clientY - rect.top) / rect.height) * 100;
    
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    if (mode === 'draw' && currentLine) {
      setCurrentLine(prev => prev ? { ...prev, points: [...prev.points, {x: newX, y: newY}] } : null);
      return;
    }

    if (mode === 'move' && draggingId) {
      const newItems = items.map(item => item.id === draggingId ? { ...item, x: newX, y: newY } : item);
      setItems(newItems);
      if (onChange) onChange(newItems);
    }
  };

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

  const addItem = (type: CanvasItem['type']) => {
    if (readOnly) return;
    const newItem: CanvasItem = { id: Date.now().toString(), type, x: 50, y: 50 };
    const newItems = [...items, newItem];
    setItems(newItems);
    if (onChange) onChange(newItems);
    setMode('move');
  };

  const clearAll = () => {
    if (readOnly) return;
    if (window.confirm("Apagar tudo (ícones e desenhos)?")) {
      setItems([]);
      setLines([]);
      if (onChange) onChange([]);
    }
  };

  const renderPath = (line: DrawingLine) => {
    if (line.points.length < 2) return null;
    const d = `M ${line.points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    return <path d={d} stroke={line.color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))' }} />;
  };

  const renderItem = (item: CanvasItem) => {
    let content = '';
    switch (item.type) {
      case 'cone': content = '⛺'; break; 
      case 'ball': content = '⚽'; break;
      case 'goal': content = '🥅'; break;
      case 'player_home': content = '🔵'; break;
      case 'player_away': content = '🔴'; break;
      case 'barrier': content = '🚧'; break;
    }

    const interactiveClasses = readOnly || mode === 'draw' ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing';

    return (
      <div
        key={item.id}
        onPointerDown={(e) => handlePointerDownItem(e, item.id)}
        className={`absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 text-xl md:text-2xl drop-shadow-md select-none ${interactiveClasses} ${draggingId === item.id ? 'scale-125 z-50 shadow-2xl' : 'z-10'} transition-transform duration-75 touch-none`}
        style={{ left: `${item.x}%`, top: `${item.y}%` }}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full gap-3">
      {!readOnly && (
        <div className="flex flex-col gap-2">
          
          {/* Barra de Itens */}
          <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <button type="button" onClick={() => addItem('cone')} className="p-1 md:p-2 hover:bg-slate-100 rounded text-lg md:text-xl" title="Cone">⛺</button>
            <button type="button" onClick={() => addItem('ball')} className="p-1 md:p-2 hover:bg-slate-100 rounded text-lg md:text-xl" title="Bola">⚽</button>
            <button type="button" onClick={() => addItem('goal')} className="p-1 md:p-2 hover:bg-slate-100 rounded text-lg md:text-xl" title="Baliza">🥅</button>
            <button type="button" onClick={() => addItem('barrier')} className="p-1 md:p-2 hover:bg-slate-100 rounded text-lg md:text-xl" title="Barreira">🚧</button>
            <button type="button" onClick={() => addItem('player_home')} className="p-1 md:p-2 hover:bg-slate-100 rounded text-lg md:text-xl" title="Nossa Equipa">🔵</button>
            <button type="button" onClick={() => addItem('player_away')} className="p-1 md:p-2 hover:bg-slate-100 rounded text-lg md:text-xl" title="Adversário">🔴</button>
            <div className="flex-1"></div>
            <button type="button" onClick={clearAll} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">Limpar Tudo</button>
          </div>

          {/* Barra do Lápis */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 shadow-sm">
            <button type="button" onClick={() => setMode('move')} className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${mode === 'move' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}>👆 Mover</button>
            <button type="button" onClick={() => setMode('draw')} className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${mode === 'draw' ? 'bg-yellow-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}>✏️ Desenhar</button>
            
            {mode === 'draw' && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-300">
                <button type="button" onClick={() => setDrawColor('#ffffff')} className={`w-6 h-6 rounded-full bg-white border-2 ${drawColor === '#ffffff' ? 'border-slate-800 scale-110' : 'border-slate-300'}`}></button>
                <button type="button" onClick={() => setDrawColor('#fbbf24')} className={`w-6 h-6 rounded-full bg-yellow-400 border-2 ${drawColor === '#fbbf24' ? 'border-slate-800 scale-110' : 'border-white'}`}></button>
                <button type="button" onClick={() => setDrawColor('#ef4444')} className={`w-6 h-6 rounded-full bg-red-500 border-2 ${drawColor === '#ef4444' ? 'border-slate-800 scale-110' : 'border-white'}`}></button>
                <button type="button" onClick={() => setDrawColor('#3b82f6')} className={`w-6 h-6 rounded-full bg-blue-500 border-2 ${drawColor === '#3b82f6' ? 'border-slate-800 scale-110' : 'border-white'}`}></button>
                
                <button type="button" onClick={() => setLines([])} className="ml-2 px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-slate-200 rounded-md">Apagar Linhas</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Relvado */}
      <div 
        ref={boardRef}
        className={`relative w-full bg-green-700 border-4 border-green-800 rounded-xl overflow-hidden shadow-inner touch-none select-none ${mode === 'draw' && !readOnly ? 'cursor-crosshair' : ''}`}
        style={{ 
          aspectRatio: '1.5', 
          overscrollBehavior: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }}
        onPointerDown={handlePointerDownBoard}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {lines.map((line, index) => <g key={index}>{renderPath(line)}</g>)}
          {currentLine && renderPath(currentLine)}
        </svg>

        {items.map(renderItem)}
      </div>
    </div>
  );
}