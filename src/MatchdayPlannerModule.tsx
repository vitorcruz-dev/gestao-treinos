import React, { useState, useRef, useEffect } from 'react';
import { Player, MatchdayPlan, StartingPlayerPosition } from './types';
import { supabase } from './supabase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface MatchdayPlannerProps {
  players: Player[];
  plans: MatchdayPlan[];
  onAddPlan: (plan: MatchdayPlan) => void;
  onUpdatePlan: (plan: MatchdayPlan) => void;
}

// ==========================================
// COMPONENTE: CANVAS PARA AQUECIMENTO
// ==========================================
const WarmupCanvas = ({ defaultImage, onChange }: { defaultImage?: string; onChange: (img: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const initPitch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0f1523';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, w - 40, h - 40);
    ctx.beginPath();
    ctx.moveTo(w / 2, 20);
    ctx.lineTo(w / 2, h - 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 40, 0, Math.PI * 2);
    ctx.stroke();
  };

  useEffect(() => {
    if (defaultImage && defaultImage.startsWith('data:image')) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = defaultImage;
    } else {
      initPitch();
    }
  }, [defaultImage]);

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL('image/png'));
  };

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    if (tool === 'draw') {
      setIsDrawing(true);
      setLastPos(pos);
    } else {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;
      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icons: any = { cone: '🔺', red: '🔴', blue: '🔵', goal: '🥅' };
      ctx.fillText(icons[tool] || '', pos.x, pos.y);
      saveSnapshot();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== 'draw') return;
    const pos = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex gap-2 bg-[#090e17] p-2 rounded-lg border border-slate-700/80 overflow-x-auto custom-scrollbar">
        <button type="button" onClick={() => setTool('draw')} className={`whitespace-nowrap px-2.5 py-1 rounded text-xs font-bold ${tool === 'draw' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>✏️ Lápis</button>
        <button type="button" onClick={() => setTool('red')} className={`whitespace-nowrap px-2.5 py-1 rounded text-xs font-bold ${tool === 'red' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>🔴 Eq. Vermelha</button>
        <button type="button" onClick={() => setTool('blue')} className={`whitespace-nowrap px-2.5 py-1 rounded text-xs font-bold ${tool === 'blue' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>🔵 Eq. Azul</button>
        <button type="button" onClick={() => setTool('cone')} className={`whitespace-nowrap px-2.5 py-1 rounded text-xs font-bold ${tool === 'cone' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>🔺 Cone</button>
        <button type="button" onClick={() => { initPitch(); saveSnapshot(); }} className="ml-auto whitespace-nowrap px-2.5 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400">🗑️ Limpar</button>
      </div>
      <canvas ref={canvasRef} width={600} height={350} className="w-full h-auto bg-[#090e17] rounded-lg border border-slate-700 cursor-crosshair touch-none" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={() => { setIsDrawing(false); saveSnapshot(); }} />
    </div>
  );
};

// ==========================================
// MÓDULO PRINCIPAL
// ==========================================
export default function MatchdayPlannerModule({ players, plans, onAddPlan, onUpdatePlan }: MatchdayPlannerProps) {
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [current, setCurrent] = useState<any | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Estados Formulário
  const [startingEleven, setStartingEleven] = useState<StartingPlayerPosition[]>([]);
  const [warmupExercises, setWarmupExercises] = useState<any[]>([]);
  const [pressureType, setPressureType] = useState<'alta' | 'media' | 'baixa'>('media');

  // Variáveis para Drag-and-Drop do Campo
  const fieldRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const activeTeam = JSON.parse(localStorage.getItem('scoutpro_active_team') || '{}');

  const openForm = (plan: any | null = null) => {
    setCurrent(plan);
    setStartingEleven(plan?.startingEleven || []);
    setWarmupExercises(plan?.warmupExercises || []);
    setPressureType(plan?.pressureType || 'media');
    setView('form');
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const planData: MatchdayPlan = {
      id: current?.id || Date.now().toString(),
      teamId: activeTeam.id,
      date: fd.get('date') as string,
      opponent: fd.get('opponent') as string,
      gameObjectives: fd.get('gameObjectives') as string,
      pressureType: pressureType,
      pressureNotes: fd.get('pressureNotes') as string,
      offensiveCorners: fd.get('offensiveCorners') as string,
      defensiveCorners: fd.get('defensiveCorners') as string,
      warmupExercises: warmupExercises,
      startingEleven: startingEleven,
    };

    if (current) onUpdatePlan(planData);
    else onAddPlan(planData);
    setView('list');
  };

  const handleDeleteClick = async (id: string, opponent: string) => {
    if(!window.confirm(`Tem a certeza que deseja eliminar o plano contra ${opponent}?`)) return;
    try {
      const { error } = await supabase.from('matchday_plans').delete().eq('id', id);
      if (error) alert("Erro ao eliminar: " + error.message);
      else window.location.reload();
    } catch (err: any) {
      alert("Erro ao eliminar: " + err.message);
    }
  };

  // Funções de 11 Inicial e Drag-and-Drop
  const addPlayerToStartingEleven = (player: Player) => {
    if (startingEleven.some(p => p.playerId === player.id)) return;
    if (startingEleven.length >= 11) {
      alert("O 11 Inicial já está completo!");
      return;
    }

    const defaultCoords = [
      { x: 50, y: 88, pos: 'GR' },
      { x: 20, y: 70, pos: 'LE' }, { x: 40, y: 75, pos: 'DC' }, { x: 60, y: 75, pos: 'DC' }, { x: 80, y: 70, pos: 'LD' },
      { x: 35, y: 50, pos: 'MC' }, { x: 65, y: 50, pos: 'MC' }, { x: 50, y: 35, pos: 'MO' },
      { x: 20, y: 20, pos: 'EE' }, { x: 50, y: 15, pos: 'PL' }, { x: 80, y: 20, pos: 'ED' },
    ];

    const nextSpot = defaultCoords[startingEleven.length] || { x: 50, y: 50, pos: player.position };

    setStartingEleven([
      ...startingEleven,
      {
        playerId: player.id,
        playerName: player.name,
        photoUrl: player.photoUrl,
        positionName: nextSpot.pos,
        x: nextSpot.x,
        y: nextSpot.y,
      }
    ]);
  };

  const removePlayerFromEleven = (id: string) => {
    setStartingEleven(startingEleven.filter(p => p.playerId !== id));
  };

  const handleFieldPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingId || !fieldRef.current) return;
    
    // Calcula a posição exata em percentagem baseada no clique
    const rect = fieldRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    // Limita para não sair do quadro
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    setStartingEleven(prev => prev.map(p => p.playerId === draggingId ? { ...p, x, y } : p));
  };

  const handleFieldPointerUp = () => {
    if (draggingId) {
      setDraggingId(null);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('matchday-pdf');
    if (!element) return;
    try {
      setPdfLoading(true);
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      pdf.save(`Matchday_vs_${current?.opponent || 'Jogo'}.pdf`);
    } catch (err) {
      alert('Erro ao gerar PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  if (view === 'list') {
    return (
      <div className="p-2 md:p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-1">Dia do Jogo (Matchday)</h2>
            <p className="text-sm text-slate-400">Planeie a palestra, o 11 inicial, o aquecimento e as bolas paradas.</p>
          </div>
          <button onClick={() => openForm()} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg flex gap-2 items-center">
            <span>+</span> Novo Plano de Jogo
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="bg-[#0f1523] p-12 rounded-2xl border border-slate-800 text-center">
            <span className="text-4xl mb-4 block opacity-50">🏟️</span>
            <h3 className="text-white font-semibold text-lg">Nenhum plano de jogo criado</h3>
            <p className="text-sm text-slate-400 mt-2">Prepare a estratégia para a próxima jornada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map(p => (
              <div key={p.id} className="bg-[#151c2c] p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-slate-800 px-2.5 py-1 rounded border border-slate-700 mb-3 inline-block">
                    {new Date(p.date).toLocaleDateString('pt-PT')}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">vs {p.opponent}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.gameObjectives || 'Sem objetivos definidos.'}</p>
                </div>
                <div className="flex gap-2 mt-6">
                  <button onClick={() => { setCurrent(p); setView('details'); }} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700">Ver Ficha / PDF</button>
                  <button onClick={() => openForm(p)} className="flex-1 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-medium border border-blue-500/20">Editar</button>
                  <button onClick={() => handleDeleteClick(p.id, p.opponent)} className="w-10 flex items-center justify-center py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === 'form') {
    return (
      <div className="p-2 md:p-6 max-w-5xl mx-auto">
        <div className="bg-[#151c2c] p-6 md:p-8 rounded-2xl border border-slate-800 shadow-lg space-y-8">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <h2 className="text-xl font-semibold text-white">{current ? 'Editar Plano de Jogo' : 'Novo Plano de Jogo'}</h2>
            <button onClick={() => setView('list')} className="text-sm text-slate-400 hover:text-white">Cancelar</button>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-800/20 p-5 rounded-xl border border-slate-800">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Data do Jogo *</label>
                <input required type="date" name="date" defaultValue={current?.date} className="w-full bg-[#0f1523] border border-slate-700 rounded-lg p-2.5 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Adversário *</label>
                <input required type="text" name="opponent" defaultValue={current?.opponent} placeholder="Ex: SC Braga Sub-19" className="w-full bg-[#0f1523] border border-slate-700 rounded-lg p-2.5 text-sm text-white outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-blue-400 mb-2">🎯 Objetivos da Equipa para o Jogo</label>
              <textarea name="gameObjectives" defaultValue={current?.gameObjectives} rows={3} placeholder="1. Não sofrer golos nos primeiros 15 min..." className="w-full bg-[#0f1523] border border-slate-700 rounded-lg p-3 text-sm text-white outline-none custom-scrollbar" />
            </div>

            <div className="border-t border-slate-800 pt-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">👕 11 Inicial ({startingEleven.length}/11)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0f1523] p-4 rounded-xl border border-slate-800 h-96 overflow-y-auto custom-scrollbar">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-3">Clique para adicionar ao 11</span>
                  <div className="space-y-2">
                    {players.map(p => {
                      const isSelected = startingEleven.some(e => e.playerId === p.id);
                      return (
                        <button key={p.id} type="button" onClick={() => addPlayerToStartingEleven(p)} disabled={isSelected} className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${isSelected ? 'opacity-40 bg-slate-800/40 cursor-not-allowed' : 'bg-[#151c2c] hover:bg-slate-700/60'}`}>
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-xs text-white">
                            {p.photoUrl ? <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" /> : p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                            <span className="text-[10px] text-blue-400">{p.position}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CAMPO DE JOGO INTERATIVO COM DRAG AND DROP */}
                <div 
                  ref={fieldRef}
                  onPointerMove={handleFieldPointerMove}
                  onPointerUp={handleFieldPointerUp}
                  onPointerLeave={handleFieldPointerUp}
                  className="md:col-span-2 bg-[#0a111e] rounded-xl border-2 border-slate-800 h-96 relative overflow-hidden flex items-center justify-center touch-none"
                >
                  <div className="absolute inset-4 border border-white/20 rounded-lg pointer-events-none">
                    <div className="absolute top-1/2 left-0 right-0 border-t border-white/20"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/20 rounded-full"></div>
                  </div>

                  {startingEleven.map(p => (
                    <div 
                      key={p.playerId} 
                      style={{ top: `${p.y}%`, left: `${p.x}%` }} 
                      className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group touch-none ${draggingId === p.playerId ? 'cursor-grabbing z-50 scale-110' : 'cursor-grab z-10 hover:scale-105'} transition-transform duration-75`}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDraggingId(p.playerId);
                      }}
                    >
                      {/* Botão Remover (Sempre visível como "x") */}
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removePlayerFromEleven(p.playerId); }}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-md z-20 pointer-events-auto"
                        title="Remover Jogador"
                      >
                        ✕
                      </button>

                      <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white shadow-lg overflow-hidden flex items-center justify-center font-bold text-xs text-white pointer-events-none">
                        {p.photoUrl ? <img src={p.photoUrl} alt={p.playerName} className="w-full h-full object-cover" /> : p.playerName.charAt(0)}
                      </div>
                      <span className="text-[10px] font-bold text-white bg-slate-900/90 px-1.5 py-0.5 rounded mt-0.5 shadow pointer-events-none">{p.positionName} - {p.playerName.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">⚡ Estratégia de Pressão</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button type="button" onClick={() => setPressureType('alta')} className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${pressureType === 'alta' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-[#0f1523] border-slate-800 text-slate-400 hover:border-slate-600'}`}>🔴 Pressão Alta</button>
                <button type="button" onClick={() => setPressureType('media')} className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${pressureType === 'media' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-[#0f1523] border-slate-800 text-slate-400 hover:border-slate-600'}`}>🟡 Pressão Média</button>
                <button type="button" onClick={() => setPressureType('baixa')} className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${pressureType === 'baixa' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-[#0f1523] border-slate-800 text-slate-400 hover:border-slate-600'}`}>🟢 Pressão Baixa / Bloco</button>
              </div>
              <textarea name="pressureNotes" defaultValue={current?.pressureNotes} rows={3} placeholder="Exemplo Prático: Quando o central esquerdo deles receber de costas, o nosso extremo pressiona imediatamente..." className="w-full bg-[#0f1523] border border-slate-700 rounded-lg p-3 text-sm text-white outline-none custom-scrollbar" />
            </div>

            <div className="border-t border-slate-800 pt-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">🔥 Exercício de Aquecimento</h3>
              <WarmupCanvas defaultImage={warmupExercises[0]?.board_image} onChange={(img) => setWarmupExercises([{ board_image: img }])} />
            </div>

            <div className="border-t border-slate-800 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-blue-400 mb-2">🚩 Cantos Ofensivos</label>
                <textarea name="offensiveCorners" defaultValue={current?.offensiveCorners} rows={3} placeholder="Instruções para os cantos a favor..." className="w-full bg-[#0f1523] border border-slate-700 rounded-lg p-3 text-sm text-white outline-none custom-scrollbar" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-blue-400 mb-2">🛡️ Cantos Defensivos</label>
                <textarea name="defensiveCorners" defaultValue={current?.defensiveCorners} rows={3} placeholder="Instruções para a marcação nos cantos contra..." className="w-full bg-[#0f1523] border border-slate-700 rounded-lg p-3 text-sm text-white outline-none custom-scrollbar" />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 rounded-lg shadow-md transition-colors text-sm">
              Guardar Plano do Dia do Jogo
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'details' && current) {
    return (
      <div className="p-2 md:p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setView('list')} className="text-slate-400 text-sm hover:text-white">← Voltar</button>
          <button onClick={handleDownloadPDF} disabled={pdfLoading} className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-500 shadow-md">
            {pdfLoading ? 'A gerar...' : '📄 Descarregar PDF A4'}
          </button>
        </div>

        <div className="overflow-x-auto flex justify-center custom-scrollbar pb-8">
          <div id="matchday-pdf" className="bg-white shrink-0 shadow-2xl flex flex-col box-border p-10" style={{ width: '794px', height: '1123px' }}>
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase">Plano de Jogo</h1>
                <p className="text-sm font-bold text-slate-600">{activeTeam.club} • {activeTeam.year}</p>
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold text-slate-500 uppercase">Adversário</span>
                <span className="text-2xl font-black text-blue-600">vs {current.opponent}</span>
                <span className="block text-xs font-bold text-slate-800">{new Date(current.date).toLocaleDateString('pt-PT')}</span>
              </div>
            </div>

            {current.gameObjectives && (
              <div className="bg-slate-100 p-3.5 rounded-lg border border-slate-300 mb-5">
                <h3 className="text-xs font-black uppercase text-slate-900 mb-1">🎯 Objetivos do Jogo</h3>
                <p className="text-xs text-slate-800 whitespace-pre-wrap">{current.gameObjectives}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-5 mb-5 flex-1 min-h-0">
              <div className="bg-[#0a111e] rounded-xl p-3 border border-slate-800 relative flex flex-col justify-between">
                <h3 className="text-[10px] font-black uppercase text-white mb-2">👕 11 Inicial</h3>
                <div className="flex-1 relative border border-white/20 rounded">
                  {current.startingEleven?.map((p: any) => (
                    <div key={p.playerId} style={{ top: `${p.y}%`, left: `${p.x}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-blue-600 border border-white overflow-hidden flex items-center justify-center font-bold text-[9px] text-white">
                        {p.photoUrl ? <img src={p.photoUrl} alt="" className="w-full h-full object-cover" /> : p.playerName.charAt(0)}
                      </div>
                      <span className="text-[8px] font-bold text-white bg-slate-900 px-1 rounded mt-0.5">{p.playerName.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-300">
                  <h3 className="text-xs font-black uppercase text-slate-900 mb-1">⚡ Pressão: <span className="uppercase text-blue-600">{current.pressureType}</span></h3>
                  <p className="text-[11px] text-slate-700 whitespace-pre-wrap">{current.pressureNotes || 'Sem indicações específicas.'}</p>
                </div>

                {current.warmupExercises?.[0]?.board_image && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-300 flex-1 flex flex-col">
                    <h3 className="text-xs font-black uppercase text-slate-900 mb-1">🔥 Aquecimento</h3>
                    <div className="flex-1 flex justify-center items-center bg-[#0f1523] rounded p-1">
                      <img src={current.warmupExercises[0].board_image} alt="Aquecimento" className="max-h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-300 pt-4">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 mb-1">🚩 Cantos Ofensivos</h3>
                <p className="text-[11px] text-slate-700 whitespace-pre-wrap">{current.offensiveCorners || 'Sem indicações.'}</p>
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 mb-1">🛡 Cantos Defensivos</h3>
                <p className="text-[11px] text-slate-700 whitespace-pre-wrap">{current.defensiveCorners || 'Sem indicações.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}