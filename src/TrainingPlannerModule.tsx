import React, { useState } from 'react';
import { TrainingPlan, CanvasItem } from './types';
import ExerciseCanvas from './ExerciseCanvas';

interface TrainingPlannerProps {
  plans: TrainingPlan[];
  onAddPlan: (plan: TrainingPlan) => void;
}

export default function TrainingPlannerModule({ plans, onAddPlan }: TrainingPlannerProps) {
  const [view, setView] = useState<'form' | 'list' | 'report'>('form');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [theme, setTheme] = useState('');
  
  // Estado para cada um dos 5 exercícios
  const [ex1, setEx1] = useState({ title: 'Aquecimento', duration: '', description: '', items: [] as CanvasItem[] });
  const [ex2, setEx2] = useState({ title: 'Exercício 2', duration: '', description: '', items: [] as CanvasItem[] });
  const [ex3, setEx3] = useState({ title: 'Exercício 3', duration: '', description: '', items: [] as CanvasItem[] });
  const [ex4, setEx4] = useState({ title: 'Exercício 4', duration: '', description: '', items: [] as CanvasItem[] });
  const [ex5, setEx5] = useState({ title: 'Retorno à Calma', duration: '', description: '', items: [] as CanvasItem[] });
  const [appreciation, setAppreciation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: TrainingPlan = {
      id: Date.now().toString(),
      teamId: '',
      date, theme,
      exercises: [
        { title: ex1.title, duration: Number(ex1.duration), description: ex1.description, canvasItems: ex1.items },
        { title: ex2.title, duration: Number(ex2.duration), description: ex2.description, canvasItems: ex2.items },
        { title: ex3.title, duration: Number(ex3.duration), description: ex3.description, canvasItems: ex3.items },
        { title: ex4.title, duration: Number(ex4.duration), description: ex4.description, canvasItems: ex4.items },
        { title: ex5.title, duration: Number(ex5.duration), description: ex5.description, canvasItems: ex5.items },
      ],
      finalAppreciation: appreciation
    };
    onAddPlan(newPlan);
    
    // Reset
    setDate(new Date().toISOString().split('T')[0]); setTheme(''); setAppreciation('');
    setEx1({ title: 'Aquecimento', duration: '', description: '', items: [] });
    setEx2({ title: 'Exercício 2', duration: '', description: '', items: [] });
    setEx3({ title: 'Exercício 3', duration: '', description: '', items: [] });
    setEx4({ title: 'Exercício 4', duration: '', description: '', items: [] });
    setEx5({ title: 'Retorno à Calma', duration: '', description: '', items: [] });
    
    alert('Plano de Treino guardado com sucesso!');
    setView('list');
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const renderExerciseForm = (ex: any, setEx: any, isFixed: boolean) => (
    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6 break-inside-avoid">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Fase do Treino</label>
          <input type="text" value={ex.title} onChange={e => setEx({...ex, title: e.target.value})} readOnly={isFixed} className={`w-full p-3 rounded-lg font-bold ${isFixed ? 'bg-slate-200 text-slate-600' : 'bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500'}`} />
        </div>
        <div className="w-full md:w-32">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Duração (Min)</label>
          <input type="number" required value={ex.duration} onChange={e => setEx({...ex, duration: e.target.value})} className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ex: 15" />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Descrição / Regras</label>
          <textarea required value={ex.description} onChange={e => setEx({...ex, description: e.target.value})} rows={10} className="w-full h-full min-h-[200px] p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Descreva o exercício, objetivos e regras..."></textarea>
        </div>
        <div className="w-full lg:w-2/3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Esquema Gráfico</label>
          <ExerciseCanvas initialItems={ex.items} onChange={items => setEx({...ex, items})} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-900 relative">
      <style>{`@media print { body * { visibility: hidden; } #plan-pdf, #plan-pdf * { visibility: visible; } #plan-pdf { position: absolute; left: 0; top: 0; width: 100%; padding: 0; } .no-print { display: none !important; } .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; } }`}</style>
      
      <div className="p-4 md:p-6 border-b border-slate-100 no-print flex justify-between items-center bg-slate-50 rounded-t-2xl">
        <div><h2 className="text-2xl font-black text-slate-900">Planeamento de Treino</h2></div>
        <div className="flex space-x-2 bg-slate-200 p-1 rounded-lg">
          <button onClick={() => setView('form')} className={`px-4 py-2 rounded-md font-bold text-sm ${view === 'form' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Criar Plano</button>
          <button onClick={() => setView('list')} className={`px-4 py-2 rounded-md font-bold text-sm ${(view === 'list' || view === 'report') ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Histórico & PDF</button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {view === 'form' && (
          <form onSubmit={handleSubmit} className="no-print">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div><label className="font-bold text-sm text-slate-700">Data do Treino</label><input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full mt-1 p-3 border border-slate-300 rounded-xl bg-slate-50" /></div>
              <div><label className="font-bold text-sm text-slate-700">Tema / Foco Principal</label><input type="text" required value={theme} onChange={e => setTheme(e.target.value)} placeholder="Ex: Transição Ofensiva" className="w-full mt-1 p-3 border border-slate-300 rounded-xl bg-slate-50" /></div>
            </div>

            {renderExerciseForm(ex1, setEx1, true)}
            {renderExerciseForm(ex2, setEx2, false)}
            {renderExerciseForm(ex3, setEx3, false)}
            {renderExerciseForm(ex4, setEx4, false)}
            {renderExerciseForm(ex5, setEx5, true)}

            <div className="bg-slate-800 p-5 rounded-xl border border-slate-900 mb-6 text-white">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Apreciação / Expectativa do Treino</label>
              <textarea required value={appreciation} onChange={e => setAppreciation(e.target.value)} rows={3} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none" placeholder="Considerações finais sobre o plano..."></textarea>
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-colors shadow-lg">Guardar Plano de Treino</button>
          </form>
        )}

        {view === 'list' && (
          <div className="space-y-4 no-print">
            {plans.length === 0 ? <p className="text-slate-500 italic">Nenhum plano criado.</p> : plans.map(p => (
              <div key={p.id} className="bg-white border border-slate-200 p-5 rounded-xl flex justify-between items-center shadow-sm">
                <div><span className="text-slate-400 text-sm font-bold block">{p.date}</span><strong className="text-lg text-slate-900">{p.theme}</strong></div>
                <button onClick={() => { setSelectedPlanId(p.id); setView('report'); }} className="bg-slate-800 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-slate-700">Ver & Imprimir</button>
              </div>
            ))}
          </div>
        )}

        {view === 'report' && selectedPlan && (
          <div>
            <div className="no-print mb-6 border-b border-slate-200 pb-4 flex justify-between">
              <button onClick={() => setView('list')} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold">&larr; Voltar</button>
              <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex gap-2">🖨️ Imprimir Plano</button>
            </div>
            
            <div id="plan-pdf" className="bg-white">
              <div className="border-b-2 border-slate-800 pb-4 mb-6">
                <h1 className="text-4xl font-black text-slate-900 uppercase">Plano de Treino</h1>
                <div className="flex justify-between items-end mt-2">
                  <p className="text-xl font-bold text-slate-700">Tema: <span className="text-blue-700">{selectedPlan.theme}</span></p>
                  <p className="text-slate-500 font-bold">Data: {selectedPlan.date}</p>
                </div>
              </div>

              <div className="space-y-8">
                {selectedPlan.exercises.map((ex, i) => (
                  <div key={i} className="break-inside-avoid border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-800 text-white p-3 flex justify-between items-center">
                      <h3 className="font-black uppercase tracking-wider">{ex.title}</h3>
                      <span className="font-bold bg-slate-600 px-3 py-1 rounded-lg text-sm">{ex.duration} Min</span>
                    </div>
                    <div className="flex flex-col md:flex-row p-4 gap-6 bg-slate-50">
                      <div className="flex-1 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-medium">
                        {ex.description}
                      </div>
                      <div className="w-full md:w-1/2 shrink-0">
                        <ExerciseCanvas initialItems={ex.canvasItems} readOnly={true} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl break-inside-avoid">
                <h3 className="font-black text-blue-900 uppercase mb-2">Apreciação Final / Notas</h3>
                <p className="text-sm text-slate-700 italic">{selectedPlan.finalAppreciation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}