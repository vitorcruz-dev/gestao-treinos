import React, { useState } from 'react';
import { TrainingPlan } from './types';

interface TrainingPlannerProps {
  plans: TrainingPlan[];
  onAddPlan: (plan: TrainingPlan) => void;
  onUpdatePlan: (plan: TrainingPlan) => void;
}

export default function TrainingPlannerModule({ plans, onAddPlan, onUpdatePlan }: TrainingPlannerProps) {
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [current, setCurrent] = useState<TrainingPlan | null>(null);

  const activeTeam = JSON.parse(localStorage.getItem('scoutpro_active_team') || '{}');

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const planData = {
      id: current?.id || Date.now().toString(),
      teamId: activeTeam.id,
      date: fd.get('date') as string,
      theme: fd.get('theme') as string,
      exercises: fd.get('exercises') as string,
      finalAppreciation: fd.get('finalAppreciation') as string,
    };

    if (current) {
      onUpdatePlan(planData);
    } else {
      onAddPlan(planData);
    }
    setView('list');
  };

  const openForm = (plan: TrainingPlan | null = null) => {
    setCurrent(plan);
    setView('form');
  };

  const openDetails = (plan: TrainingPlan) => {
    setCurrent(plan);
    setView('details');
  };

  // VISTA 1: LISTA DE TREINOS
  if (view === 'list') {
    return (
      <div className="p-2 md:p-6 max-w-5xl mx-auto relative">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className="bg-[#151c2c] p-5 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-colors shadow-sm flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-slate-800/80 px-3 py-1 rounded-md text-xs font-bold text-blue-400 uppercase tracking-widest border border-slate-700">
                    {new Date(plan.date).toLocaleDateString('pt-PT')}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 leading-snug">{plan.theme}</h3>
                
                <p className="text-sm text-slate-400 line-clamp-3 mb-6 flex-1">
                  {plan.exercises || 'Sem exercícios detalhados.'}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button onClick={() => openDetails(plan)} className="py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-700/50">
                    Ver e Imprimir
                  </button>
                  <button onClick={() => openForm(plan)} className="py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-medium border border-blue-500/20 transition-colors">
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // VISTA 2: DETALHES E IMPRESSÃO (Folha A4)
  if (view === 'details' && current) {
    return (
      <div className="p-2 md:p-6 max-w-4xl mx-auto">
        
        {/* CSS INJETADO APENAS PARA A IMPRESSÃO */}
        <style>
          {`
            @media print {
              @page { size: A4 portrait; margin: 15mm; }
              
              /* Esconde toda a plataforma exceto o container de impressão */
              body * { visibility: hidden; }
              .printable-a4, .printable-a4 * { visibility: visible; }
              
              /* Reinicia os layouts que estragam o A4 */
              html, body, #root, main { 
                background: white !important; 
                color: black !important; 
                height: auto !important; 
                overflow: visible !important;
                display: block !important;
              }
              
              /* Coloca o container no topo da folha */
              .printable-a4 {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: black !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
              }
              
              /* Força as cores da folha de treino para tons escuros de impressão */
              .print-text-black { color: #000 !important; }
              .print-text-gray { color: #444 !important; }
              .print-border-black { border-color: #000 !important; }
              .print-bg-gray { background-color: #f3f4f6 !important; }
              
              /* Previne cortes a meio dos exercícios */
              .avoid-page-break { page-break-inside: avoid; break-inside: avoid; }
              
              /* Esconde botões */
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
        
        {/* A FOLHA A4 */}
        <div className="printable-a4 bg-[#151c2c] rounded-2xl border border-slate-800/60 shadow-xl overflow-hidden min-h-[297mm]">
          
          {/* Cabeçalho */}
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

          {/* Corpo do Treino */}
          <div className="p-8 md:p-10 space-y-8">
            
            <div className="avoid-page-break">
              <h3 className="text-sm font-bold text-slate-200 print-text-black mb-4 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 print-bg-gray"></span>
                Descrição dos Exercícios
              </h3>
              <div className="bg-[#0f1523]/50 print-bg-gray p-6 rounded-xl border border-slate-800/60 print-border-black min-h-[150px]">
                <p className="text-sm text-slate-300 print-text-black whitespace-pre-wrap leading-relaxed">
                  {current.exercises || 'Nenhum detalhe inserido.'}
                </p>
              </div>
            </div>

            {current.finalAppreciation && (
              <div className="avoid-page-break">
                <h3 className="text-sm font-bold text-slate-200 print-text-black mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 print-bg-gray"></span>
                  Observações Finais
                </h3>
                <div className="bg-[#0f1523]/50 print-bg-gray p-6 rounded-xl border border-slate-800/60 print-border-black">
                  <p className="text-sm text-slate-300 print-text-black whitespace-pre-wrap leading-relaxed">
                    {current.finalAppreciation}
                  </p>
                </div>
              </div>
            )}

            {/* Espaço para desenho tático / notas manuais na impressão */}
            <div className="hidden print:block avoid-page-break mt-10">
               <h3 className="text-sm font-bold text-black mb-4 uppercase tracking-wider">Esquema Tático / Anotações Manuais</h3>
               <div className="border-2 border-dashed border-gray-400 h-64 rounded-xl w-full"></div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // VISTA 3: FORMULÁRIO (CRIAR / EDITAR)
  return (
    <div className="p-2 md:p-6 max-w-3xl mx-auto">
      <div className="bg-[#151c2c] p-6 md:p-8 rounded-2xl border border-slate-800/60 shadow-lg">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/60">
          <h2 className="text-xl font-semibold text-white">{current ? 'Editar Sessão' : 'Planear Nova Sessão'}</h2>
          <button onClick={() => setView('list')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancelar</button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Data do Treino *</label>
              <input required type="date" name="date" defaultValue={current?.date} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tema Principal *</label>
              <input required type="text" name="theme" defaultValue={current?.theme} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: Organização Defensiva e Transição Rápida" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Exercícios e Estrutura</label>
            <textarea name="exercises" defaultValue={current?.exercises} rows={8} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all custom-scrollbar leading-relaxed" placeholder="Descreva o aquecimento, parte principal e finalização..."></textarea>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Foco / Observações da Equipa Técnica</label>
            <textarea name="finalAppreciation" defaultValue={current?.finalAppreciation} rows={3} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all custom-scrollbar leading-relaxed" placeholder="Atletas em gestão de esforço, dinâmicas a avaliar..."></textarea>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg shadow-md transition-colors text-sm mt-2">
            {current ? 'Guardar Alterações' : 'Criar Sessão de Treino'}
          </button>
        </form>
      </div>
    </div>
  );
}