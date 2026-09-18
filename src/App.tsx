import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './Dashboard';
import TrainingModule from './TrainingModule';
import MatchModule from './MatchModule';
import AdminModule from './AdminModule';
import PlayersModule from './PlayersModule';
import TacticalBoard from './TacticalBoard';
import StatsModule from './StatsModule';
import FutureScoutingModule from './FutureScoutingModule';
import Login from './Login';
import TeamSelection from './TeamSelection';
import { StaffMember, Player, MatchReport, FutureOpponentScouting, Team } from './types';

const initialStaff: StaffMember[] = [
  { id: 'admin-1', username: 'mister', password: '123', name: 'Treinador Principal', age: '40', address: 'Sede', phone: '912345678', role: 'Administrador' }
];

type TabType = 'dashboard' | 'training' | 'match' | 'future_scouting' | 'admin' | 'players' | 'tactics' | 'stats';
const TIMEOUT_MS = 15 * 60 * 1000; 

export default function App() {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  
  // Memória Global (todas as épocas/equipas)
  const [teams, setTeams] = useState<Team[]>([]);
  const [playersList, setPlayersList] = useState<Player[]>([]);
  const [matchReports, setMatchReports] = useState<MatchReport[]>([]); 
  const [futureReports, setFutureReports] = useState<FutureOpponentScouting[]>([]);
  
  // Estado de Sessão
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(() => {
    const savedUser = localStorage.getItem('scoutpro_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const updateActivity = useCallback(() => {
    if (currentUser) localStorage.setItem('scoutpro_last_activity', Date.now().toString());
  }, [currentUser]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setActiveTeam(null);
    localStorage.removeItem('scoutpro_user');
    localStorage.removeItem('scoutpro_last_activity');
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const intervalId = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem('scoutpro_last_activity') || '0', 10);
      if (Date.now() - lastActivity > TIMEOUT_MS) {
        handleLogout();
        alert('Sessão terminada por inatividade (mais de 15 minutos).');
      }
    }, 30000);
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity));
    return () => {
      clearInterval(intervalId);
      events.forEach(event => window.removeEventListener(event, updateActivity));
    };
  }, [currentUser, handleLogout, updateActivity]);

  const handleLogin = (user: string, pass: string) => {
    const u = staffList.find(x => x.username === user && x.password === pass);
    if (u) { 
      setCurrentUser(u); setLoginError(''); setActiveTeam(null);
      localStorage.setItem('scoutpro_user', JSON.stringify(u));
      localStorage.setItem('scoutpro_last_activity', Date.now().toString());
    } else setLoginError('Email ou palavra-passe incorretos.');
  };

  if (!currentUser) return <Login onLogin={handleLogin} error={loginError} />;
  const isAdmin = currentUser.role === 'Administrador';

  // Se o utilizador entrou mas não escolheu a equipa, mostra o ecrã de seleção
  if (!activeTeam) {
    return (
      <TeamSelection 
        teams={teams} 
        isAdmin={isAdmin} 
        onSelectTeam={(t) => { setActiveTeam(t); setActiveTab('dashboard'); }} 
        onCreateTeam={(t) => setTeams([...teams, t])}
        onLogout={handleLogout}
      />
    );
  }

  // Filtragem de dados EXCLUSIVA para a equipa selecionada
  const currentPlayers = playersList.filter(p => p.teamId === activeTeam.id);
  const currentMatchReports = matchReports.filter(r => r.teamId === activeTeam.id);
  const currentFutureReports = futureReports.filter(r => r.teamId === activeTeam.id);

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: '📊' },
    { id: 'players', label: 'Plantel', icon: '👕' },
    { id: 'training', label: 'Treinos', icon: '⚽' },
    { id: 'match', label: 'Nossos Jogos', icon: '🏆' },
    { id: 'future_scouting', label: 'Adversários', icon: '🔭' },
    { id: 'tactics', label: 'Tática', icon: '📋' },
    { id: 'stats', label: 'Estatísticas', icon: '📈' },
  ];

  if (isAdmin) menuItems.splice(1, 0, { id: 'admin', label: 'Staff', icon: '👥' });

  return (
    <div className="flex h-screen bg-[#0b1121] text-slate-200 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-72 bg-[#151c2c] border-r border-slate-800 flex-col z-20 shadow-2xl">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-black w-10 h-10 rounded-lg flex items-center justify-center shadow-lg border border-slate-800">
              <span className="text-white font-black text-sm">SP<span className="text-blue-500">.</span></span>
            </div>
            <button onClick={() => setActiveTeam(null)} className="text-[10px] uppercase font-bold text-slate-500 hover:text-white bg-slate-800 px-2 py-1 rounded">Trocar Equipa</button>
          </div>
          <h1 className="text-lg font-black text-white tracking-tight leading-tight">{activeTeam.club}</h1>
          <p className="text-xs text-blue-400 mt-1 uppercase tracking-widest font-bold">{activeTeam.name} • {activeTeam.year}</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-4">Menu</div>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 text-sm ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="text-lg opacity-80">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">{currentUser.name.charAt(0)}</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[11px] text-slate-400 truncate uppercase tracking-wider">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-[#151c2c] border-b border-slate-800 px-4 md:px-8 py-4 flex justify-between items-center z-10 shadow-md">
          <div className="flex items-center gap-2 md:hidden">
             <div className="bg-black w-8 h-8 rounded-lg flex items-center justify-center border border-slate-800"><span className="text-white font-black text-xs">SP<span className="text-blue-500">.</span></span></div>
             <div className="flex flex-col">
               <h1 className="text-sm font-black text-white leading-none">{activeTeam.club}</h1>
               <span className="text-[9px] text-slate-400">{activeTeam.year}</span>
             </div>
          </div>
          <div className="hidden md:block"><h2 className="text-xl font-bold text-white">{menuItems.find(m => m.id === activeTab)?.label}</h2></div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTeam(null)} className="md:hidden px-3 py-2 rounded-lg font-bold text-xs bg-slate-800 text-slate-300">Trocar</button>
            <button onClick={handleLogout} className="px-4 py-2 rounded-lg font-bold text-xs md:text-sm bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20">Sair</button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 text-slate-900 pb-24 md:pb-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto" key={activeTeam.id}>
            {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
            {activeTab === 'admin' && isAdmin && <AdminModule staff={staffList} onAddStaff={s => setStaffList([...staffList, s])} />}
            {activeTab === 'players' && <PlayersModule players={currentPlayers} onAddPlayer={p => setPlayersList([...playersList, { ...p, teamId: activeTeam.id }])} />}
            {activeTab === 'training' && <TrainingModule players={currentPlayers} />}
            {activeTab === 'match' && <MatchModule players={currentPlayers} reports={currentMatchReports} onAddReport={r => setMatchReports([{ ...r, teamId: activeTeam.id }, ...matchReports])} />}
            {activeTab === 'future_scouting' && <FutureScoutingModule reports={currentFutureReports} onAddReport={r => setFutureReports([{ ...r, teamId: activeTeam.id }, ...futureReports])} />}
            {activeTab === 'tactics' && <TacticalBoard players={currentPlayers} />}
            {activeTab === 'stats' && <StatsModule players={currentPlayers} reports={currentMatchReports} />}
          </div>
        </main>

        {/* BOTTOM NAV MOBILE */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#151c2c] border-t border-slate-800 z-50 px-2 py-2 flex justify-between items-center overflow-x-auto custom-scrollbar shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
           {menuItems.map(item => (
             <button key={item.id} onClick={() => setActiveTab(item.id as TabType)} className={`flex flex-col items-center justify-center min-w-[55px] p-2 rounded-xl transition-all ${activeTab === item.id ? 'text-blue-500 bg-blue-500/10' : 'text-slate-400'}`}>
               <span className="text-xl mb-1">{item.icon}</span><span className="text-[9px] font-bold tracking-wider uppercase truncate max-w-full">{item.label.split(' ')[0]}</span>
             </button>
           ))}
        </nav>
      </div>
    </div>
  );
}