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

  // Agrupar relatórios por equipa para visualização no histórico
  const uniqueOpponents = Array.from(new Set(reports.map(r => r.opponentName)));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-900 relative">
      
      {/* Estilos de Impressão */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #future-report-pdf, #future-report-pdf * { visibility: visible; }
            #future-report-pdf { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
            .no-print { display: none !important; }
            .print-bg { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
          }
        `}
      </style>

      {/* Navegação de Topo */}
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print bg-slate-50 rounded-t-2xl">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Observação de Adversários</h2>
          <p className="text-sm text-slate-500">Relatórios de scouting para preparação de jogos futuros.</p>
        </div>
        <div className="flex space-x-2 bg-slate-200 p-1 rounded-lg">
          <button onClick={() => setView('form')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${view === 'form' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>Novo Relatório</button>
          <button onClick={() => setView('list')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${(view === 'list' || view === 'report') ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>Histórico & PDF</button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        
        {/* VIEW 1: FORMULÁRIO DE PREENCHIMENTO */}
        {view === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-8 no-print">
            
            {/* Dados Base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-1">Equipa Adversária</label><input type="text" name="opponentName" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ex: FC Porto B" /></div>
              <div><label className="block text-sm font-bold mb-1">Data da Observação</label><input type="date" name="observationDate" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
            </div>

            {/* Análise Tática */}
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
              <h3 className="font-black text-blue-900 text-lg border-b border-blue-100 pb-2">1. Análise Tática e Comportamental</h3>
              <div><label className="block text-sm font-bold text-blue-900 mb-1">Modelo Tático (Ofensivo e Defensivo)</label><input type="text" name="tacticalModel" required className="w-full p-3 bg-white border border-blue-200 rounded-xl" placeholder="Ex: Atacam em 4-3-3, defendem em 4-4-2..." /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-blue-900 mb-1">Comportamento a Ganhar</label><textarea name="behaviorWinning" rows={2} className="w-full p-3 bg-white border border-blue-200 rounded-xl"></textarea></div>
                <div><label className="block text-sm font-bold text-blue-900 mb-1">Comportamento a Perder</label><textarea name="behaviorLosing" rows={2} className="w-full p-3 bg-white border border-blue-200 rounded-xl"></textarea></div>
              </div>
              <div><label className="block text-sm font-bold text-blue-900 mb-1">Impacto das Substituições</label><textarea name="substitutionsImpact" rows={2} className="w-full p-3 bg-white border border-blue-200 rounded-xl"></textarea></div>
            </div>

            {/* Bolas Paradas com Foto */}
            <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 space-y-4">
              <h3 className="font-black text-orange-900 text-lg border-b border-orange-100 pb-2">2. Bolas Paradas (Cantos e Livres)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2"><label className="block text-sm font-bold text-orange-900 mb-1">Descrição das Rotinas</label><textarea name="setPieces" rows={6} className="w-full p-3 bg-white border border-orange-200 rounded-xl"></textarea></div>
                <div className="flex flex-col">
                  <label className="block text-sm font-bold text-orange-900 mb-1">Foto / Esquema Tático</label>
                  <div className="flex-1 border-2 border-dashed border-orange-300 rounded-xl bg-white flex flex-col items-center justify-center p-2 relative overflow-hidden min-h-[150px]">
                    {photoData ? <img src={photoData} alt="Bola Parada" className="absolute inset-0 w-full h-full object-cover" /> : <div className="text-center p-4"><span className="text-3xl mb-2 block">📸</span><span className="text-xs text-slate-400">Anexar foto</span></div>}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                  {photoData && <button type="button" onClick={() => setPhotoData('')} className="mt-2 text-xs text-red-500 font-bold hover:underline">Remover Foto</button>}
                </div>
              </div>
            </div>

            {/* Análise de Jogadores */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-black text-slate-900 text-lg border-b border-slate-200 pb-2">3. Pontos Fortes, Fracos e Destaques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-green-700 mb-1">Pontos Fortes (Coletivo)</label><textarea name="strengths" rows={3} className="w-full p-3 bg-white border border-green-200 rounded-xl"></textarea></div>
                <div><label className="block text-sm font-bold text-red-700 mb-1">Pontos Fracos (Coletivo)</label><textarea name="weaknesses" rows={3} className="w-full p-3 bg-white border border-red-200 rounded-xl"></textarea></div>
                <div><label className="block text-sm font-bold mb-1">Jogadores Mais Fortes (+)</label><textarea name="strongPlayers" rows={3} className="w-full p-3 bg-white border border-slate-200 rounded-xl"></textarea></div>
                <div><label className="block text-sm font-bold mb-1">Jogadores Mais Fracos (-)</label><textarea name="weakPlayers" rows={3} className="w-full p-3 bg-white border border-slate-200 rounded-xl"></textarea></div>
              </div>
              <div><label className="block text-sm font-bold mb-1">Observações Finais</label><textarea name="observations" rows={2} className="w-full p-3 bg-white border border-slate-200 rounded-xl"></textarea></div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 shadow-lg transition-colors">
              Guardar Relatório
            </button>
          </form>
        )}

        {/* VIEW 2: HISTÓRICO DE OBSERVAÇÕES (PASTA POR EQUIPA) */}
        {view === 'list' && (
          <div className="no-print space-y-8">
            {uniqueOpponents.length === 0 ? (
               <p className="text-slate-500 italic p-4 bg-slate-50 rounded-xl border">Nenhum relatório de scouting registado.</p>
            ) : (
              uniqueOpponents.map(team => (
                <div key={team} className="mb-8">
                  <h3 className="text-xl font-black text-slate-800 border-b-2 border-slate-200 pb-2 mb-4 uppercase flex items-center gap-2">
                    🛡️ {team}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reports.filter(r => r.opponentName === team).map(r => (
                      <div key={r.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-lg mb-3 inline-block">Data: {r.observationDate}</span>
                          <p className="text-sm font-bold text-slate-600 mb-4">Sistema Tático: <span className="text-slate-900">{r.tacticalModel}</span></p>
                        </div>
                        <button 
                          onClick={() => { setSelectedReportId(r.id); setView('report'); }}
                          className="w-full bg-slate-800 text-white py-2 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors"
                        >
                          Ver Relatório & Gerar PDF
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* VIEW 3: RELATÓRIO PARA PDF */}
        {view === 'report' && selectedReport && (
          <div>
            <div className="no-print mb-6 border-b pb-4 flex flex-wrap gap-2 justify-between items-center">
              <button onClick={() => setView('list')} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-300 transition-colors">&larr; Voltar à Pasta</button>
              <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                🖨️ Gerar PDF
              </button>
            </div>

            <div id="future-report-pdf" className="bg-white">
              
              {/* CABEÇALHO DO PDF */}
              <div className="mb-6 border-b-2 border-slate-800 pb-4">
                <p className="text-slate-500 uppercase tracking-widest font-bold text-xs mb-1">ScoutPro - Departamento de Scouting</p>
                <h1 className="text-4xl font-black text-slate-900 uppercase">Análise de Adversário</h1>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-800">{selectedReport.opponentName}</h2>
                    <p className="text-slate-600 font-medium mt-1">Data da Observação: {selectedReport.observationDate}</p>
                  </div>
                </div>
              </div>

              {/* BLOCO 1: TÁTICA */}
              <div className="mb-6 break-inside-avoid print-bg bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                <h3 className="font-black text-blue-900 text-lg uppercase border-b border-blue-200 pb-2 mb-3">1. Comportamento Tático</h3>
                <div className="space-y-3 text-sm">
                  <p><strong className="text-blue-800">Modelo Tático Base:</strong> {selectedReport.tacticalModel}</p>
                  <p><strong className="text-blue-800">Comportamento (Vantagem):</strong> {selectedReport.behaviorWinning}</p>
                  <p><strong className="text-blue-800">Comportamento (Desvantagem):</strong> {selectedReport.behaviorLosing}</p>
                  <p><strong className="text-blue-800">Dinâmica de Substituições:</strong> {selectedReport.substitutionsImpact}</p>
                </div>
              </div>

              {/* BLOCO 2: BOLAS PARADAS */}
              <div className="mb-6 break-inside-avoid print-bg bg-orange-50/50 p-4 rounded-xl border border-orange-200">
                <h3 className="font-black text-orange-900 text-lg uppercase border-b border-orange-200 pb-2 mb-3">2. Bolas Paradas</h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 text-sm whitespace-pre-wrap text-slate-800">
                    {selectedReport.setPieces || 'Sem informações registadas.'}
                  </div>
                  {selectedReport.setPiecesPhotoUrl && (
                    <div className="w-full md:w-64 border-2 border-orange-300 rounded-lg overflow-hidden shrink-0 shadow-sm">
                      <img src={selectedReport.setPiecesPhotoUrl} alt="Esquema de Bola Parada" className="w-full h-auto object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* BLOCO 3: INDIVIDUALIDADES E COLETIVO */}
              <div className="mb-6 print-bg bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-black text-slate-900 text-lg uppercase border-b border-slate-200 pb-2 mb-3">3. Destaques e Fragilidades</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Coletivo */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-green-700 uppercase text-xs mb-1">Pontos Fortes (Coletivo)</h4>
                      <p className="text-sm bg-white p-3 rounded-lg border border-green-100">{selectedReport.strengths || '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-red-700 uppercase text-xs mb-1">Pontos Fracos (Coletivo)</h4>
                      <p className="text-sm bg-white p-3 rounded-lg border border-red-100">{selectedReport.weaknesses || '-'}</p>
                    </div>
                  </div>

                  {/* Individual */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase text-xs mb-1">Destaques Individuais (+)</h4>
                      <p className="text-sm bg-white p-3 rounded-lg border border-slate-200">{selectedReport.strongPlayers || '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase text-xs mb-1">Alvos a Explorar (-)</h4>
                      <p className="text-sm bg-white p-3 rounded-lg border border-slate-200">{selectedReport.weakPlayers || '-'}</p>
                    </div>
                  </div>
                </div>

                {selectedReport.observations && (
                  <div className="mt-4 pt-4 border-t border-slate-200 break-inside-avoid">
                    <h4 className="font-bold text-slate-800 uppercase text-xs mb-1">Notas Finais</h4>
                    <p className="text-sm bg-white p-3 rounded-lg border border-slate-200 italic">{selectedReport.observations}</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}