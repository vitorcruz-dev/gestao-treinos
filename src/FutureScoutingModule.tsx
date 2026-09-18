import React, { useState } from 'react';
import { FutureOpponentScouting } from './types';

interface FutureScoutingProps {
  reports: FutureOpponentScouting[];
  onAddReport: (report: FutureOpponentScouting) => void;
}

export default function FutureScoutingModule({ reports, onAddReport }: FutureScoutingProps) {
  const [view, setView] = useState<'form' | 'list' | 'report'>('form');
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [photoData, setPhotoData] = useState<string>('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoData(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newReport: FutureOpponentScouting = {
      id: Date.now().toString(),
      teamId: '', // <--- CAMPO ADICIONADO AQUI PARA RESOLVER O ERRO
      opponentName: formData.get('opponentName') as string,
      observationDate: formData.get('observationDate') as string,
      tacticalModel: formData.get('tacticalModel') as string,
      behaviorWinning: formData.get('behaviorWinning') as string,
      behaviorLosing: formData.get('behaviorLosing') as string,
      substitutionsImpact: formData.get('substitutionsImpact') as string,
      setPieces: formData.get('setPieces') as string,
      setPiecesPhotoUrl: photoData,
      strengths: formData.get('strengths') as string,
      weaknesses: formData.get('weaknesses') as string,
      strongPlayers: formData.get('strongPlayers') as string,
      weakPlayers: formData.get('weakPlayers') as string,
      observations: formData.get('observations') as string,
    };

    onAddReport(newReport);
    e.currentTarget.reset();
    setPhotoData('');
    alert('Relatório de Observação guardado com sucesso!');
    setView('list');
  };

  const handlePrint = () => window.print();
  const selectedReport = reports.find(r => r.id === selectedReportId);
  const uniqueOpponents = Array.from(new Set(reports.map(r => r.opponentName)));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-900 relative">
      <style>{`@media print { body * { visibility: hidden; } #future-report-pdf, #future-report-pdf * { visibility: visible; } #future-report-pdf { position: absolute; left: 0; top: 0; width: 100%; padding: 0; } .no-print { display: none !important; } .print-bg { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; } }`}</style>
      
      <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center gap-4 no-print bg-slate-50 rounded-t-2xl">
        <div><h2 className="text-2xl font-black text-slate-900">Observação de Adversários</h2></div>
        <div className="flex space-x-2 bg-slate-200 p-1 rounded-lg">
          <button onClick={() => setView('form')} className={`px-4 py-2 rounded-md font-bold text-sm ${view === 'form' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Novo Relatório</button>
          <button onClick={() => setView('list')} className={`px-4 py-2 rounded-md font-bold text-sm ${(view === 'list' || view === 'report') ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Histórico & PDF</button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {view === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-8 no-print">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-1">Equipa Adversária</label><input type="text" name="opponentName" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
              <div><label className="block text-sm font-bold mb-1">Data da Observação</label><input type="date" name="observationDate" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
            </div>

            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
              <h3 className="font-black text-blue-900 text-lg border-b border-blue-100 pb-2">1. Análise Tática e Comportamental</h3>
              <div><label className="block text-sm font-bold text-blue-900 mb-1">Modelo Tático</label><input type="text" name="tacticalModel" required className="w-full p-3 bg-white border border-blue-200 rounded-xl" /></div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-colors">Guardar Relatório do Observador</button>
          </form>
        )}

        {view === 'list' && (
          <div className="space-y-8 no-print">
            {uniqueOpponents.length === 0 ? <p className="text-slate-500 italic p-4 bg-slate-50 rounded-xl border">Nenhum relatório registado.</p> : uniqueOpponents.map(team => (
              <div key={team}>
                <h3 className="text-xl font-black text-slate-800 border-b-2 border-slate-200 pb-2 mb-4 uppercase">🛡️ {team}</h3>
                {reports.filter(r => r.opponentName === team).map(r => (
                  <div key={r.id} className="bg-white border border-slate-200 p-5 rounded-2xl mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-lg mb-2 inline-block">{r.observationDate}</span>
                    <button onClick={() => { setSelectedReportId(r.id); setView('report'); }} className="w-full bg-slate-800 text-white py-2 mt-4 rounded-xl font-bold hover:bg-slate-700">Ver PDF</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {view === 'report' && selectedReport && (
          <div>
            <div className="no-print mb-6 border-b pb-4 flex justify-between"><button onClick={() => setView('list')} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold">&larr; Voltar</button></div>
            <div id="future-report-pdf" className="bg-white">
              <h1 className="text-4xl font-black text-slate-900 uppercase">Análise de Adversário</h1>
              <h2 className="text-2xl font-bold text-blue-800 mt-2">{selectedReport.opponentName}</h2>
              <div className="mb-6 mt-6 print-bg bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p><strong className="text-blue-800">Modelo Tático Base:</strong> {selectedReport.tacticalModel}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}