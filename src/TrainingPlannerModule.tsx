import React, { useState } from 'react';
import { TrainingPlan } from './types';
import { supabase } from './supabase'; // Adicionado para permitir a eliminação

interface TrainingPlannerProps {
  plans: TrainingPlan[];
  onAddPlan: (plan: TrainingPlan) => void;
  onUpdatePlan: (plan: TrainingPlan) => void;
}

export default function TrainingPlannerModule({ plans, onAddPlan, onUpdatePlan }: TrainingPlannerProps) {
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [current, setCurrent] = useState<TrainingPlan | null>(null);
  
  const [exercises, setExercises] = useState<any[]>([]);

  // ESTADO DO MODAL PARA ELIMINAR TREINOS COM SEGURANÇA
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
      exercises: exercises
    };

    if (current) {
      onUpdatePlan(planData);
    } else {
      onAddPlan(planData);
    }
    setView('list');
  };

  // FUNÇÃO PARA ELIMINAR TREINO
  const handleDeleteClick = (id: string, theme: string) => {
    openConfirm(
      "Eliminar Sessão de Treino",
      `Tem a certeza que deseja eliminar o treino "${theme}"? O planeamento e todos os exercícios associados serão apagados.`,
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

  const openForm = (plan: TrainingPlan | null = null) => {
    setCurrent(plan);
    setExercises(Array.isArray(plan?.exercises) ? plan.exercises : []);
    setView('form');
  };

  const openDetails = (plan: TrainingPlan) => {
    setCurrent(plan);
    setView('details');
  };

  const addExercise = () => {
    setExercises([...exercises, { id: Date.now().toString(), title: '', duration: '', description: '' }]);
  };

  const updateExercise = (index: number, field: string, value: string) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

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
            <p className="text-sm text-slate-400 font-medium">Gira as sessões de treino, exercícios e objetivos.</p>
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
              // Contar apenas os exercícios que tenham algum conteúdo preenchido
              const planExercises = Array.isArray(plan.exercises) ? plan.exercises : [];
              const validCount = planExercises.filter(ex => ex.title?.trim() || ex.description?.trim()).length;

              return (
                <div key={plan.id} className="bg-[#151c2c] p-5 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-colors shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-800/80 px-3 py-1 rounded-md text-xs font-bold text-blue-400 uppercase tracking-widest border border-slate-700">
                      {new Date(plan.date).toLocaleDateString('pt-PT')}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 bg-slate-800/30 px-2 py-1 rounded">
                      {validCount} Exercícios
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-4 leading-snug flex-1">{plan.theme}</h3>

                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => openDetails(plan)} className="flex-1 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition-colors border border-slate-700/50">
                      Imprimir
                    </button>
                    <button onClick={() => openForm(plan)} className="flex-1 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-[11px] font-medium border border-blue-500/20 transition-colors">
                      Editar
                    </button>
                    <button onClick={() => handleDeleteClick(plan.id, plan.theme)} className="flex-1 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-[11px] font-medium border border-red-500/20 transition-colors">
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // VISTA 2: DETALHES E IMPRESSÃO (Folha A4 Perfeita)
  if (view === 'details' && current) {
    const currentExercises = Array.isArray(current.exercises) ? current.exercises : [];
    // FILTRO INTELIGENTE: Remove da impressão qualquer exercício que esteja completamente vazio
    const validExercises = currentExercises.filter(ex => (ex.title && ex.title.trim() !== '') || (ex.description && ex.description.trim() !== ''));

    return (
      <div className="p-2 md:p-6 max-w-4xl mx-auto">
        <style>
          {`
            @media print {
              @page { size: A4 portrait; margin: 15mm; }
              body * { visibility: hidden; }
              .printable-a4, .printable-a4 * { visibility: visible; }
              html, body, #root, main { background: white !important; color: black !important; height: auto !important; overflow: visible !important; display: block !important; }
              .printable-a4 { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
              .print-text-black { color: #000 !important; }
              .print-text-gray { color: #444 !important; }
              .print-border-black { border-color: #000 !important; }
              .print-bg-gray { background-color: #f3f4f6 !important; }
              .avoid-page-break { page-break-inside: avoid; break-inside: avoid; }
              .no-print { display: none !important; }
            }
          `}
        </style>

        <div className="flex justify-between items-center mb-6 no-print">
          <button onClick={() => setView('list')} className="text-slate-400 text-sm font-medium hover:text-white transition-colors">
            ← Voltar
          </button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-500 shadow-md transition-all flex gap-2 items-center">
            🖨️ Imprimir Folha A4
          </button>
        </div>
        
        <div className="printable-a4 bg-[#151c2c] rounded-2xl border border-slate-800/60 shadow-xl overflow-hidden min-h-[297mm]">
          <div className="p-8 md:p-10 border-b border-slate-800/60 print-border-black print-bg-gray">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white print-text-black uppercase tracking-tight">Ficha de Treino</h1>
                <p className="text-sm text-slate-400 print-text-gray font-medium mt-1">{activeTeam.club} • {activeTeam.year}</p>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-slate-500 print-text-gray uppercase tracking-widest font-bold mb-1">Data da Sessão</span>
                <span className="text-lg font-bold text-blue-400 print-text-black">{new Date(current.date).toLocaleDateString('pt-PT')}</span>
              </div>
            </div>
            
            <div className="bg-[#0f1523] print-bg-gray p-4 rounded-xl border border-slate-700/50 print-border-black">
              <span className="block text-[10px] text-slate-500 print-text-gray uppercase tracking-widest font-bold mb-1">Tema Principal</span>
              <h2 className="text-lg font-semibold text-slate-100 print-text-black">{current.theme}</h2>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-200 print-text-black mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/60 print-border-black pb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 print-bg-gray"></span>
                Estrutura e Exercícios
              </h3>
              
              {/* APRESENTA APENAS EXERCÍCIOS VÁLIDOS */}
              {validExercises.length === 0 ? (
                <p className="text-sm text-slate-400 print-text-gray italic">Nenhum exercício detalhado para esta sessão.</p>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {validExercises.map((ex: any, idx: number) => (
                    <div key={idx} className="avoid-page-break bg-[#0f1523]/50 print-bg-gray p-5 rounded-xl border border-slate-800/60 print-border-black">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-base font-bold text-white print-text-black">
                          {idx + 1}. {ex.title || ex.name || 'Exercício'}
                        </h4>
                        {ex.duration && (
                          <span className="text-xs font-bold text-slate-400 print-text-gray bg-slate-800/50 print-bg-gray px-2 py-1 rounded">
                            ⏳ {ex.duration} min
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 print-text-gray whitespace-pre-wrap leading-relaxed">
                        {ex.description || 'Sem descrição.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {current.finalAppreciation && (
              <div className="avoid-page-break mt-8">
                <h3 className="text-sm font-bold text-slate-200 print-text-black mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/60 print-border-black pb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 print-bg-gray"></span>
                  Observações Finais / Gestão
                </h3>
                <div className="bg-[#0f1523]/50 print-bg-gray p-5 rounded-xl border border-slate-800/60 print-border-black">
                  <p className="text-sm text-slate-300 print-text-black whitespace-pre-wrap leading-relaxed">
                    {current.finalAppreciation}
                  </p>
                </div>
              </div>
            )}

            <div className="hidden print:block avoid-page-break mt-12">
               <h3 className="text-sm font-bold text-black mb-4 uppercase tracking-wider">Esquema Tático / Notas Manuais</h3>
               <div className="border-2 border-dashed border-gray-400 h-64 rounded-xl w-full"></div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // VISTA 3: FORMULÁRIO COM CONSTRUTOR DE EXERCÍCIOS OPCIONAIS
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
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Data do Treino *</label>
              <input required type="date" name="date" defaultValue={current?.date} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tema Principal *</label>
              <input required type="text" name="theme" defaultValue={current?.theme} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: Organização Defensiva e Transição Rápida" />
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Construtor de Exercícios (Opcional)</label>
              <button type="button" onClick={addExercise} className="bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-[11px] font-bold border border-blue-500/20 transition-colors w-full sm:w-auto">
                + Adicionar Exercício
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="text-center p-6 bg-[#0f1523] border border-dashed border-slate-700/80 rounded-xl">
                <p className="text-sm text-slate-500">Nenhum exercício adicionado. Opcional.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {exercises.map((ex, index) => (
                  <div key={index} className="bg-[#0f1523] p-4 rounded-xl border border-slate-700/80 relative group">
                    <button type="button" onClick={() => removeExercise(index)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 text-sm font-bold transition-colors" title="Remover Exercício">✕</button>
                    
                    {/* TODOS OS CAMPOS DOS EXERCÍCIOS SÃO AGORA OPCIONAIS (sem required) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 pr-8">
                      <div className="md:col-span-3">
                        <input type="text" placeholder={`Exercício ${index + 1} (Ex: Posse de Bola 5x5)`} value={ex.title || ex.name || ''} onChange={(e) => updateExercise(index, 'title', e.target.value)} className="w-full bg-[#151c2c] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none font-semibold" />
                      </div>
                      <div className="md:col-span-1">
                        <input type="text" placeholder="Duração (min)" value={ex.duration || ''} onChange={(e) => updateExercise(index, 'duration', e.target.value)} className="w-full bg-[#151c2c] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none text-center" />
                      </div>
                    </div>
                    <textarea placeholder="Descrição do exercício, regras, dimensões do espaço..." value={ex.description || ''} onChange={(e) => updateExercise(index, 'description', e.target.value)} rows={3} className="w-full bg-[#151c2c] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none custom-scrollbar leading-relaxed"></textarea>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800/60 pt-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Foco / Observações da Equipa Técnica</label>
            <textarea name="finalAppreciation" defaultValue={current?.finalAppreciation} rows={3} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all custom-scrollbar leading-relaxed" placeholder="Atletas em gestão de esforço, dinâmicas a avaliar..."></textarea>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 rounded-lg shadow-md transition-colors text-sm mt-4">
            {current ? 'Guardar Alterações da Sessão' : 'Criar Sessão de Treino'}
          </button>
        </form>
      </div>
    </div>
  );
}