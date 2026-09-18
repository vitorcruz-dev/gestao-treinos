import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './Dashboard';
import TrainingModule from './TrainingModule';
import MatchModule from './MatchModule';
import AdminModule from './AdminModule';
import PlayersModule from './PlayersModule';
import TacticalBoard from './TacticalBoard';
import StatsModule from './StatsModule';
import Login from './Login';
import { StaffMember, Player, MatchReport } from './types';

const initialStaff: StaffMember[] = [
  { id: 'admin-1', username: 'mister', password: '123', name: 'Treinador Principal', age: '40', address: 'Estádio', phone: '912345678', role: 'Administrador' }
];

type TabType = 'dashboard' | 'training' | 'match' | 'admin' | 'players' | 'tactics' | 'stats';

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos em milissegundos

export default function App() {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [playersList, setPlayersList] = useState<Player[]>([]);
  const [matchReports, setMatchReports] = useState<MatchReport[]>([]); 
  
  // Inicia o utilizador verificando a memória do navegador
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(() => {
    const savedUser = localStorage.getItem('scoutpro_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Atualiza a última atividade
  const updateActivity = useCallback(() => {
    if (currentUser) {
      localStorage.setItem('scoutpro_last_activity', Date.now().toString());
    }
  }, [currentUser]);

  // Função central de Logout
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('scoutpro_user');
    localStorage.removeItem('scoutpro_last_activity');
  }, []);

  // Gestor de Inatividade (15 minutos)
  useEffect(() => {
    if (!currentUser) return;

    // Verifica de 30 em 30 segundos se já passaram os 15 minutos
    const intervalId = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem('scoutpro_last_activity') || '0', 10);
      if (Date.now() - lastActivity > TIMEOUT_MS) {
        handleLogout();
        alert('Sessão terminada por inatividade (mais de 15 minutos).');
      }
    }, 30000);

    // Deteta qualquer ação do utilizador para reiniciar o tempo
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
      setCurrentUser(u); 
      setLoginError(''); 
      setActiveTab('dashboard');
      // Guarda o login na memória
      localStorage.setItem('scoutpro_user', JSON.stringify(u));
      localStorage.setItem('scoutpro_last_activity', Date.now().toString());
    }
    else setLoginError('Email ou palavra-passe incorretos.');
  };

  if (!currentUser) return <Login onLogin={handleLogin} error={loginError} />;
  const isAdmin = currentUser.role === 'Administrador';

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: '📊' },
    { id: 'players', label: 'Plantel', icon: '👕' },
    { id: 'training', label: 'Treinos', icon: '⚽' },
    { id: 'match', label: 'Jogos', icon: '🏆' },
    { id: 'tactics', label: 'Tática', icon: '📋' },
    { id: 'stats', label: 'Estatísticas', icon: '📈' },
  ];

  if (isAdmin) menuItems.splice(1, 0, { id: 'admin', label: 'Staff', icon: '👥' });

  return (
    <div className="flex h-screen bg-[#0b1121] text-slate-200 font-sans overflow-hidden">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-72 bg-[#151c2c] border-r border-slate-800 flex-col z-20 shadow-2xl">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-black w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-slate-800">
              <span className="text-white font-black text-xl">SP<span className="text-blue-500">.</span></span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">ScoutPro</h1>
              <p className="text-[10px] text-blue-400 mt-0.5 uppercase tracking-widest font-bold">Sub-19 • AF Porto</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-4">Menu Principal</div>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 text-sm ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-lg opacity-80">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* PERFIL DESKTOP */}
        <div className="p-6 border-t border-slate-800 bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[11px] text-slate-400 truncate uppercase tracking-wider">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DA APLICAÇÃO */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* HEADER TOPO */}
        <header className="bg-[#151c2c] border-b border-slate-800 px-4 md:px-8 py-4 flex justify-between items-center z-10 shadow-md">
          
          <div className="flex items-center gap-2 md:hidden">
             <div className="bg-black w-8 h-8 rounded-lg flex items-center justify-center border border-slate-800">
                <span className="text-white font-black text-xs">SP<span className="text-blue-500">.</span></span>
             </div>
             <h1 className="text-lg font-black text-white">ScoutPro</h1>
          </div>

          <div className="hidden md:block">
            <h2 className="text-xl font-bold text-white">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="ml-auto px-4 py-2 rounded-lg font-bold text-xs md:text-sm bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
          >
            Sair
          </button>
        </header>

        {/* MÓDULOS */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 text-slate-900 pb-24 md:pb-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
            {activeTab === 'admin' && isAdmin && <AdminModule staff={staffList} onAddStaff={s => setStaffList([...staffList, s])} />}
            {activeTab === 'players' && <PlayersModule players={playersList} onAddPlayer={p => setPlayersList([...playersList, p])} />}
            {activeTab === 'training' && <TrainingModule players={playersList} />}
            {activeTab === 'match' && <MatchModule players={playersList} reports={matchReports} onAddReport={r => setMatchReports([r, ...matchReports])} />}
            {activeTab === 'tactics' && <TacticalBoard players={playersList} />}
            {activeTab === 'stats' && <StatsModule players={playersList} reports={matchReports} />}
          </div>
        </main>

        {/* BOTTOM NAV PARA TELEMÓVEIS */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#151c2c] border-t border-slate-800 z-50 px-2 py-2 flex justify-between items-center overflow-x-auto custom-scrollbar shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
           {menuItems.map(item => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id as TabType)}
               className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-xl transition-all ${
                 activeTab === item.id ? 'text-blue-500 bg-blue-500/10' : 'text-slate-400 hover:text-white'
               }`}
             >
               <span className="text-xl mb-1">{item.icon}</span>
               <span className="text-[9px] font-bold tracking-wider uppercase truncate max-w-full">
                 {item.label.split(' ')[0]}
               </span>
             </button>
           ))}
        </nav>
      </div>
    </div>
  );
}