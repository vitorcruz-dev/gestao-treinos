import React, { useState } from 'react';
import { Player, MatchReport } from './types';

interface MatchModuleProps {
  players: Player[];
  reports: MatchReport[];
  onAddReport: (report: MatchReport) => void;
}

export default function MatchModule({ players, reports, onAddReport }: MatchModuleProps) {
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [selectedReport, setSelectedReport] = useState<MatchReport | null>(null);

  const activeTeam = JSON.parse(localStorage.getItem('scoutpro_active_team') || '{}');

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const newReport: MatchReport = {
      id: Date.now().toString(),
      teamId: activeTeam.id,
      date: fd.get('date') as string,
      opponent: fd.get('opponent') as string,
      oppTacticalSystem: fd.get('oppTacticalSystem') as string,
      oppBehaviorWinning: fd.get('oppBehaviorWinning') as string,
      oppBehaviorLosing: fd.get('oppBehaviorLosing') as string,
      oppSubstitutions: fd.get('oppSubstitutions') as string,
      oppSetPieces: fd.get('oppSetPieces') as string,
      oppFinalEval: fd.get('oppFinalEval') as string,
      ownInitialSystem: fd.get('ownInitialSystem') as string,
      ownFinalSystem: fd.get('ownFinalSystem') as string,
      ownTeamPositives: fd.get('ownTeamPositives') as string,
      ownTeamNegatives: fd.get('ownTeamNegatives') as string,
      goalsScored: Number(fd.get('goalsScored')) || 0,
      goalsConceded: Number(fd.get('goalsConceded')) || 0,
      individualEvals: []
    };

    onAddReport(newReport);
    setView('list');
  };

  const openDetails = (report: MatchReport) => {
    setSelectedReport(report);
    setView('details');
  };

  // Helper para contar ou listar golos com segurança
  const getGoalsCount = (val: any): number => {
    if (typeof val === 'number') return val;
    if (Array.isArray(val)) return val.length;
    return 0;
  };

  const renderGoalsList = (val: any) => {
    if (Array.isArray(val)) {
      return val.map((g: any, i: number) => (
        <li key={i} className="text-xs text-slate-300">
          • {g.minute ? `${g.minute}' ` : ''}{g.scorer || 'Golo'} {g.type ? `(${g.type})` : ''}
        </li>
      ));
    }
    return <p className="text-xs text-slate-300">{getGoalsCount(val)} golo(s)</p>;
  };

  if (view === 'list') {
    return (
      <div className="p-2 md:p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-1">Nossos Jogos</h2>
            <p className="text-sm text-slate-400 font-medium">Registo de relatórios de jogo e análises coletivas.</p>
          </div>
          <button
            onClick={() => setView('form')}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg transition-all"
          >
            + Novo Relatório de Jogo
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="bg-[#0f1523] p-12 rounded-2xl border border-slate-800/60 text-center">
            <span className="text-4xl mb-4 block opacity-50">🏆</span>
            <h3 className="text-white font-semibold text-lg">Sem relatórios de jogo</h3>
            <p className="text-sm text-slate-400 mt-2">Adicione o seu primeiro jogo efetuado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map(r => {
              const scored = getGoalsCount(r.goalsScored);
              const conceded = getGoalsCount(r.goalsConceded);

              return (
                <div key={r.id} className="bg-[#151c2c] p-5 rounded-2xl border border-slate-800/60 hover:border-slate-700 transition-colors shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                        {new Date(r.date).toLocaleDateString('pt-PT')}
                      </span>
                      <span className="text-xs font-bold text-white bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/50">
                        {scored} - {conceded}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-4">vs {r.opponent}</h3>
                  </div>

                  <button
                    onClick={() => openDetails(r)}
                    className="w-full py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700/50 transition-colors mt-4"
                  >
                    Ver Relatório Completo
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (view === 'details' && selectedReport) {
    const individualEvals = selectedReport.individualEvals || [];

    return (
      <div className="p-2 md:p-6 max-w-4xl mx-auto space-y-6">
        <button onClick={() => setView('list')} className="text-slate-400 text-sm font-medium hover:text-white transition-colors">
          ← Voltar aos Jogos
        </button>

        <div className="bg-[#151c2c] rounded-2xl border border-slate-800/60 overflow-hidden shadow-lg p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">
                {new Date(selectedReport.date).toLocaleDateString('pt-PT')}
              </span>
              <h1 className="text-2xl font-bold text-white">vs {selectedReport.opponent}</h1>
            </div>
            <div className="bg-slate-900 px-6 py-3 rounded-xl border border-slate-800 text-center">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Resultado Final</span>
              <span className="text-2xl font-black text-white">
                {getGoalsCount(selectedReport.goalsScored)} - {getGoalsCount(selectedReport.goalsConceded)}
              </span>
            </div>
          </div>

          {/* Análise de Golos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0f1523] p-4 rounded-xl border border-slate-800/60">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Golos Marcados</h4>
              <ul className="space-y-1">{renderGoalsList(selectedReport.goalsScored)}</ul>
            </div>
            <div className="bg-[#0f1523] p-4 rounded-xl border border-slate-800/60">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Golos Sofridos</h4>
              <ul className="space-y-1">{renderGoalsList(selectedReport.goalsConceded)}</ul>
            </div>
          </div>

          {/* Análise Coletiva */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/60">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pontos Positivos da Nossa Equipa</h4>
              <div className="bg-[#0f1523] p-4 rounded-xl border border-slate-800/60 min-h-[100px]">
                <p className="text-xs text-slate-300 whitespace-pre-wrap">{selectedReport.ownTeamPositives || 'Sem registo.'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pontos a Melhorar da Nossa Equipa</h4>
              <div className="bg-[#0f1523] p-4 rounded-xl border border-slate-800/60 min-h-[100px]">
                <p className="text-xs text-slate-300 whitespace-pre-wrap">{selectedReport.ownTeamNegatives || 'Sem registo.'}</p>
              </div>
            </div>
          </div>

          {/* Avaliações Individuais */}
          {individualEvals.length > 0 && (
            <div className="pt-4 border-t border-slate-800/60 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avaliações Individuais</h4>
              <div className="space-y-2">
                {individualEvals.map((e, idx) => {
                  const player = players.find(p => p.id === e.playerId);
                  return (
                    <div key={idx} className="bg-[#0f1523] p-3 rounded-xl border border-slate-800/60 flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-white">{player?.name || 'Atleta'}</strong>
                        <span className="text-slate-500 block text-[10px] uppercase">{e.status || 'Utilizado'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-blue-400 font-bold">{e.minutesPlayed || 0}' jogados</span>
                        {e.notes && <p className="text-slate-400 text-[11px] mt-0.5">{e.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 max-w-3xl mx-auto">
      <div className="bg-[#151c2c] p-6 md:p-8 rounded-2xl border border-slate-800/60 shadow-lg space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800/60">
          <h2 className="text-xl font-semibold text-white">Novo Relatório de Jogo</h2>
          <button onClick={() => setView('list')} className="text-sm font-medium text-slate-400 hover:text-white">
            Cancelar
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Data *</label>
              <input required type="date" name="date" className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Adversário *</label>
              <input required type="text" name="opponent" placeholder="Ex: FC Porto Sub-19" className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 bg-slate-800/20 p-4 rounded-xl border border-slate-800/60">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Golos Marcados</label>
              <input type="number" min="0" name="goalsScored" defaultValue="0" className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Golos Sofridos</label>
              <input type="number" min="0" name="goalsConceded" defaultValue="0" className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Pontos Positivos da Nossa Equipa</label>
            <textarea name="ownTeamPositives" rows={3} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none custom-scrollbar" placeholder="Organização defensiva, eficácia..."></textarea>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Pontos a Melhorar da Nossa Equipa</label>
            <textarea name="ownTeamNegatives" rows={3} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none custom-scrollbar" placeholder="Transição defensiva, bolas paradas..."></textarea>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg shadow-md transition-colors text-sm mt-2">
            Guardar Relatório de Jogo
          </button>
        </form>
      </div>
    </div>
  );
}