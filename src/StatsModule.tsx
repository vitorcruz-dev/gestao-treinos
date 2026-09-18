import React from 'react';
import { Player, MatchReport } from './types';

interface StatsModuleProps {
  players: Player[];
  reports: MatchReport[];
}

export default function StatsModule({ players, reports }: StatsModuleProps) {
  // Cálculos da Equipa
  const totalGames = reports.length;
  let wins = 0,
    draws = 0,
    losses = 0;
  let goalsFor = 0,
    goalsAgainst = 0;

  reports.forEach((r) => {
    const scored = r.goalsScored.length;
    const conceded = r.goalsConceded.length;
    goalsFor += scored;
    goalsAgainst += conceded;

    if (scored > conceded) wins++;
    else if (scored === conceded) draws++;
    else losses++;
  });

  // Cálculos Individuais
  const playerStats = players.map((player) => {
    let games = 0;
    let minutes = 0;
    let goals = 0;
    let assists = 0;

    reports.forEach((r) => {
      // Jogou neste jogo?
      const evalData = r.individualEvals.find((e) => e.playerId === player.id);
      if (evalData) {
        games++;
        minutes += evalData.minutesPlayed;
      }

      // Golos e Assistências
      r.goalsScored.forEach((g) => {
        if (g.scorerId === player.id) goals++;
        if (g.assistId === player.id) assists++;
      });
    });

    return { ...player, games, minutes, goals, assists };
  });

  // Ordenar por minutos jogados
  playerStats.sort((a, b) => b.minutes - a.minutes);

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-2xl font-extrabold text-blue-900 mb-6 border-b pb-4">
        Estatísticas Gerais (Época)
      </h2>

      {/* Cartões da Equipa */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded text-center">
          <div className="text-gray-500 font-bold">Jogos Totais</div>
          <div className="text-3xl font-black text-blue-800">{totalGames}</div>
          <div className="text-sm mt-1 text-gray-600">
            <span className="text-green-600 font-bold">{wins}V</span> -{' '}
            <span className="text-yellow-600 font-bold">{draws}E</span> -{' '}
            <span className="text-red-600 font-bold">{losses}D</span>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded text-center">
          <div className="text-gray-500 font-bold">Golos Marcados</div>
          <div className="text-3xl font-black text-green-800">{goalsFor}</div>
          <div className="text-sm mt-1 text-green-700 font-semibold">
            {totalGames > 0 ? (goalsFor / totalGames).toFixed(1) : 0} / jogo
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded text-center">
          <div className="text-gray-500 font-bold">Golos Sofridos</div>
          <div className="text-3xl font-black text-red-800">{goalsAgainst}</div>
          <div className="text-sm mt-1 text-red-700 font-semibold">
            {totalGames > 0 ? (goalsAgainst / totalGames).toFixed(1) : 0} / jogo
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded text-center">
          <div className="text-gray-500 font-bold">Diferença Golos</div>
          <div
            className={`text-3xl font-black ${
              goalsFor - goalsAgainst >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {goalsFor - goalsAgainst > 0 ? '+' : ''}
            {goalsFor - goalsAgainst}
          </div>
        </div>
      </div>

      {/* Tabela Individual */}
      <h3 className="font-bold text-xl mb-4 text-gray-800">
        Estatísticas Individuais (Plantel)
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4 text-left border-b">Atleta</th>
              <th className="py-2 px-4 text-center border-b">Posição</th>
              <th className="py-2 px-4 text-center border-b">Jogos</th>
              <th className="py-2 px-4 text-center border-b font-bold text-yellow-300">
                Minutos
              </th>
              <th className="py-2 px-4 text-center border-b font-bold text-green-300">
                Golos
              </th>
              <th className="py-2 px-4 text-center border-b font-bold text-blue-300">
                Assist.
              </th>
            </tr>
          </thead>
          <tbody>
            {playerStats.map((p, index) => (
              <tr
                key={p.id}
                className={
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white hover:bg-gray-100'
                }
              >
                <td className="py-2 px-4 border-b font-bold">{p.name}</td>
                <td className="py-2 px-4 border-b text-center text-gray-500">
                  {p.position}
                </td>
                <td className="py-2 px-4 border-b text-center">{p.games}</td>
                <td className="py-2 px-4 border-b text-center font-bold text-yellow-600">
                  {p.minutes}'
                </td>
                <td className="py-2 px-4 border-b text-center font-bold text-green-600">
                  {p.goals}
                </td>
                <td className="py-2 px-4 border-b text-center font-bold text-blue-600">
                  {p.assists}
                </td>
              </tr>
            ))}
            {playerStats.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Nenhum jogador no plantel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
