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

  useEffect(() => {
    if (onChange) onChange(items);
  }, [items]);

  const addItem = (type: CanvasItem['type']) => {
    if (readOnly) return;
    setItems([...items, { id: Date.now().toString() + Math.random(), type, x: 50, y: 50 }]);
  };

  const removeItem = (id: string) => {
    if (readOnly) return;
    setItems(items.filter(i => i.id !== id));
  };

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
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));
    setItems(prev => prev.map(p => p.id === draggingId ? { ...p, x: newX, y: newY } : p));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingId(null);
    }
  };

  const renderItem = (item: CanvasItem) => {
    switch (item.type) {
      case 'blue': return <div className="w-4 h-4 bg-blue-600 rounded-full border border-white shadow-sm" />;
      case 'red': return <div className="w-4 h-4 bg-red-600 rounded-full border border-white shadow-sm" />;
      case 'yellow': return <div className="w-4 h-4 bg-yellow-400 rounded-full border border-white shadow-sm" />;
      case 'green': return <div className="w-4 h-4 bg-green-500 rounded-full border border-white shadow-sm" />;
      case 'cone': return <div className="text-sm">🔺</div>;
      case 'goal': return <div className="text-xl">🥅</div>;
      case 'barrier': return <div className="text-lg">🚧</div>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {!readOnly && (
        <div className="flex flex-wrap gap-2 bg-slate-100 p-2 rounded-lg border border-slate-200 no-print">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center">Adicionar:</span>
          <button type="button" onClick={() => addItem('blue')} className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow hover:scale-110 transition-transform"></button>
          <button type="button" onClick={() => addItem('red')} className="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow hover:scale-110 transition-transform"></button>
          <button type="button" onClick={() => addItem('yellow')} className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow hover:scale-110 transition-transform"></button>
          <button type="button" onClick={() => addItem('green')} className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow hover:scale-110 transition-transform"></button>
          <button type="button" onClick={() => addItem('cone')} className="px-2 bg-white rounded shadow text-sm hover:scale-110 transition-transform">🔺 Cone</button>
          <button type="button" onClick={() => addItem('goal')} className="px-2 bg-white rounded shadow text-sm hover:scale-110 transition-transform">🥅 Baliza</button>
          <button type="button" onClick={() => addItem('barrier')} className="px-2 bg-white rounded shadow text-sm hover:scale-110 transition-transform">🚧 Barreira</button>
          <span className="ml-auto text-[10px] text-slate-400 flex items-center italic">Duplo clique numa peça para apagar</span>
        </div>
      )}

      <div 
        ref={boardRef}
        className="relative w-full overflow-hidden rounded-lg shadow-inner bg-green-700 border-2 border-green-800"
        style={{ aspectRatio: '105 / 68', touchAction: 'none' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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

        {items.map(item => (
          <div
            key={item.id}
            onPointerDown={(e) => handlePointerDown(e, item.id)}
            onDoubleClick={() => removeItem(item.id)}
            className={`absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 select-none ${readOnly ? '' : 'cursor-grab active:cursor-grabbing'} ${draggingId === item.id ? 'z-50 scale-125' : 'z-10 transition-transform'}`}
            style={{ left: `${item.x}%`, top: `${item.y}%`, touchAction: 'none' }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}