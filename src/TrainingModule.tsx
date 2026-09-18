import React, { useState } from 'react';
import { Player, TrainingEvaluation } from './types';

interface TrainingModuleProps {
  players: Player[];
}

export default function TrainingModule({ players }: TrainingModuleProps) {
  const [evaluations, setEvaluations] = useState<TrainingEvaluation[]>([]);
  const [view, setView] = useState<'form' | 'teamReport' | 'individualReport'>(
    'form'
  );

  // Estados para os filtros dos relatórios
  const [reportDate, setReportDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reportPlayerId, setReportPlayerId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newEval: TrainingEvaluation = {
      id: Date.now().toString(),
      playerId: formData.get('playerId') as string,
      date: formData.get('date') as string,
      performance: Number(formData.get('performance')),
      strengths: formData.get('strengths') as string,
      weaknesses: formData.get('weaknesses') as string,
      observations: formData.get('observations') as string,
    };

    setEvaluations([newEval, ...evaluations]);
    e.currentTarget.reset();
    alert('Avaliação guardada com sucesso!');
  };

  // Função para chamar o guardador de PDF do navegador
  const handlePrint = () => {
    window.print();
  };

  const evalsOnDate = evaluations.filter((ev) => ev.date === reportDate);
  const evalsForPlayer = evaluations.filter(
    (ev) => ev.playerId === reportPlayerId
  );

  return (
    <div className="bg-white rounded shadow relative">
      {/* Estilos específicos para quando se clica em Imprimir/PDF */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-report, #printable-report * { visibility: visible; }
            #printable-report { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
            .no-print { display: none !important; }
            .print-bg { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
          }
        `}
      </style>

      {/* Menu do Módulo de Treinos */}
      <div className="p-4 border-b no-print flex flex-col md:flex-row justify-between items-center bg-gray-50 rounded-t">
        <h2 className="text-xl font-bold text-blue-800 mb-4 md:mb-0">
          Avaliações de Treino
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('form')}
            className={`px-3 py-1 rounded font-bold ${
              view === 'form'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Registar
          </button>
          <button
            onClick={() => setView('teamReport')}
            className={`px-3 py-1 rounded font-bold ${
              view === 'teamReport'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Relatório Equipa
          </button>
          <button
            onClick={() => setView('individualReport')}
            className={`px-3 py-1 rounded font-bold ${
              view === 'individualReport'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Relatório Atleta
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* VIEW 1: FORMULÁRIO DE REGISTO */}
        {view === 'form' && (
          <div className="no-print">
            <form
              onSubmit={handleSubmit}
              className="space-y-4 bg-blue-50 p-4 rounded border border-blue-100 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium">
                    Data do Treino
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium">Atleta</label>
                  <select
                    name="playerId"
                    required
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="">Selecionar Atleta...</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.position})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium">
                    Performance (0 a 10)
                  </label>
                  <input
                    type="number"
                    name="performance"
                    min="0"
                    max="10"
                    required
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="Ex: 8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700">
                    Aspetos Fortes
                  </label>
                  <textarea
                    name="strengths"
                    required
                    className="w-full mt-1 p-2 border rounded"
                    rows={3}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-700">
                    Aspetos a Melhorar
                  </label>
                  <textarea
                    name="weaknesses"
                    required
                    className="w-full mt-1 p-2 border rounded"
                    rows={3}
                  ></textarea>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Observações Gerais
                </label>
                <textarea
                  name="observations"
                  className="w-full mt-1 p-2 border rounded"
                  rows={2}
                ></textarea>
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold w-full md:w-auto"
              >
                Registar Avaliação
              </button>
            </form>
            <p className="text-sm text-gray-500 italic">
              Para ver e imprimir os relatórios, utilize os separadores acima.
            </p>
          </div>
        )}

        {/* VIEW 2: RELATÓRIO DE EQUIPA */}
        {view === 'teamReport' && (
          <div id="printable-report">
            <div className="flex justify-between items-end mb-6 border-b pb-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 uppercase">
                  Relatório de Treino (Equipa)
                </h1>
                <p className="text-gray-600 font-bold text-lg">
                  AF Porto - Sub 19
                </p>
              </div>
              <div className="no-print flex space-x-2">
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="p-2 border rounded font-bold"
                />
                <button
                  onClick={handlePrint}
                  className="bg-gray-800 text-white px-4 py-2 rounded font-bold hover:bg-black"
                >
                  🖨️ Gerar PDF
                </button>
              </div>
              {/* Data que só aparece na impressão */}
              <div className="hidden print:block text-xl font-bold text-blue-800">
                Data: {reportDate}
              </div>
            </div>

            {evalsOnDate.length === 0 ? (
              <p className="text-gray-500 no-print">
                Não há avaliações registadas para este dia.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead className="bg-blue-900 text-white print-bg">
                    <tr>
                      <th className="py-3 px-4 text-left border-b">Atleta</th>
                      <th className="py-3 px-4 text-center border-b">Nota</th>
                      <th className="py-3 px-4 text-left border-b">
                        Aspetos Fortes
                      </th>
                      <th className="py-3 px-4 text-left border-b">
                        A Melhorar
                      </th>
                      <th className="py-3 px-4 text-left border-b">Obs.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evalsOnDate.map((ev) => {
                      const player = players.find((p) => p.id === ev.playerId);
                      return (
                        <tr key={ev.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 font-bold border-r">
                            {player?.name || 'N/D'}{' '}
                            <span className="text-xs text-gray-500 block">
                              {player?.position}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-center border-r font-extrabold text-blue-600 text-lg">
                            {ev.performance}
                          </td>
                          <td className="py-2 px-4 text-sm border-r">
                            {ev.strengths}
                          </td>
                          <td className="py-2 px-4 text-sm border-r">
                            {ev.weaknesses}
                          </td>
                          <td className="py-2 px-4 text-sm">
                            {ev.observations}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: RELATÓRIO INDIVIDUAL */}
        {view === 'individualReport' && (
          <div id="printable-report">
            <div className="flex justify-between items-end mb-6 border-b pb-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 uppercase">
                  Evolução do Atleta
                </h1>
                <p className="text-gray-600 font-bold text-lg">
                  AF Porto - Sub 19
                </p>
              </div>
              <div className="no-print flex space-x-2">
                <select
                  value={reportPlayerId}
                  onChange={(e) => setReportPlayerId(e.target.value)}
                  className="p-2 border rounded font-bold"
                >
                  <option value="">Selecione o Atleta...</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handlePrint}
                  disabled={!reportPlayerId}
                  className="bg-gray-800 text-white px-4 py-2 rounded font-bold hover:bg-black disabled:opacity-50"
                >
                  🖨️ Gerar PDF
                </button>
              </div>
            </div>

            {!reportPlayerId ? (
              <p className="text-gray-500 no-print">
                Selecione um atleta acima para ver o relatório.
              </p>
            ) : evalsForPlayer.length === 0 ? (
              <p className="text-gray-500">
                Este atleta ainda não tem avaliações registadas.
              </p>
            ) : (
              <div>
                {/* Cabeçalho do Jogador */}
                {(() => {
                  const player = players.find((p) => p.id === reportPlayerId);
                  return player ? (
                    <div className="flex items-center gap-4 mb-6 bg-gray-100 p-4 rounded print-bg">
                      {player.photoUrl && (
                        <img
                          src={player.photoUrl}
                          alt="Foto"
                          className="w-16 h-16 rounded-full object-cover border-2 border-white"
                        />
                      )}
                      <div>
                        <h2 className="text-2xl font-bold">{player.name}</h2>
                        <p className="text-gray-700 font-semibold">
                          {player.position} | {player.age} anos | Pé{' '}
                          {player.preferredFoot}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}

                <div className="space-y-4">
                  {evalsForPlayer.map((ev) => (
                    <div
                      key={ev.id}
                      className="border-2 border-gray-200 rounded p-4 break-inside-avoid"
                    >
                      <div className="flex justify-between items-center border-b pb-2 mb-2">
                        <span className="font-bold text-lg">
                          Data: {ev.date}
                        </span>
                        <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded font-extrabold print-bg border border-blue-300">
                          Performance: {ev.performance}/10
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-bold text-green-700 border-b border-green-200 mb-1">
                            Fortes
                          </h4>
                          <p className="text-sm">{ev.strengths}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-red-700 border-b border-red-200 mb-1">
                            A Melhorar
                          </h4>
                          <p className="text-sm">{ev.weaknesses}</p>
                        </div>
                      </div>
                      {ev.observations && (
                        <div className="mt-2 pt-2 border-t">
                          <h4 className="font-bold text-gray-700">Obs:</h4>
                          <p className="text-sm italic">{ev.observations}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
