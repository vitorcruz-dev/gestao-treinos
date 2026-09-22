import React, { useState, useRef, useEffect } from 'react';
import { TrainingPlan } from './types';
import { supabase } from './supabase';

interface TrainingPlannerProps {
  plans: TrainingPlan[];
  onAddPlan: (plan: TrainingPlan) => void;
  onUpdatePlan: (plan: TrainingPlan) => void;
}

// ==========================================
// COMPONENTE: QUADRO TÁTICO INTERATIVO
// ==========================================
const TacticalCanvas = ({ defaultImage, onChange }: { defaultImage?: string, onChange: (img: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<string[]>([]);

  const initPitch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    // Fundo do Campo
    ctx.fillStyle = '#0f1523';
    ctx.fillRect(0, 0, w, h);

    // Linhas do Campo
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, w - 60, h - 60);
    ctx.beginPath();
    ctx.moveTo(w / 2, 30);
    ctx.lineTo(w / 2, h - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
    
    // Pequenas áreas
    ctx.strokeRect(30, h / 2 - 80, 100, 160);
    ctx.strokeRect(w - 130, h / 2 - 80, 100, 160);
  };

  const loadSnapshot = (dataUrl: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  };

  useEffect(() => {
    if (defaultImage && defaultImage.startsWith('data:image')) {
      loadSnapshot(defaultImage);
      setHistory([defaultImage]);
    } else {
      initPitch();
      saveSnapshot();
    }
    // eslint-disable-next-line
  }, []);

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setHistory(prev => [...prev, dataUrl]);
    onChange(dataUrl);
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previous = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      loadSnapshot(previous);
      onChange(previous);
    } else if (history.length === 1) {
      initPitch();
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        setHistory([dataUrl]);
        onChange(dataUrl);
      }
    }
  };

  const handleClear = () => {
    initPitch();
    saveSnapshot();
  };

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
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
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const icons: any = {
        'cone': '🔺', 'goal': '🥅', 't1': '🔴', 't2': '🔵', 
        't3': '🟡', 't4': '⚫', 'barrier': '🚧', 'ladder': '🪜'
      };
      
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

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSnapshot();
    }
  };

  const toolsList = [
    { id: 'draw', label: '✏️ Linha' },
    { id: 'cone', label: '🔺 Cone' },
    { id: 'goal', label: '🥅 Baliza' },
    { id: 'barrier', label: '🚧 Barreira' },
    { id: 'ladder', label: '🪜 Escada' },
    { id: 't1', label: '🔴 Eq. 1' },
    { id: 't2', label: '🔵 Eq. 2' },
    { id: 't3', label: '🟡 Eq. 3' },
    { id: 't4', label: '⚫ Eq. 4' },
  ];

  return (
    <div className="w-full flex flex-col gap-3 mt-2">
      <div className="flex flex-wrap gap-2 bg-[#090e17] p-3 rounded-xl border border-slate-700/80">
        {toolsList.map((t: any) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTool(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tool === t.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
        <div className="flex-1"></div>
        <button type="button" onClick={handleUndo} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700">↩️ Desfazer</button>
        <button type="button" onClick={handleClear} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white">🗑️ Limpar</button>
      </div>

      <div className="w-full bg-[#090e17] rounded-xl border-2 border-slate-700/80 overflow-hidden relative" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-auto cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ touchAction: 'none' }} 
        />
      </div>
    </div>
  );
};

// ==========================================
// MÓDULO PRINCIPAL
// ==========================================
export default function TrainingPlannerModule({ plans, onAddPlan, onUpdatePlan }: TrainingPlannerProps) {
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [current, setCurrent] = useState<any | null>(null); 
  
  const [exercises, setExercises] = useState<any[]>([]);

  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
    type: 'alert' | 'confirm';
  }>({ show: false, title: '', message: '', onConfirm: null, type: 'alert' });

  const activeTeam = JSON.parse(localStorage.getItem('scoutpro_active_team') || '{}');

  const openAlert = (title: string, message: string) => setModal({ show: true, title, message, onConfirm: null, type: 'alert' });
  const openConfirm = (title: string, message: string, onConfirm: () => void) => setModal({ show: true, title, message, onConfirm, type: 'confirm' });
  const closeModal = () => setModal(prev => ({ ...prev, show: false }));

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const planData: any = {
      id: current?.id || Date.now().toString(),
      teamId: activeTeam.id,
      date: fd.get('date') as string,
      theme: fd.get('theme') as string,
      finalAppreciation: fd.get('finalAppreciation') as string,
      exercises: exercises, 
    };

    if (current) onUpdatePlan(planData);
    else onAddPlan(planData);
    setView('list');
  };

  const handleDeleteClick = (id: string, theme: string) => {
    openConfirm(
      "Eliminar Sessão de Treino",
      `Tem a certeza que deseja eliminar o treino "${theme}"? O planeamento e exercícios associados serão apagados.`,
      async () => {
        try {
          const { error } = await supabase.from('training_plans').delete().eq('id', id);
          if (error) throw error;
          window.location.reload();
        } catch (err: any) {
          openAlert("Erro", `Erro ao eliminar treino: ${err.message}`);
        }
      }
    );
  };

  const openForm = (plan: any | null = null) => {
    setCurrent(plan);
    setExercises(Array.isArray(plan?.exercises) ? plan.exercises : []);
    setView('form');
  };

  const openDetails = (plan: any) => {
    setCurrent(plan);
    setView('details');
  };

  const addExercise = () => setExercises([...exercises, { id: Date.now().toString(), title: '', duration: '', description: '', board_image: '' }]);
  const updateExercise = (index: number, field: string, value: string) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };
  const removeExercise = (index: number) => setExercises(exercises.filter((_, i) => i !== index));

  const renderModal = () => {
    if (!modal.show) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1121]/80 backdrop-blur-sm p-4">
        <div className="bg-[#151c2c] border border-slate-700/50 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
          <h3 className="text-lg font-bold text-white mb-2">{modal.title}</h3>
          <p className="text-sm font-medium text-slate-400 mb-8">{modal.message}</p>
          <div className="flex gap-3 justify-end">
            {modal.type === 'confirm' && (
              <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">Cancelar</button>
            )}
            <button 
              onClick={() => { if (modal.onConfirm) modal.onConfirm(); else closeModal(); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${modal.type === 'confirm' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
              {modal.type === 'confirm' ? 'Eliminar' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (view === 'list') {
    return (
      <div className="p-2 md:p-6 max-w-5xl mx-auto relative">
        {renderModal()}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800/60 pb-6">
          <div className="text-left">
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-1">Planear Treino</h2>
            <p className="text-sm text-slate-400 font-medium">Gira as sessões, desenhe as dinâmicas e defina objetivos.</p>
          </div>
          <button onClick={() => openForm()} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all flex gap-2 items-center w-full md:w-auto justify-center">
            <span>+</span> Nova Sessão
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="bg-[#0f1523] p-12 rounded-2xl border border-slate-800/60 text-center">
            <span className="text-4xl mb-4 block opacity-50">📝</span>
            <h3 className="text-white font-semibold text-lg">Nenhum treino planeado</h3>
            <p className="text-sm text-slate-400 mt-2">Crie a sua primeira sessão de treino.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map(plan => {
              const planExercises = Array.isArray(plan.exercises) ? plan.exercises : [];
              const validCount = planExercises.filter((ex: any) => ex.title?.trim() || ex.description?.trim()).length;
              const hasDrawing = planExercises.some((ex: any) => !!ex.board_image);
              const firstDrawing = planExercises.find((ex: any) => !!ex.board_image)?.board_image;

              return (
                <div key={plan.id} className="bg-[#151c2c] p-5 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-colors shadow-sm flex flex-col h-full relative overflow-hidden">
                  
                  {firstDrawing && (
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-10 pointer-events-none">
                      <img src={firstDrawing} alt="Tática" className="w-full h-full object-cover rounded-bl-full" />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="bg-slate-800/80 px-3 py-1 rounded-md text-xs font-bold text-blue-400 uppercase tracking-widest border border-slate-700">
                      {new Date(plan.date).toLocaleDateString('pt-PT')}
                    </div>
                    <div className="flex gap-1">
                      {hasDrawing && <span className="text-[10px] font-bold text-slate-300 bg-blue-500/20 px-2 py-1 rounded">📋 Quadro</span>}
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-800/30 px-2 py-1 rounded">{validCount} Exer.</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-4 leading-snug flex-1 relative z-10">{plan.theme}</h3>

                  <div className="flex gap-2 mt-auto relative z-10">
                    <button onClick={() => openDetails(plan)} className="flex-1 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition-colors border border-slate-700/50">Imprimir</button>
                    <button onClick={() => openForm(plan)} className="flex-1 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-[11px] font-medium border border-blue-500/20 transition-colors">Editar</button>
                    <button onClick={() => handleDeleteClick(plan.id, plan.theme)} className="flex-1 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-[11px] font-medium border border-red-500/20 transition-colors">Eliminar</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // VISTA 2: DETALHES E IMPRESSÃO (A4 COMPACTO EM 1 PÁGINA)
  if (view === 'details' && current) {
    const currentExercises = Array.isArray(current.exercises) ? current.exercises : [];
    const validExercises = currentExercises.filter((ex: any) => (ex.title && ex.title.trim() !== '') || (ex.description && ex.description.trim() !== ''));

    return (
      <div className="p-2 md:p-6 max-w-4xl mx-auto">
        <style>
          {`
            @media print {
              @page { size: A4 portrait; margin: 6mm; }
              body * { visibility: hidden; }
              .printable-a4, .printable-a4 * { visibility: visible; }
              html, body, #root, main { background: white !important; color: black !important; height: auto !important; overflow: visible !important; display: block !important; }
              .printable-a4 { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
              .print-text-black { color: #000 !important; }
              .print-text-gray { color: #444 !important; }
              .print-border-black { border-color: #000 !important; }
              .print-bg-gray { background-color: #f3f4f6 !important; }
              .no-print { display: none !important; }
              
              /* ESTILOS DE AJUSTE A 1 PÁGINA */
              .print-header { padding: 12px 16px !important; margin-bottom: 12px !important; }
              .print-exercises-grid { 
                display: grid !important; 
                grid-template-columns: ${validExercises.length > 1 ? '1fr 1fr' : '1fr'} !important; 
                gap: 10px !important; 
              }
              .print-exercise-card { padding: 8px 12px !important; margin-bottom: 0 !important; }
              .print-canvas-img { max-height: 140px !important; width: auto !important; margin: 4px auto 0 auto !important; }
              .print-notes-card { padding: 8px 12px !important; margin-top: 8px !important; }
            }
          `}
        </style>

        <div className="flex justify-between items-center mb-6 no-print">
          <button onClick={() => setView('list')} className="text-slate-400 text-sm font-medium hover:text-white transition-colors">← Voltar</button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-500 shadow-md transition-all flex gap-2 items-center">🖨️ Imprimir Folha A4</button>
        </div>
        
        <div className="printable-a4 bg-[#151c2c] rounded-2xl border border-slate-800/60 shadow-xl overflow-hidden min-h-[297mm]">
          <div className="p-8 border-b border-slate-800/60 print-border-black print-bg-gray print-header">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white print-text-black uppercase tracking-tight">Ficha de Treino</h1>
                <p className="text-sm text-slate-400 print-text-gray font-medium mt-1">{activeTeam.club} • {activeTeam.year}</p>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-slate-500 print-text-gray uppercase tracking-widest font-bold mb-1">Data da Sessão</span>
                <span className="text-lg font-bold text-blue-400 print-text-black">{new Date(current.date).toLocaleDateString('pt-PT')}</span>
              </div>
            </div>
            
            <div className="bg-[#0f1523] print-bg-gray p-3 rounded-xl border border-slate-700/50 print-border-black">
              <span className="block text-[10px] text-slate-500 print-text-gray uppercase tracking-widest font-bold mb-0.5">Tema Principal</span>
              <h2 className="text-base font-semibold text-slate-100 print-text-black">{current.theme}</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            
            {validExercises.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-200 print-text-black mb-2 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/60 print-border-black pb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 print-bg-gray"></span>
                  Estrutura e Exercícios
                </h3>
                
                {/* GRELHA ADAPTÁVEL PARA A4 */}
                <div className="print-exercises-grid grid grid-cols-1 gap-4">
                  {validExercises.map((ex: any, idx: number) => (
                    <div key={idx} className="print-exercise-card bg-[#0f1523]/50 print-bg-gray p-4 rounded-xl border border-slate-800/60 print-border-black">
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="text-sm font-bold text-white print-text-black">{idx + 1}. {ex.title || ex.name || 'Exercício'}</h4>
                        {ex.duration && <span className="text-[10px] font-bold text-slate-400 print-text-gray bg-slate-800/50 print-bg-gray px-2 py-0.5 rounded">⏳ {ex.duration} min</span>}
                      </div>
                      
                      {ex.description && (
                        <p className="text-xs text-slate-300 print-text-gray whitespace-pre-wrap leading-relaxed mb-2">{ex.description}</p>
                      )}
                      
                      {(ex as any).board_image && (
                        <div className="w-full flex justify-center bg-[#090e17] rounded-lg overflow-hidden border border-slate-700/50 print-border-black mt-1">
                          <img src={(ex as any).board_image} alt={`Tática ${idx + 1}`} className="print-canvas-img max-h-[180px] w-full object-contain" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {current.finalAppreciation && (
              <div className="print-notes-card mt-4">
                <h3 className="text-xs font-bold text-slate-200 print-text-black mb-2 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/60 print-border-black pb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 print-bg-gray"></span>
                  Observações Finais
                </h3>
                <div className="bg-[#0f1523]/50 print-bg-gray p-3 rounded-xl border border-slate-800/60 print-border-black">
                  <p className="text-xs text-slate-300 print-text-black whitespace-pre-wrap leading-relaxed">{current.finalAppreciation}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // VISTA 3: FORMULÁRIO COM CONSTRUTOR
  return (
    <div className="p-2 md:p-6 max-w-4xl mx-auto">
      <div className="bg-[#151c2c] p-6 md:p-8 rounded-2xl border border-slate-800/60 shadow-lg">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/60">
          <h2 className="text-xl font-semibold text-white">{current ? 'Editar Sessão' : 'Planear Nova Sessão'}</h2>
          <button onClick={() => setView('list')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancelar</button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-800/20 p-5 rounded-xl border border-slate-800/60">
            <div className="md:col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Data *</label>
              <input required type="date" name="date" defaultValue={current?.date} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tema *</label>
              <input required type="text" name="theme" defaultValue={current?.theme} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: Transição Defensiva" />
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Construtor de Exercícios (Opcional)</label>
              <button type="button" onClick={addExercise} className="bg-blue-600 text-white hover:bg-blue-500 px-4 py-2 rounded-lg text-xs font-bold transition-colors w-full sm:w-auto shadow-md">
                + Adicionar Exercício
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="text-center p-6 bg-[#0f1523] border border-dashed border-slate-700/80 rounded-xl">
                <p className="text-sm text-slate-500">Nenhum exercício adicionado. Clique no botão acima para adicionar um.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {exercises.map((ex: any, index: number) => (
                  <div key={ex.id || index} className="bg-[#0f1523] p-5 rounded-xl border border-slate-700/80 relative group shadow-sm">
                    <button type="button" onClick={() => removeExercise(index)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 text-sm font-bold transition-colors bg-slate-800 hover:bg-red-500/10 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pr-10">
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Título do Exercício</label>
                        <input type="text" placeholder={`Ex: Posse de Bola 5x5`} value={ex.title || ex.name || ''} onChange={(e) => updateExercise(index, 'title', e.target.value)} className="w-full bg-[#151c2c] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none font-semibold" />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Duração</label>
                        <input type="text" placeholder="min" value={ex.duration || ''} onChange={(e) => updateExercise(index, 'duration', e.target.value)} className="w-full bg-[#151c2c] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none text-center" />
                      </div>
                    </div>
                    
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Descrição e Regras</label>
                    <textarea placeholder="Explique as dinâmicas do exercício..." value={ex.description || ''} onChange={(e) => updateExercise(index, 'description', e.target.value)} rows={3} className="w-full bg-[#151c2c] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none custom-scrollbar leading-relaxed"></textarea>
                    
                    <div className="mt-5 border-t border-slate-800/60 pt-4">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Esquema Tático (Exercício {index + 1})</label>
                      <TacticalCanvas key={ex.id} defaultImage={ex.board_image} onChange={(img) => updateExercise(index, 'board_image', img)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800/60 pt-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Foco / Observações da Equipa</label>
            <textarea name="finalAppreciation" defaultValue={current?.finalAppreciation} rows={3} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all custom-scrollbar leading-relaxed"></textarea>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 rounded-lg shadow-md transition-colors text-sm mt-4">
            {current ? 'Guardar Alterações' : 'Criar Sessão'}
          </button>
        </form>
      </div>
    </div>
  );
}