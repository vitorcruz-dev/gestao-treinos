import React, { useState } from 'react';
import { Team } from './types';

interface TeamSelectionProps {
  teams: Team[];
  isAdmin: boolean;
  onSelectTeam: (team: Team) => void;
  onCreateTeam: (team: Team) => void;
  onLogout: () => void;
}

export default function TeamSelection({ teams, isAdmin, onSelectTeam, onCreateTeam, onLogout }: TeamSelectionProps) {
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTeam: Team = {
      id: Date.now().toString(),
      year: formData.get('year') as string,
      club: formData.get('club') as string,
      name: formData.get('name') as string,
    };
    onCreateTeam(newTeam);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#0b1121] text-slate-200 font-sans p-6 md:p-12 flex flex-col items-center">
      
      <div className="w-full max-w-5xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-black w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-slate-800">
            <span className="text-white font-black text-xl">SP<span className="text-blue-500">.</span></span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">ScoutPro</h1>
        </div>
        <button onClick={onLogout} className="px-4 py-2 rounded-lg font-bold text-sm bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all">
          Sair
        </button>
      </div>

      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-3xl font-black text-white">Selecionar Equipa / Época</h2>
            <p className="text-slate-500 mt-2">Escolha o ambiente de trabalho que pretende aceder.</p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-colors"
            >
              {showForm ? 'Cancelar' : '+ Criar Nova Equipa'}
            </button>
          )}
        </div>

        {showForm && isAdmin && (
          <form onSubmit={handleSubmit} className="bg-[#151c2c] p-6 rounded-2xl border border-slate-800 mb-8 shadow-xl animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Época (Ano)</label>
                <input type="text" name="year" required placeholder="Ex: 2026/2027" className="w-full p-3 bg-[#0b1121] border border-slate-700 rounded-xl text-white focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Clube</label>
                <input type="text" name="club" required placeholder="Ex: FC Porto" className="w-full p-3 bg-[#0b1121] border border-slate-700 rounded-xl text-white focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Escalão / Nome</label>
                <input type="text" name="name" required placeholder="Ex: Sub-19" className="w-full p-3 bg-[#0b1121] border border-slate-700 rounded-xl text-white focus:border-blue-500 outline-none" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-colors">
                Gravar Equipa
              </button>
            </div>
          </form>
        )}

        {teams.length === 0 ? (
          <div className="text-center py-20 bg-[#151c2c] rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-lg">Nenhuma equipa registada no sistema.</p>
            {isAdmin && <p className="text-blue-500 font-bold mt-2 cursor-pointer hover:underline" onClick={() => setShowForm(true)}>Crie a sua primeira equipa e época acima.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => (
              <div 
                key={team.id} 
                onClick={() => onSelectTeam(team)}
                className="bg-[#151c2c] border border-slate-700 hover:border-blue-500 p-6 rounded-2xl cursor-pointer hover:bg-slate-800 transition-all group shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-slate-800 text-blue-400 text-xs font-black px-3 py-1 rounded-lg tracking-widest">{team.year}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mb-1">{team.club}</h3>
                <p className="text-slate-400 font-bold">{team.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}