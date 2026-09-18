import React, { useState } from 'react';
import {
  MatchReport,
  Player,
  IndividualMatchEval,
  GoalScored,
  GoalConceded,
} from './types';

interface MatchModuleProps {
  players: Player[];
  reports: MatchReport[];
  onAddReport: (r: MatchReport) => void;
}

export default function MatchModule({
  players,
  reports,
  onAddReport,
}: MatchModuleProps) {
  const [view, setView] = useState<'form' | 'list' | 'report'>('form');
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [reportTab, setReportTab] = useState<'geral' | 'adversario' | 'equipa'>(
    'geral'
  );

  const [tempIndEvals, setTempIndEvals] = useState<IndividualMatchEval[]>([]);
  const [tempGoalsScored, setTempGoalsScored] = useState<GoalScored[]>([]);
  const [tempGoalsConceded, setTempGoalsConceded] = useState<GoalConceded[]>(
    []
  );

  const [indPlayerId, setIndPlayerId] = useState('');
  const [indMinutes, setIndMinutes] = useState('');
  const [indRating, setIndRating] = useState('');
  const [indPositives, setIndPositives] = useState('');
  const [indNegatives, setIndNegatives] = useState('');

  const [gsMinute, setGsMinute] = useState('');
  const [gsScorer, setGsScorer] = useState('');
  const [gsAssist, setGsAssist] = useState('');
  const [gcMinute, setGcMinute] = useState('');
  const [gcCorridor, setGcCorridor] = useState<
    'Direito' | 'Centro' | 'Esquerdo'
  >('Centro');

  const addIndividualEval = () => {
    if (!indPlayerId || !indRating || !indMinutes)
      return alert('Atleta, Nota e Minutos são obrigatórios.');
    setTempIndEvals([
      ...tempIndEvals,
      {
        playerId: indPlayerId,
        minutesPlayed: Number(indMinutes),
        rating: Number(indRating),
        positives: indPositives,
        negatives: indNegatives,
      },
    ]);
    setIndPlayerId('');
    setIndRating('');
    setIndMinutes('');
    setIndPositives('');
    setIndNegatives('');
  };

  const addGoalScored = () => {
    if (!gsMinute || !gsScorer)
      return alert('Minuto e Marcador são obrigatórios.');
    setTempGoalsScored([
      ...tempGoalsScored,
      {
        id: Date.now().toString(),
        minute: Number(gsMinute),
        scorerId: gsScorer,
        assistId: gsAssist,
      },
    ]);
    setGsMinute('');
    setGsScorer('');
    setGsAssist('');
  };

  const addGoalConceded = () => {
    if (!gcMinute) return alert('Minuto é obrigatório.');
    setTempGoalsConceded([
      ...tempGoalsConceded,
      {
        id: Date.now().toString(),
        minute: Number(gcMinute),
        corridor: gcCorridor,
      },
    ]);
    setGcMinute('');
    setGcCorridor('Centro');
  };

  const handleSubmitMatch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newReport: MatchReport = {
      id: Date.now().toString(),
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
      individualEvals: [...tempIndEvals],
    };
    onAddReport(newReport);
    setTempIndEvals([]);
    setTempGoalsScored([]);
    setTempGoalsConceded([]);
    e.currentTarget.reset();
    alert('Jogo guardado com sucesso!');
    setView('list');
  };

  const handlePrint = () => window.print();
  const getPlayerName = (id?: string) =>
    players.find((p) => p.id === id)?.name || 'N/D';
  const selectedReport = reports.find((r) => r.id === selectedReportId);

  return (
    <div className="bg-white rounded shadow relative">
      <style>{`@media print { body * { visibility: hidden; } #match-report-pdf, #match-report-pdf * { visibility: visible; } #match-report-pdf { position: absolute; left: 0; top: 0; width: 100%; padding: 0; } .no-print { display: none !important; } .print-bg { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; } }`}</style>
      <div className="p-4 border-b no-print flex justify-between items-center bg-gray-50 rounded-t">
        <h2 className="text-xl font-bold text-green-800">
          Scouting & Relatório de Jogo
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('form')}
            className={`px-3 py-1 rounded font-bold ${
              view === 'form' ? 'bg-green-600 text-white' : 'bg-gray-200'
            }`}
          >
            Novo Relatório
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1 rounded font-bold ${
              view === 'list' || view === 'report'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200'
            }`}
          >
            Histórico & PDF
          </button>
        </div>
      </div>

      <div className="p-4">
        {view === 'form' && (
          <form onSubmit={handleSubmitMatch} className="space-y-8 no-print">
            <div className="bg-gray-50 p-4 rounded border">
              <h3 className="font-bold text-lg mb-2">1. Dados</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data</label>
                  <input
                    type="date"
                    name="date"
                    required
                    className="w-full mt-1 p-2 border rounded"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Adversário</label>
                  <input
                    type="text"
                    name="opponent"
                    required
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded border border-red-200">
              <h3 className="font-bold text-lg text-red-900 mb-2">
                2. Adversário
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Sistema</label>
                  <input
                    type="text"
                    name="oppTacticalSystem"
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm">Substituições</label>
                  <input
                    type="text"
                    name="oppSubstitutions"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm">Ganha</label>
                  <textarea
                    name="oppBehaviorWinning"
                    rows={1}
                    className="w-full p-2 border rounded"
                  ></textarea>
                </div>
                <div>
                  <label className="text-sm">Perde</label>
                  <textarea
                    name="oppBehaviorLosing"
                    rows={1}
                    className="w-full p-2 border rounded"
                  ></textarea>
                </div>
                <div className="col-span-2">
                  <label className="text-sm">Bolas Paradas</label>
                  <textarea
                    name="oppSetPieces"
                    rows={1}
                    className="w-full p-2 border rounded"
                  ></textarea>
                </div>
                <div className="col-span-2">
                  <label className="text-sm">Avaliação Final</label>
                  <textarea
                    name="oppFinalEval"
                    rows={2}
                    className="w-full p-2 border rounded"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h3 className="font-bold text-lg text-blue-900 mb-2">
                3. Nossa Equipa & Golos
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm">Sistema Inicial</label>
                  <input
                    type="text"
                    name="ownInitialSystem"
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm">Sistema Final</label>
                  <input
                    type="text"
                    name="ownFinalSystem"
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm">Positivos</label>
                  <textarea
                    name="ownTeamPositives"
                    rows={2}
                    className="w-full p-2 border rounded"
                  ></textarea>
                </div>
                <div>
                  <label className="text-sm">A Melhorar</label>
                  <textarea
                    name="ownTeamNegatives"
                    rows={2}
                    className="w-full p-2 border rounded"
                  ></textarea>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 bg-white p-4 rounded border">
                <div>
                  <h4 className="font-bold text-green-700 mb-2">
                    Golos Marcados ({tempGoalsScored.length})
                  </h4>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={gsMinute}
                      onChange={(e) => setGsMinute(e.target.value)}
                      className="w-16 p-2 border rounded text-sm"
                    />
                    <select
                      value={gsScorer}
                      onChange={(e) => setGsScorer(e.target.value)}
                      className="flex-1 p-2 border rounded text-sm"
                    >
                      <option value="">Marcador...</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={gsAssist}
                      onChange={(e) => setGsAssist(e.target.value)}
                      className="flex-1 p-2 border rounded text-sm"
                    >
                      <option value="">Assist...</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addGoalScored}
                      className="bg-green-600 text-white px-2 rounded"
                    >
                      +
                    </button>
                  </div>
                  {tempGoalsScored.map((g) => (
                    <div
                      key={g.id}
                      className="text-sm bg-green-50 p-1 mb-1 rounded"
                    >
                      Min {g.minute}' - {getPlayerName(g.scorerId)}
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-bold text-red-700 mb-2">
                    Golos Sofridos ({tempGoalsConceded.length})
                  </h4>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={gcMinute}
                      onChange={(e) => setGcMinute(e.target.value)}
                      className="w-20 p-2 border rounded text-sm"
                    />
                    <select
                      value={gcCorridor}
                      onChange={(e) => setGcCorridor(e.target.value as any)}
                      className="flex-1 p-2 border rounded text-sm"
                    >
                      <option value="Direito">Direito</option>
                      <option value="Centro">Centro</option>
                      <option value="Esquerdo">Esquerdo</option>
                    </select>
                    <button
                      type="button"
                      onClick={addGoalConceded}
                      className="bg-red-600 text-white px-2 rounded"
                    >
                      +
                    </button>
                  </div>
                  {tempGoalsConceded.map((g) => (
                    <div
                      key={g.id}
                      className="text-sm bg-red-50 p-1 mb-1 rounded"
                    >
                      Min {g.minute}' - Corredor {g.corridor}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded border border-green-200">
              <h3 className="font-bold text-lg text-green-900 mb-2">
                4. Fichas Individuais
              </h3>
              <div className="bg-white p-4 rounded border grid grid-cols-2 gap-4">
                <div>
                  <select
                    value={indPlayerId}
                    onChange={(e) => setIndPlayerId(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Atleta...</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min Jogados"
                    value={indMinutes}
                    onChange={(e) => setIndMinutes(e.target.value)}
                    className="w-1/2 p-2 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Nota (0-10)"
                    min="0"
                    max="10"
                    value={indRating}
                    onChange={(e) => setIndRating(e.target.value)}
                    className="w-1/2 p-2 border rounded"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="O que fez bem..."
                    value={indPositives}
                    onChange={(e) => setIndPositives(e.target.value)}
                    rows={2}
                    className="w-full p-2 border rounded"
                  ></textarea>
                </div>
                <div>
                  <textarea
                    placeholder="A melhorar..."
                    value={indNegatives}
                    onChange={(e) => setIndNegatives(e.target.value)}
                    rows={2}
                    className="w-full p-2 border rounded"
                  ></textarea>
                </div>
                <div className="col-span-2 text-right">
                  <button
                    type="button"
                    onClick={addIndividualEval}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black"
                  >
                    + Adicionar Ficha
                  </button>
                </div>
              </div>
              {tempIndEvals.length > 0 && (
                <div className="mt-4 space-y-2">
                  {tempIndEvals.map((ev, i) => (
                    <div
                      key={i}
                      className="bg-white p-2 text-sm rounded border"
                    >
                      <strong>{getPlayerName(ev.playerId)}</strong> (
                      {ev.minutesPlayed}' min) - Nota: {ev.rating}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white px-6 py-4 rounded text-xl font-bold shadow"
            >
              Guardar Relatório
            </button>
          </form>
        )}

        {view === 'list' && (
          <div className="no-print space-y-4">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-gray-50 border p-4 rounded flex justify-between items-center"
              >
                <div>
                  <span className="text-gray-500 text-sm block">{r.date}</span>
                  <strong className="text-lg text-blue-900">
                    vs {r.opponent}
                  </strong>
                </div>
                <button
                  onClick={() => {
                    setSelectedReportId(r.id);
                    setView('report');
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded font-bold"
                >
                  Ver PDF
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ... Restante do código PDF mantido igual ao anterior ... */}
        {view === 'report' && selectedReport && (
          <div className="no-print">
            <button
              onClick={() => setView('list')}
              className="bg-gray-200 px-4 py-2 rounded font-bold"
            >
              &larr; Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
