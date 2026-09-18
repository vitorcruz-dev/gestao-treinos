import React, { useState } from 'react';

interface DashboardProps {
  onNavigate: (tab: 'training' | 'match') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Gerar os blocos do calendário
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  // Identificar o tipo de evento com base no dia da semana (0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb)
  const getEventType = (dayNumber: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      dayNumber
    );
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4) return 'Treino';
    if (dayOfWeek === 6) return 'Jogo';
    return null;
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-extrabold text-gray-800">
          Painel Inicial (Calendário)
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={prevMonth}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200 font-bold"
          >
            &larr; Mês Anterior
          </button>
          <span className="text-xl font-bold text-blue-900 w-48 text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200 font-bold"
          >
            Mês Seguinte &rarr;
          </button>
        </div>
      </div>

      {/* Cabeçalho dos Dias da Semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-bold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grelha do Calendário */}
      <div className="grid grid-cols-7 gap-2">
        {blanks.map((blank) => (
          <div
            key={`blank-${blank}`}
            className="p-4 rounded bg-gray-50 border border-transparent"
          ></div>
        ))}

        {days.map((day) => {
          const event = getEventType(day);
          const currentIsToday = isToday(day);

          return (
            <div
              key={day}
              className={`min-h-[100px] p-2 border rounded flex flex-col ${
                currentIsToday
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200'
              } hover:bg-gray-50 transition`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                    currentIsToday ? 'bg-blue-600 text-white' : 'text-gray-700'
                  }`}
                >
                  {day}
                </span>
              </div>

              {/* Eventos Marcados Automaticamente */}
              {event === 'Treino' && (
                <button
                  onClick={() => onNavigate('training')}
                  className="mt-auto w-full text-left text-xs bg-blue-100 text-blue-800 p-1.5 rounded font-bold hover:bg-blue-200"
                >
                  ⚽ Treino (19:00)
                </button>
              )}
              {event === 'Jogo' && (
                <button
                  onClick={() => onNavigate('match')}
                  className="mt-auto w-full text-left text-xs bg-green-100 text-green-800 p-1.5 rounded font-bold hover:bg-green-200"
                >
                  🏆 Jogo Oficial
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
