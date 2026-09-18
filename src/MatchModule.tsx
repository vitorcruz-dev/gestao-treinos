import React, { useState, useEffect } from 'react';
import { MatchReport, Player, IndividualMatchEval, GoalScored, GoalConceded } from './types';

interface MatchModuleProps {
  players: Player[];
  reports: MatchReport[];
  onAddReport: (r: MatchReport) => void;
}

type SquadStatus = 'Titular' | 'Suplente' | 'Fora';

export default function MatchModule({ players, reports, onAddReport }: MatchModuleProps) {
  const [view, setView] = useState<'form' | 'list' | 'report'>('form');
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [reportTab, setReportTab] = useState<'geral' | 'adversario' | 'equipa'>('geral');
  
  const [tempGoalsScored, setTempGoalsScored] = useState<GoalScored[]>([]);
  const [tempGoalsConceded, setTempGoalsConceded] = useState<GoalConceded[]>([]);

  // Estados para a Convocatória Automática
  const [matchSquad, setMatchSquad] = useState<Record<string, SquadStatus>>({});
  const [matchEvals, setMatchEvals] = useState<Record<string, { minutesPlayed: string, rating: string, positives: string, negatives: string }>>({});

  // Inicializa o plantel quando abre o formulário
  useEffect(() => {
    if (view === 'form') {
      const initialSquad: Record<string, SquadStatus> = {};
      const initialEvals: Record<string, any> = {};
      players.forEach(p => {
        initialSquad[p.id] = 'Fora';
        initialEvals[p.id] = { minutesPlayed: '', rating: '', positives: '', negatives: '' };
      });
      setMatchSquad(initialSquad);
      setMatchEvals(initialEvals);
    }
  }, [view, players]);

  // Atualizar campos da avaliação individual
  const updateEval = (playerId: string, field: string, value: string) => {
    setMatchEvals(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: value }
    }));
  };

  const [gsMinute, setGsMinute] = useState('');
  const [gsScorer, setGsScorer] = useState('');
  const [gsAssist, setGsAssist] = useState('');
  const [gcMinute, setGcMinute] = useState('');
  const [gcCorridor, setGcCorridor] = useState<'Direito' | 'Centro' | 'Esquerdo'>('Centro');

  const addGoalScored = () => {
    if (!gsMinute || !gsScorer) return alert('Minuto e Marcador são obrigatórios.');
    setTempGoalsScored([...tempGoalsScored, { id: Date.now().toString(), minute: Number(gsMinute), scorerId: gsScorer, assistId: gsAssist }]);
    setGsMinute(''); setGsScorer(''); setGsAssist('');
  };

  const addGoalConceded = () => {
    if (!gcMinute) return alert('Minuto é obrigatório.');
    setTempGoalsConceded([...tempGoalsConceded, { id: Date.now().toString(), minute: Number(gcMinute), corridor: gcCorridor }]);
    setGcMinute(''); setGcCorridor('Centro');
  };

  const handleSubmitMatch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Processar apenas os jogadores Convocados
    const finalIndividualEvals: IndividualMatchEval[] = players
      .filter(p => matchSquad[p.id] !== 'Fora')
      .map(p => ({
        playerId: p.id,
        status: matchSquad[p.id] as 'Titular' | 'Suplente',
        minutesPlayed: Number(matchEvals[p.id]?.minutesPlayed || 0),
        rating: Number(matchEvals[p.id]?.rating || 0),
        positives: matchEvals[p.id]?.positives || '',
        negatives: matchEvals[p.id]?.negatives || '',
      }));

    const newReport: MatchReport = {
      id: Date.now().toString(),
      teamId: '', // O App.tsx encarrega-se de preencher
      date: formData.get('date') as string, 
      opponent: formData.get('opponent') as string,
      oppTacticalSystem: formData.get('oppTacticalSystem') as string, 
      oppBehaviorWinning: formData.get('oppBehaviorWinning') as string,
      oppBehaviorLosing: formData.get('oppBehaviorLosing') as string, 
      oppSubstitutions: formData.get('oppSubstitutions') as string,
      oppSetPieces: formData.get('oppSetPieces') as string, 
      oppFinalEval: formData.get('oppFinalEval') as string,
      ownInitialSystem: formData.get('ownInitialSystem') as string, 
      ownFinalSystem: formData.get('ownFinalSystem') as string,
      ownTeamPositives: formData.get('ownTeamPositives') as string, 
      ownTeamNegatives: formData.get('ownTeamNegatives') as string,
      goalsScored: [...tempGoalsScored], 
      goalsConceded: [...tempGoalsConceded], 
      individualEvals: finalIndividualEvals,
    };
    
    onAddReport(newReport);
    setTempGoalsScored([]); 
    setTempGoalsConceded([]);
    e.currentTarget.reset(); 
    alert('Jogo guardado com sucesso!'); 
    setView('list');
  };

  const handlePrint = () => window.print();
  const getPlayerName = (id?: string) => players.find(p => p.id === id)?.name || 'N/D';
  const getPlayerPos = (id?: string) => players.find(p => p.id === id)?.position || '';
  const selectedReport = reports.find(r => r.id === selectedReportId);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 relative text-slate-900">
      <style>{`@media print { body * { visibility: hidden; } #match-report-pdf, #match-report-pdf * { visibility: visible; } #match-report-pdf { position: absolute; left: 0; top: 0; width: 100%; padding: 0; } .no-print { display: none !important; } .print-bg { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; } }`}</style>
      
      <div className="p-4 md:p-6 border-b border-slate-100 no-print flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 rounded-t-2xl gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Relatório de Jogo</h2>
          <p className="text-sm text-slate-500">Registe e analise o desempenho da equipa em jogo.</p>
        </div>
        <div className="flex space-x-2 bg-slate-200 p-1 rounded-lg">
          <button onClick={() => setView('form')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${view === 'form' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>Novo Relatório</button>
          <button onClick={() => setView('list')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${(view === 'list' || view === 'report') ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>Histórico & PDF</button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {view === 'form' && (
          <form onSubmit={handleSubmitMatch} className="space-y-8 no-print">
            
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200"><h3 className="font-black text-slate-900 text-lg mb-4 border-b border-slate-200 pb-2">1. Dados do Jogo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm font-bold text-slate-700">Data</label><input type="date" name="date" required className="w-full mt-1 p-3 border border-slate-200 bg-white rounded-xl" defaultValue={new Date().toISOString().split('T')[0]} /></div>
                <div><label className="text-sm font-bold text-slate-700">Adversário</label><input type="text" name="opponent" required className="w-full mt-1 p-3 border border-slate-200 bg-white rounded-xl" placeholder="Nome da Equipa..." /></div>
              </div>
            </div>

            <div className="bg-red-50 p-5 rounded-2xl border border-red-200"><h3 className="font-black text-red-900 text-lg mb-4 border-b border-red-200 pb-2">2. Análise ao Adversário</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm font-bold text-red-800">Sistema Tático</label><input type="text" name="oppTacticalSystem" required className="w-full mt-1 p-3 border border-red-200 bg-white rounded-xl" /></div>
                <div><label className="text-sm font-bold text-red-800">Substituições</label><input type="text" name="oppSubstitutions" className="w-full mt-1 p-3 border border-red-200 bg-white rounded-xl" /></div>
                <div><label className="text-sm font-bold text-red-800">Comportamento (Ganhar)</label><textarea name="oppBehaviorWinning" rows={2} className="w-full mt-1 p-3 border border-red-200 bg-white rounded-xl"></textarea></div>
                <div><label className="text-sm font-bold text-red-800">Comportamento (Perder)</label><textarea name="oppBehaviorLosing" rows={2} className="w-full mt-1 p-3 border border-red-200 bg-white rounded-xl"></textarea></div>
                <div className="md:col-span-2"><label className="text-sm font-bold text-red-800">Bolas Paradas</label><textarea name="oppSetPieces" rows={2} className="w-full mt-1 p-3 border border-red-200 bg-white rounded-xl"></textarea></div>
                <div className="md:col-span-2"><label className="text-sm font-bold text-red-800">Avaliação Final</label><textarea name="oppFinalEval" rows={3} className="w-full mt-1 p-3 border border-red-200 bg-white rounded-xl"></textarea></div>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200"><h3 className="font-black text-blue-900 text-lg mb-4 border-b border-blue-200 pb-2">3. A Nossa Equipa & Golos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div><label className="text-sm font-bold text-blue-800">Sistema Inicial</label><input type="text" name="ownInitialSystem" required className="w-full mt-1 p-3 border border-blue-200 bg-white rounded-xl" /></div>
                <div><label className="text-sm font-bold text-blue-800">Sistema Final</label><input type="text" name="ownFinalSystem" required className="w-full mt-1 p-3 border border-blue-200 bg-white rounded-xl" /></div>
                <div><label className="text-sm font-bold text-green-700">Positivos (Coletivo)</label><textarea name="ownTeamPositives" rows={3} className="w-full mt-1 p-3 border border-blue-200 bg-white rounded-xl"></textarea></div>
                <div><label className="text-sm font-bold text-red-700">A Melhorar (Coletivo)</label><textarea name="ownTeamNegatives" rows={3} className="w-full mt-1 p-3 border border-blue-200 bg-white rounded-xl"></textarea></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-blue-100">
                <div>
                  <h4 className="font-black text-green-700 mb-3">Golos Marcados ({tempGoalsScored.length})</h4>
                  <div className="flex gap-2 mb-3"><input type="number" placeholder="Min" value={gsMinute} onChange={e=>setGsMinute(e.target.value)} className="w-16 p-2 border rounded-lg text-sm bg-slate-50" /><select value={gsScorer} onChange={e=>setGsScorer(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm bg-slate-50"><option value="">Marcador...</option>{players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><select value={gsAssist} onChange={e=>setGsAssist(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm bg-slate-50"><option value="">Assist...</option>{players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><button type="button" onClick={addGoalScored} className="bg-green-600 text-white px-3 font-bold rounded-lg">+</button></div>
                  {tempGoalsScored.map(g => <div key={g.id} className="text-sm bg-green-50 p-2 mb-2 rounded-lg border border-green-100 font-medium">⚽ Min {g.minute}' - {getPlayerName(g.scorerId)}</div>)}
                </div>
                <div>
                  <h4 className="font-black text-red-700 mb-3">Golos Sofridos ({tempGoalsConceded.length})</h4>
                  <div className="flex gap-2 mb-3"><input type="number" placeholder="Min" value={gcMinute} onChange={e=>setGcMinute(e.target.value)} className="w-20 p-2 border rounded-lg text-sm bg-slate-50" /><select value={gcCorridor} onChange={e=>setGcCorridor(e.target.value as any)} className="flex-1 p-2 border rounded-lg text-sm bg-slate-50"><option value="Direito">Direito</option><option value="Centro">Centro</option><option value="Esquerdo">Esquerdo</option></select><button type="button" onClick={addGoalConceded} className="bg-red-600 text-white px-3 font-bold rounded-lg">+</button></div>
                  {tempGoalsConceded.map(g => <div key={g.id} className="text-sm bg-red-50 p-2 mb-2 rounded-lg border border-red-100 font-medium">❌ Min {g.minute}' - Corredor {g.corridor}</div>)}
                </div>
              </div>
            </div>

            {/* SELECÇÃO DA CONVOCATÓRIA */}
            <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-200">
              <div className="flex justify-between items-center border-b border-yellow-200 pb-2 mb-4">
                <h3 className="font-black text-yellow-900 text-lg">4. Convocatória (Titulares e Suplentes)</h3>
                <span className="text-xs font-bold bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full">
                  Titulares: {players.filter(p => matchSquad[p.id] === 'Titular').length}/11
                </span>
              </div>
              <p className="text-sm text-yellow-800 mb-4">Selecione o estado de cada jogador. Os não convocados ficarão de fora das avaliações.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {players.map(p => (
                  <div key={p.id} className="flex flex-col bg-white p-3 border border-yellow-100 rounded-xl shadow-sm">
                    <span className="font-bold text-slate-800 text-sm mb-2 truncate">{p.name} <span className="text-slate-400 font-normal">({p.position})</span></span>
                    <select
                      value={matchSquad[p.id]}
                      onChange={(e) => setMatchSquad({...matchSquad, [p.id]: e.target.value as SquadStatus})}
                      className={`p-2 border rounded-lg text-xs font-bold outline-none transition-colors ${
                        matchSquad[p.id] === 'Titular' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        matchSquad[p.id] === 'Suplente' ? 'bg-green-100 text-green-800 border-green-200' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <option value="Fora">Não Convocado</option>
                      <option value="Titular">Titular</option>
                      <option value="Suplente">Suplente</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* AVALIAÇÕES INDIVIDUAIS (GERADAS AUTOMATICAMENTE) */}
            <div className="bg-green-50 p-5 rounded-2xl border border-green-200">
              <h3 className="font-black text-green-900 text-lg border-b border-green-200 pb-2 mb-4">5. Fichas Individuais (Apenas Convocados)</h3>
              
              {players.filter(p => matchSquad[p.id] !== 'Fora').length === 0 ? (
                <p className="text-green-800 text-sm italic">Selecione titulares e suplentes no painel acima para abrir as fichas de avaliação.</p>
              ) : (
                <div className="space-y-3">
                  {players.filter(p => matchSquad[p.id] !== 'Fora').map(p => (
                    <div key={p.id} className="bg-white p-4 border border-green-100 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                      <div className="md:col-span-3 flex flex-col justify-center h-full">
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded ${matchSquad[p.id] === 'Titular' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {matchSquad[p.id]}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold border px-1 rounded">{p.position}</span>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <input type="number" placeholder="Min" required value={matchEvals[p.id]?.minutesPlayed || ''} onChange={(e) => updateEval(p.id, 'minutesPlayed', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50" />
                      </div>
                      <div className="md:col-span-2">
                        <input type="number" placeholder="Nota (0-10)" required min="0" max="10" value={matchEvals[p.id]?.rating || ''} onChange={(e) => updateEval(p.id, 'rating', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50" />
                      </div>
                      <div className="md:col-span-5 flex flex-col gap-2">
                        <textarea placeholder="Pontos Positivos..." required value={matchEvals[p.id]?.positives || ''} onChange={(e) => updateEval(p.id, 'positives', e.target.value)} rows={1} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 resize-none"></textarea>
                        <textarea placeholder="Pontos a Melhorar..." required value={matchEvals[p.id]?.negatives || ''} onChange={(e) => updateEval(p.id, 'negatives', e.target.value)} rows={1} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 resize-none"></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl text-xl font-black hover:bg-blue-700 shadow-lg transition-colors mt-8">
              Guardar Relatório Completo
            </button>
          </form>
        )}

        {view === 'list' && (
          <div className="no-print space-y-4">
            {reports.length === 0 ? <p className="text-slate-500 italic p-4 bg-slate-50 rounded-xl border">Ainda não registou nenhum jogo.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map(r => (
                  <div key={r.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-lg mb-2 inline-block">Data: {r.date}</span>
                      <h3 className="text-xl font-black text-slate-900 truncate">vs {r.opponent}</h3>
                    </div>
                    <button onClick={() => { setSelectedReportId(r.id); setView('report'); }} className="w-full bg-slate-800 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors">Abrir PDF & Detalhes</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: RELATÓRIO (PDFs Separados) */}
        {view === 'report' && selectedReport && (
          <div>
            <div className="no-print mb-6 border-b border-slate-200 pb-4 flex flex-wrap gap-4 justify-between items-center">
              <button onClick={() => setView('list')} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-300 transition-colors">&larr; Voltar</button>
              
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setReportTab('geral')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${reportTab === 'geral' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>📄 Geral</button>
                <button onClick={() => setReportTab('adversario')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${reportTab === 'adversario' ? 'bg-red-600 text-white shadow' : 'text-slate-500'}`}>🔴 Adversário</button>
                <button onClick={() => setReportTab('equipa')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${reportTab === 'equipa' ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>🔵 Nossa Equipa</button>
              </div>

              <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">🖨️ Imprimir Visualização</button>
            </div>

            <div id="match-report-pdf" className="bg-white">
              <div className="mb-6 border-b-2 border-slate-800 pb-4">
                <p className="text-slate-500 uppercase tracking-widest font-bold text-xs mb-1">
                  {reportTab === 'geral' ? 'Relatório Oficial de Jogo' : reportTab === 'adversario' ? 'Relatório de Scouting: Adversário' : 'Análise de Jogo: Nossa Equipa'}
                </p>
                <h1 className="text-4xl font-black text-slate-900 uppercase">vs {selectedReport.opponent}</h1>
                <div className="flex justify-between items-end mt-4">
                  <p className="text-slate-600 font-medium mt-1">Data: {selectedReport.date}</p>
                  <div className="text-2xl font-black text-slate-800 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                    <span className="text-green-600">{selectedReport.goalsScored.length}</span> - <span className="text-red-600">{selectedReport.goalsConceded.length}</span>
                  </div>
                </div>
              </div>

              <div className={`grid gap-6 ${reportTab === 'geral' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                
                {/* SECÇÃO ADVERSÁRIO */}
                {(reportTab === 'geral' || reportTab === 'adversario') && (
                  <div className="border border-red-200 rounded-xl p-5 bg-red-50/50 print-bg">
                    <h3 className="font-black text-xl text-red-900 mb-4 uppercase border-b border-red-200 pb-2">Análise: {selectedReport.opponent}</h3>
                    <div className="space-y-4 text-sm">
                      <p><strong className="text-red-800">Sistema Tático:</strong> {selectedReport.oppTacticalSystem}</p>
                      <p><strong className="text-red-800">Comportamento (Vantagem):</strong> {selectedReport.oppBehaviorWinning}</p>
                      <p><strong className="text-red-800">Comportamento (Desvantagem):</strong> {selectedReport.oppBehaviorLosing}</p>
                      <p><strong className="text-red-800">Substituições:</strong> {selectedReport.oppSubstitutions}</p>
                      <p><strong className="text-red-800">Bolas Paradas:</strong> {selectedReport.oppSetPieces}</p>
                      <div className="bg-white p-3 rounded-lg border border-red-100"><strong className="text-red-800">Avaliação Global:</strong> {selectedReport.oppFinalEval}</div>
                    </div>
                  </div>
                )}

                {/* SECÇÃO NOSSA EQUIPA E GOLOS */}
                {(reportTab === 'geral' || reportTab === 'equipa') && (
                  <div className="border border-blue-200 rounded-xl p-5 bg-blue-50/50 print-bg">
                    <h3 className="font-black text-xl text-blue-900 mb-4 uppercase border-b border-blue-200 pb-2">Análise: Nossa Equipa</h3>
                    <div className="flex gap-4 mb-4">
                      <div className="bg-white p-3 rounded-lg flex-1 border border-blue-100"><strong className="text-xs text-slate-500 block uppercase">Sistema Inicial</strong><span className="font-black text-lg text-slate-900">{selectedReport.ownInitialSystem}</span></div>
                      <div className="bg-white p-3 rounded-lg flex-1 border border-blue-100"><strong className="text-xs text-slate-500 block uppercase">Sistema Final</strong><span className="font-black text-lg text-slate-900">{selectedReport.ownFinalSystem}</span></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white border border-green-100 rounded-lg p-3">
                        <strong className="text-green-700 block mb-2 text-sm uppercase">⚽ Marcados ({selectedReport.goalsScored.length})</strong>
                        {selectedReport.goalsScored.map(g => (
                          <div key={g.id} className="text-xs border-b border-slate-100 pb-1 mb-1 last:border-0">
                            <strong>{g.minute}'</strong> - {getPlayerName(g.scorerId)} 
                            {g.assistId && <span className="text-slate-400 block ml-4">(Ass: {getPlayerName(g.assistId)})</span>}
                          </div>
                        ))}
                      </div>
                      <div className="bg-white border border-red-100 rounded-lg p-3">
                        <strong className="text-red-700 block mb-2 text-sm uppercase">❌ Sofridos ({selectedReport.goalsConceded.length})</strong>
                        {selectedReport.goalsConceded.map(g => (
                          <div key={g.id} className="text-xs border-b border-slate-100 pb-1 mb-1 last:border-0">
                            <strong>{g.minute}'</strong> - {g.corridor}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div><strong className="text-green-700 block">Positivo:</strong> {selectedReport.ownTeamPositives}</div>
                      <div><strong className="text-red-700 block">A Corrigir:</strong> {selectedReport.ownTeamNegatives}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fichas Individuais agrupadas por Titulares e Suplentes no PDF */}
              {(reportTab === 'geral' || reportTab === 'equipa') && selectedReport.individualEvals.length > 0 && (
                <div className="mt-8 border border-green-200 rounded-xl p-5 bg-green-50/50 print-bg break-inside-avoid">
                  <h3 className="font-black text-xl text-green-900 mb-6 uppercase border-b border-green-200 pb-2">Avaliações Individuais</h3>
                  
                  <div className="mb-6">
                    <h4 className="font-black text-slate-800 mb-3 bg-slate-200 inline-block px-3 py-1 rounded-lg">Onze Inicial (Titulares)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedReport.individualEvals.filter(ev => ev.status === 'Titular').map((ev, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                            <div>
                              <strong className="text-lg text-slate-900 block leading-tight">{getPlayerName(ev.playerId)}</strong>
                              <span className="text-xs text-slate-400 font-bold">{getPlayerPos(ev.playerId)} • Jogou {ev.minutesPlayed}' min</span>
                            </div>
                            <span className="font-black text-xl text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">{ev.rating}</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p><strong className="text-green-600">Positivo:</strong> {ev.positives}</p>
                            <p><strong className="text-red-600">A Melhorar:</strong> {ev.negatives}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-800 mb-3 bg-slate-200 inline-block px-3 py-1 rounded-lg">Suplentes Utilizados/Avaliados</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedReport.individualEvals.filter(ev => ev.status === 'Suplente').map((ev, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                            <div>
                              <strong className="text-lg text-slate-900 block leading-tight">{getPlayerName(ev.playerId)}</strong>
                              <span className="text-xs text-slate-400 font-bold">{getPlayerPos(ev.playerId)} • Jogou {ev.minutesPlayed}' min</span>
                            </div>
                            <span className="font-black text-xl text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">{ev.rating}</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p><strong className="text-green-600">Positivo:</strong> {ev.positives}</p>
                            <p><strong className="text-red-600">A Melhorar:</strong> {ev.negatives}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}