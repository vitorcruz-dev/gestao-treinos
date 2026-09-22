import React, { useState } from 'react';
import { Player, MatchReport } from './types';

interface StatsModuleProps {
  players: Player[];
  reports: MatchReport[];
}

export default function StatsModule({ players, reports }: StatsModuleProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('all');

  // Cálculos Globais / Por Jogador
  const totalMatches = reports.length;

  const getPlayerStats = (playerId: string) => {
    let matchesPlayed = 0;
    let totalMinutes = 0;
    let starterCount = 0;
    let subCount = 0;
    let goalsScored = 0;
    let assists = 0;

    reports.forEach(r => {
      const evals = r.individualEvals || [];
      const pEval = evals.find(e => e.playerId === playerId);

      if (pEval) {
        if (pEval.minutesPlayed && pEval.minutesPlayed > 0) {
          matchesPlayed++;
          totalMinutes += pEval.minutesPlayed;
        }
        if (pEval.status === 'titular') starterCount++;
        if (pEval.status === 'suplente') subCount++;
      }

      // Verificação de golos seguros
      if (Array.isArray(r.goalsScored)) {
        r.goalsScored.forEach((g: any) => {
          if (g.scorerId === playerId) goalsScored++;
          if (g.assistId === playerId) assists++;
        });
      }
    });

    return { matchesPlayed, totalMinutes, starterCount, subCount, goalsScored, assists };
  };

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  return (
    <div className="p-2 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-1">Estatísticas</h2>
          <p className="text-sm text-slate-400 font-medium">Análise de rendimento individual e coletivo da equipa.</p>
        </div>

        {/* Seletor de Jogador */}
        <select
          value={selectedPlayerId}
          onChange={(e) => setSelectedPlayerId(e.target.value)}
          className="bg-[#151c2c] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none w-full md:w-64"
        >
          <option value="all">📊 Visão Geral da Equipa</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.position})</option>
          ))}
        </select>
      </div>

      {selectedPlayerId === 'all' ? (
        /* VISÃO GERAL */
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#151c2c] p-5 rounded-2xl border border-slate-800/60">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total de Jogos</span>
              <span className="text-3xl font-bold text-white">{totalMatches}</span>
            </div>
            <div className="bg-[#151c2c] p-5 rounded-2xl border border-slate-800/60">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total de Atletas</span>
              <span className="text-3xl font-bold text-blue-400">{players.length}</span>
            </div>
            <div className="bg-[#151c2c] p-5 rounded-2xl border border-slate-800/60">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Média de Idades</span>
              <span className="text-3xl font-bold text-slate-200">
                {players.length > 0 
                  ? (players.reduce((acc, p) => acc + (Number(p.age) || 0), 0) / players.length).toFixed(1)
                  : '--'}
              </span>
            </div>
            <div className="bg-[#151c2c] p-5 rounded-2xl border border-slate-800/60">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Relatórios Guardados</span>
              <span className="text-3xl font-bold text-emerald-400">{reports.length}</span>
            </div>
          </div>

          {/* Tabela de Utilização do Plantel */}
          <div className="bg-[#151c2c] rounded-2xl border border-slate-800/60 overflow-hidden shadow-lg p-6">
            <h3 className="text-base font-semibold text-white mb-4">Utilização dos Atletas</h3>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Atleta</th>
                    <th className="py-3 px-4">Posição</th>
                    <th className="py-3 px-4 text-center">Jogos</th>
                    <th className="py-3 px-4 text-center">Minutos</th>
                    <th className="py-3 px-4 text-center">Titular</th>
                    <th className="py-3 px-4 text-center">Suplente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  {players.map(p => {
                    const stats = getPlayerStats(p.id);
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">{p.name}</td>
                        <td className="py-3 px-4 text-blue-400 font-medium">{p.position}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-200">{stats.matchesPlayed}</td>
                        <td className="py-3 px-4 text-center font-medium">{stats.totalMinutes}'</td>
                        <td className="py-3 px-4 text-center text-emerald-400 font-medium">{stats.starterCount}</td>
                        <td className="py-3 px-4 text-center text-amber-400 font-medium">{stats.subCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : selectedPlayer ? (
        /* VISÃO INDIVIDUAL */
        (() => {
          const stats = getPlayerStats(selectedPlayer.id);
          return (
            <div className="space-y-6">
              <div className="bg-[#151c2c] p-6 rounded-2xl border border-slate-800/60 flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-white border border-slate-700">
                  {selectedPlayer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedPlayer.name}</h3>
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mt-1">{selectedPlayer.position} • {selectedPlayer.preferredFoot}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#151c2c] p-5 rounded-2xl border border-slate-800/60">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jogos Efetuados</span>
                  <span className="text-3xl font-bold text-white">{stats.matchesPlayed}</span>
                </div>
                <div className="bg-[#151c2c] p-5 rounded-2xl border border-slate-800/60">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Minutos Utilizado</span>
                  <span className="text-3xl font-bold text-blue-400">{stats.totalMinutes}'</span>
                </div>
                <div className="bg-[#151c2c] p-5 rounded-2xl border border-slate-800/60">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Titularidades</span>
                  <span className="text-3xl font-bold text-emerald-400">{stats.starterCount}</span>
                </div>
                <div className="bg-[#151c2c] p-5 rounded-2xl border border-slate-800/60">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Entradas de Suplente</span>
                  <span className="text-3xl font-bold text-amber-400">{stats.subCount}</span>
                </div>
              </div>

              {/* Histórico nos Jogos */}
              <div className="bg-[#151c2c] rounded-2xl border border-slate-800/60 p-6 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Histórico de Performance nos Jogos</h4>
                <div className="space-y-3">
                  {reports.map(r => {
                    const evals = r.individualEvals || [];
                    const pEval = evals.find(e => e.playerId === selectedPlayer.id);
                    if (!pEval) return null;

                    return (
                      <div key={r.id} className="bg-[#0f1523] p-4 rounded-xl border border-slate-800/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">
                            {new Date(r.date).toLocaleDateString('pt-PT')} vs {r.opponent}
                          </span>
                          <p className="text-xs text-slate-300">
                            Estatuto: <strong className="text-white capitalize">{pEval.status || 'N/A'}</strong> | Tempo: <strong className="text-white">{pEval.minutesPlayed || 0} minutos</strong>
                          </p>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          {pEval.positives && <p className="text-emerald-400"><strong>+</strong> {pEval.positives}</p>}
                          {pEval.negatives && <p className="text-red-400"><strong>-</strong> {pEval.negatives}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()
      ) : null}
    </div>
  );
}