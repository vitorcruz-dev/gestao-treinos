import React, { useState } from 'react';
import { Player, MatchReport } from './types';

interface StatsModuleProps {
  players: Player[];
  reports: MatchReport[];
}

export default function StatsModule({ players, reports }: StatsModuleProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // CÁLCULOS GERAIS DA EQUIPA
  const totalGames = reports.length;
  let wins = 0, draws = 0, losses = 0;
  let goalsFor = 0, goalsAgainst = 0;

  reports.forEach(r => {
    const scored = r.goalsScored.length;
    const conceded = r.goalsConceded.length;
    goalsFor += scored;
    goalsAgainst += conceded;

    if (scored > conceded) wins++;
    else if (scored === conceded) draws++;
    else losses++;
  });

  // CÁLCULOS INDIVIDUAIS PARA A TABELA PRINCIPAL
  const playerStats = players.map(player => {
    let games = 0;
    let titular = 0;
    let suplente = 0;
    let minutes = 0;
    let goals = 0;
    let assists = 0;
    let totalRating = 0;

    reports.forEach(r => {
      const evalData = r.individualEvals.find(e => e.playerId === player.id);
      if (evalData) {
        games++;
        minutes += evalData.minutesPlayed;
        totalRating += evalData.rating;
        if (evalData.status === 'Titular') titular++;
        if (evalData.status === 'Suplente') suplente++;
      }
      
      r.goalsScored.forEach(g => {
        if (g.scorerId === player.id) goals++;
        if (g.assistId === player.id) assists++;
      });
    });

    const avgRating = games > 0 ? (totalRating / games).toFixed(1) : '-';

    return { ...player, games, titular, suplente, minutes, goals, assists, avgRating };
  });

  playerStats.sort((a, b) => b.minutes - a.minutes); // Ordenar por minutos jogados por defeito

  // DADOS DO JOGADOR SELECIONADO
  const selectedPlayerStats = selectedPlayerId ? playerStats.find(p => p.id === selectedPlayerId) : null;
  
  // Histórico de jogos do jogador selecionado
  const playerMatchHistory = selectedPlayerId ? reports.filter(r => r.individualEvals.some(e => e.playerId === selectedPlayerId)).map(r => {
    const evalData = r.individualEvals.find(e => e.playerId === selectedPlayerId)!;
    const goalsInMatch = r.goalsScored.filter(g => g.scorerId === selectedPlayerId).length;
    const assistsInMatch = r.goalsScored.filter(g => g.assistId === selectedPlayerId).length;
    return { report: r, evalData, goalsInMatch, assistsInMatch };
  }) : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-900">
      
      {/* VISTA 1: DASHBOARD GERAL DA EQUIPA */}
      {!selectedPlayerId && (
        <>
          <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Estatísticas da Época</h2>
              <p className="text-sm text-slate-500">Resumo coletivo e rendimento individual do plantel.</p>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Cartões da Equipa */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Jogos</div>
                <div className="text-4xl font-black text-slate-800">{totalGames}</div>
                <div className="text-sm mt-2 text-slate-600 font-bold flex justify-center gap-2">
                  <span className="text-green-600 bg-green-50 px-2 rounded">{wins}V</span>
                  <span className="text-slate-500 bg-slate-200 px-2 rounded">{draws}E</span>
                  <span className="text-red-600 bg-red-50 px-2 rounded">{losses}D</span>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center shadow-sm">
                <div className="text-xs font-bold text-green-700 uppercase tracking-widest mb-1">Marcados</div>
                <div className="text-4xl font-black text-green-700">{goalsFor}</div>
                <div className="text-xs mt-2 text-green-800 font-bold">{totalGames > 0 ? (goalsFor/totalGames).toFixed(1) : 0} / jogo</div>
              </div>
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center shadow-sm">
                <div className="text-xs font-bold text-red-700 uppercase tracking-widest mb-1">Sofridos</div>
                <div className="text-4xl font-black text-red-700">{goalsAgainst}</div>
                <div className="text-xs mt-2 text-red-800 font-bold">{totalGames > 0 ? (goalsAgainst/totalGames).toFixed(1) : 0} / jogo</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center shadow-sm flex flex-col justify-center">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Dif. Golos</div>
                <div className={`text-4xl font-black ${goalsFor - goalsAgainst >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                  {goalsFor - goalsAgainst > 0 ? '+' : ''}{goalsFor - goalsAgainst}
                </div>
              </div>
            </div>

            {/* Tabela Individual */}
            <h3 className="font-black text-lg mb-4 text-slate-800 uppercase border-b border-slate-100 pb-2">Rendimento Individual (Clique para Detalhes)</h3>
            <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-black text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Atleta</th>
                    <th className="py-3 px-4 text-center">Pos</th>
                    <th className="py-3 px-4 text-center">Jogos (T/S)</th>
                    <th className="py-3 px-4 text-center text-blue-700">Minutos</th>
                    <th className="py-3 px-4 text-center text-green-700">Golos</th>
                    <th className="py-3 px-4 text-center text-slate-700">Assist.</th>
                    <th className="py-3 px-4 text-center text-yellow-700">Nota Média</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {playerStats.map((p) => (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedPlayerId(p.id)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-3">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-bold border border-slate-300">SP</div>
                        )}
                        {p.name}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 font-bold text-xs">{p.position}</td>
                      <td className="py-3 px-4 text-center font-medium">
                        {p.games} <span className="text-xs text-slate-400">({p.titular}/{p.suplente})</span>
                      </td>
                      <td className="py-3 px-4 text-center font-black text-blue-700">{p.minutes}'</td>
                      <td className="py-3 px-4 text-center font-black text-green-600">{p.goals}</td>
                      <td className="py-3 px-4 text-center font-black text-slate-600">{p.assists}</td>
                      <td className="py-3 px-4 text-center font-black text-yellow-600">{p.avgRating}</td>
                    </tr>
                  ))}
                  {playerStats.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-slate-500 italic">Nenhum jogador registado na equipa.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VISTA 2: PERFIL DETALHADO DO JOGADOR */}
      {selectedPlayerId && selectedPlayerStats && (
        <div className="animate-fade-in">
          <div className="p-4 md:p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-slate-50 rounded-t-2xl">
            <button 
              onClick={() => setSelectedPlayerId(null)} 
              className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors shadow-sm"
            >
              &larr; Voltar às Estatísticas
            </button>
            <button onClick={() => window.print()} className="bg-slate-800 text-white px-5 py-2 rounded-lg font-bold text-sm shadow hover:bg-slate-700 transition-colors">
              🖨️ Imprimir Perfil
            </button>
          </div>

          <div className="p-4 md:p-8">
            
            {/* Cabeçalho do Jogador */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 border-b border-slate-200 pb-8">
              {selectedPlayerStats.photoUrl ? (
                <img src={selectedPlayerStats.photoUrl} alt="Foto" className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold border-4 border-white shadow-lg">Sem Foto</div>
              )}
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-3 mb-2">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedPlayerStats.name}</h2>
                  <span className="bg-slate-800 text-white px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-widest">{selectedPlayerStats.position}</span>
                </div>
                <div className="text-slate-500 font-medium flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                  <span><strong className="text-slate-700">Idade:</strong> {selectedPlayerStats.age} anos</span>
                  <span><strong className="text-slate-700">Nascimento:</strong> {selectedPlayerStats.birthDate}</span>
                  <span><strong className="text-slate-700">Pé Pref:</strong> {selectedPlayerStats.preferredFoot}</span>
                </div>
                {selectedPlayerStats.notes && (
                  <p className="mt-4 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100 text-slate-700 italic">
                    <strong className="text-blue-900 not-italic block mb-1 uppercase text-xs">Observações Base:</strong>
                    {selectedPlayerStats.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Cartões de Estatística Individual */}
            <h3 className="font-black text-lg mb-4 text-slate-800 uppercase">Resumo da Época</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                <div className="text-xs font-bold text-slate-500 uppercase">Jogos (Tit/Sup)</div>
                <div className="text-2xl font-black text-slate-800 mt-1">{selectedPlayerStats.games} <span className="text-sm text-slate-400 font-bold">({selectedPlayerStats.titular}/{selectedPlayerStats.suplente})</span></div>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center">
                <div className="text-xs font-bold text-blue-700 uppercase">Minutos</div>
                <div className="text-2xl font-black text-blue-800 mt-1">{selectedPlayerStats.minutes}'</div>
              </div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center">
                <div className="text-xs font-bold text-green-700 uppercase">Golos</div>
                <div className="text-2xl font-black text-green-800 mt-1">{selectedPlayerStats.goals}</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center">
                <div className="text-xs font-bold text-orange-700 uppercase">Assistências</div>
                <div className="text-2xl font-black text-orange-800 mt-1">{selectedPlayerStats.assists}</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-center flex flex-col justify-center">
                <div className="text-xs font-bold text-yellow-700 uppercase">Nota Média</div>
                <div className="text-3xl font-black text-yellow-600">{selectedPlayerStats.avgRating}</div>
              </div>
            </div>

            {/* Histórico de Jogos Detalhado */}
            <h3 className="font-black text-lg mb-4 text-slate-800 uppercase border-b border-slate-100 pb-2">Desempenho Jogo a Jogo</h3>
            
            {playerMatchHistory.length === 0 ? (
              <p className="text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-200">Este jogador ainda não foi convocado para nenhum jogo oficial.</p>
            ) : (
              <div className="space-y-4">
                {playerMatchHistory.map((match, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row gap-6 hover:border-blue-300 transition-colors">
                    
                    {/* Info do Jogo */}
                    <div className="lg:w-1/4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 pr-0 lg:pr-4 flex flex-col justify-center">
                      <span className="text-xs font-bold text-slate-400 mb-1">{match.report.date}</span>
                      <strong className="text-lg text-slate-900 leading-tight mb-2">vs {match.report.opponent}</strong>
                      <div className="flex gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${match.evalData.status === 'Titular' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {match.evalData.status}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                          {match.evalData.minutesPlayed}' min
                        </span>
                      </div>
                    </div>

                    {/* Avaliação Técnica */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Nota</span>
                          <span className="text-xl font-black text-blue-600">{match.evalData.rating}</span>
                        </div>
                        
                        {(match.goalsInMatch > 0 || match.assistsInMatch > 0) && (
                          <div className="flex gap-2">
                            {match.goalsInMatch > 0 && <span className="bg-green-100 border border-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-lg flex items-center">⚽ {match.goalsInMatch} Golo(s)</span>}
                            {match.assistsInMatch > 0 && <span className="bg-orange-100 border border-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded-lg flex items-center">🎯 {match.assistsInMatch} Assist(s)</span>}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                          <strong className="block text-green-700 text-xs uppercase mb-1">O que fez bem:</strong>
                          <p className="text-sm text-slate-700">{match.evalData.positives || '-'}</p>
                        </div>
                        <div className="bg-red-50/50 p-3 rounded-lg border border-red-100">
                          <strong className="block text-red-700 text-xs uppercase mb-1">A Melhorar:</strong>
                          <p className="text-sm text-slate-700">{match.evalData.negatives || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}