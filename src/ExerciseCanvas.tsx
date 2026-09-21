import React, { useState, useRef, useEffect } from 'react';
import { CanvasItem } from './types';

interface ExerciseCanvasProps {
  initialItems?: CanvasItem[];
  onChange?: (items: CanvasItem[]) => void;
  readOnly?: boolean;
}

export default function ExerciseCanvas({ initialItems = [], onChange, readOnly = false }: ExerciseCanvasProps) {
  const [items, setItems] = useState<CanvasItem[]>(initialItems);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Sincronizar caso os itens iniciais mudem (ex: ao editar um treino)
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // EVENTOS DE TOQUE E RATO (Mobile & Desktop)
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (readOnly) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !boardRef.current || readOnly) return;
    const rect = boardRef.current.getBoundingClientRect();
    
    let newX = ((e.clientX - rect.left) / rect.width) * 100;
    let newY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Limitar às bordas
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    const newItems = items.map(item => item.id === draggingId ? { ...item, x: newX, y: newY } : item);
    setItems(newItems);
    if (onChange) onChange(newItems);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingId(null);
    }
  };

  const addItem = (type: CanvasItem['type']) => {
    if (readOnly) return;
    const newItem: CanvasItem = { id: Date.now().toString(), type, x: 50, y: 50 };
    const newItems = [...items, newItem];
    setItems(newItems);
    if (onChange) onChange(newItems);
  };

  const clearAll = () => {
    if (readOnly) return;
    setItems([]);
    if (onChange) onChange([]);
  };

  const renderItem = (item: CanvasItem) => {
    let content = '';
    let className = 'absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 text-xl md:text-2xl drop-shadow-md select-none';
    
    switch (item.type) {
      case 'cone': content = '⛺'; break; 
      case 'ball': content = '⚽'; break;
      case 'goal': content = '🥅'; break;
      case 'player_home': content = '🔵'; break;
      case 'player_away': content = '🔴'; break;
      case 'barrier': content = '🚧'; break;
    }

    return (
      <div
        key={item.id}
        onPointerDown={(e) => handlePointerDown(e, item.id)}
        className={`${className} ${readOnly ? '' : 'cursor-grab active:cursor-grabbing'} ${draggingId === item.id ? 'scale-125 z-50 shadow-2xl' : 'z-10'} transition-transform duration-75`}
        style={{ left: `${item.x}%`, top: `${item.y}%`, touchAction: 'none' }}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-xl p-2 md:p-4">
      {!readOnly && (
        <div className="flex flex-wrap gap-2 mb-4 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <button type="button" onClick={() => addItem('cone')} className="p-2 hover:bg-slate-100 rounded text-xl transition-colors" title="Adicionar Cone">⛺</button>
          <button type="button" onClick={() => addItem('ball')} className="p-2 hover:bg-slate-100 rounded text-xl transition-colors" title="Adicionar Bola">⚽</button>
          <button type="button" onClick={() => addItem('goal')} className="p-2 hover:bg-slate-100 rounded text-xl transition-colors" title="Adicionar Baliza">🥅</button>
          <button type="button" onClick={() => addItem('barrier')} className="p-2 hover:bg-slate-100 rounded text-xl transition-colors" title="Adicionar Barreira">🚧</button>
          <button type="button" onClick={() => addItem('player_home')} className="p-2 hover:bg-slate-100 rounded text-xl transition-colors" title="Adicionar Jogador Nossa Equipa">🔵</button>
          <button type="button" onClick={() => addItem('player_away')} className="p-2 hover:bg-slate-100 rounded text-xl transition-colors" title="Adicionar Adversário">🔴</button>
          <div className="flex-1"></div>
          <button type="button" onClick={clearAll} className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 font-bold text-xs rounded hover:bg-red-100 transition-colors">Limpar Tudo</button>
        </div>
      )}
      
      <div 
        ref={boardRef}
        className="relative w-full bg-green-700 border-4 border-green-800 rounded-xl overflow-hidden shrink-0 shadow-inner"
        style={{ 
          aspectRatio: '1.5', 
          touchAction: 'none', 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
         {items.map(renderItem)}
      </div>
    </div>
  );
}