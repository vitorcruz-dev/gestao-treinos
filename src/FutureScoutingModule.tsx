import React, { useState } from 'react';
import { FutureOpponentScouting } from './types';

interface FutureScoutingProps {
  reports: FutureOpponentScouting[];
  onAddReport: (report: FutureOpponentScouting) => void;
}

export default function FutureScoutingModule({ reports, onAddReport }: FutureScoutingProps) {
  const [view, setView] = useState<'form' | 'list'>('form');
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-900">
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Observação de Adversários</h2>
          <p className="text-sm text-slate-500">Relatórios de scouting para preparação de jogos futuros.</p>
        </div>
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setView('form')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${view === 'form' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>Novo Relatório</button>
          <button onClick={() => setView('list')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${view === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>Ver Histórico</button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {view === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Dados Base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Equipa Adversária</label>
                <input type="text" name="opponentName" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ex: FC Porto B" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Data da Observação</label>
                <input type="date" name="observationDate" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>

            {/* Análise Tática */}
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
              <h3 className="font-black text-blue-900 text-lg border-b border-blue-100 pb-2">1. Análise Tática e Comportamental</h3>
              
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-1">Modelo Tático (Ofensivo e Defensivo)</label>
                <input type="text" name="tacticalModel" required className="w-full p-3 bg-white border border-blue-200 rounded-xl" placeholder="Ex: Atacam em 4-3-3, defendem em 4-4-2 bloco baixo..." />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-1">Comportamento a Ganhar</label>
                  <textarea name="behaviorWinning" rows={2} className="w-full p-3 bg-white border border-blue-200 rounded-xl" placeholder="Recuam as linhas, perdem tempo..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-1">Comportamento a Perder</label>
                  <textarea name="behaviorLosing" rows={2} className="w-full p-3 bg-white border border-blue-200 rounded-xl" placeholder="Pressionam alto, desorganizam-se na defesa..."></textarea>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-900 mb-1">Impacto das Substituições</label>
                <textarea name="substitutionsImpact" rows={2} className="w-full p-3 bg-white border border-blue-200 rounded-xl" placeholder="Se sofrem golo, tiram o médio defensivo e colocam o nº 9..."></textarea>
              </div>
            </div>

            {/* Bolas Paradas com Foto */}
            <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 space-y-4">
              <h3 className="font-black text-orange-900 text-lg border-b border-orange-100 pb-2">2. Bolas Paradas (Cantos e Livres)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-orange-900 mb-1">Descrição das Rotinas</label>
                  <textarea name="setPieces" rows={6} className="w-full p-3 bg-white border border-orange-200 rounded-xl" placeholder="Ex: Cantos na direita são batidos fechados para o 1º poste. Sinais: Braço no ar..."></textarea>
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-bold text-orange-900 mb-1">Foto / Esquema Tático</label>
                  <div className="flex-1 border-2 border-dashed border-orange-300 rounded-xl bg-white flex flex-col items-center justify-center p-2 relative overflow-hidden">
                    {photoData ? (
                      <img src={photoData} alt="Bola Parada" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-3xl mb-2 block">📸</span>
                        <span className="text-xs text-slate-400">Clique para anexar foto do lance</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                  {photoData && <button type="button" onClick={() => setPhotoData('')} className="mt-2 text-xs text-red-500 font-bold hover:underline">Remover Foto</button>}
                </div>
              </div>
            </div>

            {/* Análise de Jogadores e Equipa */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-black text-slate-900 text-lg border-b border-slate-200 pb-2">3. Pontos Fortes, Fracos e Destaques Individuais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-green-700 mb-1">Pontos Fortes (Coletivo)</label>
                  <textarea name="strengths" rows={3} className="w-full p-3 bg-white border border-green-200 rounded-xl"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-red-700 mb-1">Pontos Fracos (Coletivo)</label>
                  <textarea name="weaknesses" rows={3} className="w-full p-3 bg-white border border-red-200 rounded-xl"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Jogadores Mais Fortes (Nº e Posição)</label>
                  <textarea name="strongPlayers" rows={3} className="w-full p-3 bg-white border border-slate-200 rounded-xl" placeholder="Ex: Nº 10 (Extremo Esq) - Muito rápido 1v1..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Jogadores Mais Fracos (Alvos a Explorar)</label>
                  <textarea name="weakPlayers" rows={3} className="w-full p-3 bg-white border border-slate-200 rounded-xl" placeholder="Ex: Nº 3 (Lateral Dir) - Lento na transição defensiva..."></textarea>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Observações Adicionais / Notas Finais</label>
                <textarea name="observations" rows={2} className="w-full p-3 bg-white border border-slate-200 rounded-xl"></textarea>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-colors shadow-lg">
              Guardar Relatório do Observador
            </button>
          </form>
        )}

        {view === 'list' && (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <p className="text-slate-500 italic p-4 bg-slate-50 rounded-xl border">Nenhum relatório de scouting registado.</p>
            ) : (
              reports.map(r => (
                <div key={r.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4 border-b pb-4">
                    <div>
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-lg mb-2 inline-block">Data: {r.observationDate}</span>
                      <h3 className="text-xl font-black text-slate-900">{r.opponentName}</h3>
                      <p className="text-sm font-bold text-slate-500 mt-1">Sistema: {r.tacticalModel}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-green-700 mb-1">Fortes</h4>
                      <p className="text-sm text-slate-700 mb-3">{r.strengths}</p>
                      <h4 className="font-bold text-red-700 mb-1">Fracos</h4>
                      <p className="text-sm text-slate-700">{r.weaknesses}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1">Destaques (+)</h4>
                      <p className="text-sm text-slate-700 mb-3">{r.strongPlayers}</p>
                      <h4 className="font-bold text-slate-800 mb-1">Alvos (-)</h4>
                      <p className="text-sm text-slate-700">{r.weakPlayers}</p>
                    </div>
                  </div>

                  {(r.setPieces || r.setPiecesPhotoUrl) && (
                    <div className="mt-4 pt-4 border-t bg-orange-50 p-4 rounded-xl flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-orange-900 mb-1">Bolas Paradas</h4>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{r.setPieces}</p>
                      </div>
                      {r.setPiecesPhotoUrl && (
                        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden border-2 border-orange-200 flex-shrink-0">
                          <img src={r.setPiecesPhotoUrl} alt="Esquema" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}