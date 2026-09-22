import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase'; 
import Dashboard from './Dashboard';
import TrainingModule from './TrainingModule';
import TrainingPlannerModule from './TrainingPlannerModule';
import MatchModule from './MatchModule';
import AdminModule from './AdminModule';
import PlayersModule from './PlayersModule';
import TacticalBoard from './TacticalBoard';
import StatsModule from './StatsModule';
import FutureScoutingModule from './FutureScoutingModule';
import MyAccount from './MyAccount'; 
import Login from './Login';
import TeamSelection from './TeamSelection';
import { StaffMember, Player, MatchReport, FutureOpponentScouting, Team, TrainingPlan } from './types';

type TabType = 'dashboard' | 'training_plan' | 'training' | 'match' | 'future_scouting' | 'admin' | 'players' | 'tactics' | 'stats' | 'account';
const TIMEOUT_MS = 15 * 60 * 1000; 

const mapStaff = (row: any): StaffMember => ({ id: row.id, username: row.username, password: row.password, name: row.name, age: row.age, address: row.address, phone: row.phone, role: row.role });
const mapTeam = (row: any): Team => ({ id: row.id, year: row.year, club: row.club, name: row.name });
const mapPlayer = (row: any): Player => ({ id: row.id, teamId: row.team_id, name: row.name, age: row.age, position: row.position, preferredFoot: row.preferred_foot, birthDate: row.birth_date, notes: row.notes, photoUrl: row.photo_url });
const mapMatch = (row: any): MatchReport => ({ id: row.id, teamId: row.team_id, date: row.date, opponent: row.opponent, oppTacticalSystem: row.opp_tactical_system, oppBehaviorWinning: row.opp_behavior_winning, oppBehaviorLosing: row.opp_behavior_losing, oppSubstitutions: row.opp_substitutions, oppSetPieces: row.opp_set_pieces, oppFinalEval: row.opp_final_eval, ownInitialSystem: row.own_initial_system, ownFinalSystem: row.own_final_system, ownTeamPositives: row.own_team_positives, ownTeamNegatives: row.own_team_negatives, goalsScored: row.goals_scored, goalsConceded: row.goals_conceded, individualEvals: row.individual_evals });
const mapPlan = (row: any): TrainingPlan => ({ id: row.id, teamId: row.team_id, date: row.date, theme: row.theme, exercises: row.exercises, finalAppreciation: row.final_appreciation });
const mapScouting = (row: any): FutureOpponentScouting => ({ id: row.id, teamId: row.team_id, opponentName: row.opponent_name, observationDate: row.observation_date, tacticalModel: row.tactical_model, behaviorWinning: row.behavior_winning, behaviorLosing: row.behavior_losing, substitutionsImpact: row.substitutions_impact, setPieces: row.set_pieces, setPiecesPhotoUrl: row.set_pieces_photo_url, strengths: row.strengths, weaknesses: row.weaknesses, strongPlayers: row.strong_players, weakPlayers: row.weak_players, observations: row.observations });

export default function App() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [playersList, setPlayersList] = useState<Player[]>([]);
  const [matchReports, setMatchReports] = useState<MatchReport[]>([]); 
  const [futureReports, setFutureReports] = useState<FutureOpponentScouting[]>([]);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(() => {
    const savedUser = localStorage.getItem('scoutpro_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [pendingPasswordChangeUser, setPendingPasswordChangeUser] = useState<StaffMember | null>(null);
  const [loginError, setLoginError] = useState('');
  
  const [activeTeam, setActiveTeam] = useState<Team | null>(() => {
    const savedTeam = localStorage.getItem('scoutpro_active_team');
    return savedTeam ? JSON.parse(savedTeam) : null;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('scoutpro_sidebar_open');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('scoutpro_sidebar_open', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    if (activeTeam) {
      localStorage.setItem('scoutpro_active_team', JSON.stringify(activeTeam));
    } else {
      localStorage.removeItem('scoutpro_active_team');
    }
  }, [activeTeam]);

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const savedTab = localStorage.getItem('scoutpro_active_tab');
    return (savedTab as TabType) || 'dashboard';
  });
  
  const [tabHistory, setTabHistory] = useState<TabType[]>([activeTab]);

  useEffect(() => {
    localStorage.setItem('scoutpro_active_tab', activeTab);
    
    setTabHistory(prev => {
      if (prev[prev.length - 1] === activeTab) return prev;
      const newHistory = [...prev, activeTab];
      if (newHistory.length > 15) newHistory.shift(); 
      return newHistory;
    });
  }, [activeTab]);

  const handleGoBack = () => {
    setTabHistory(prev => {
      if (prev.length > 1) {
        const newHistory = [...prev];
        newHistory.pop(); 
        const previousTab = newHistory[newHistory.length - 1]; 
        setActiveTab(previousTab);
        return newHistory;
      }
      setActiveTab('dashboard'); 
      return ['dashboard'];
    });
  };

  useEffect(() => {
    supabase.from('staff').select('*').then(({ data }) => { if (data) setStaffList(data.map(mapStaff)); });
    if (currentUser) {
      supabase.from('teams').select('*').order('year', { ascending: false }).then(({ data }) => { if (data) setTeams(data.map(mapTeam)); });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!activeTeam) return;
    const loadTeamData = async () => {
      const [p, m, t, f] = await Promise.all([
        supabase.from('players').select('*').eq('team_id', activeTeam.id),
        supabase.from('match_reports').select('*').eq('team_id', activeTeam.id).order('date', { ascending: false }),
        supabase.from('training_plans').select('*').eq('team_id', activeTeam.id).order('date', { ascending: false }),
        supabase.from('future_scouting').select('*').eq('team_id', activeTeam.id).order('observation_date', { ascending: false })
      ]);
      if (p.data) setPlayersList(p.data.map(mapPlayer));
      if (m.data) setMatchReports(m.data.map(mapMatch));
      if (t.data) setTrainingPlans(t.data.map(mapPlan));
      if (f.data) setFutureReports(f.data.map(mapScouting));
    };
    loadTeamData();
  }, [activeTeam]);

  const updateActivity = useCallback(() => {
    if (currentUser) localStorage.setItem('scoutpro_last_activity', Date.now().toString());
  }, [currentUser]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null); setActiveTeam(null); setPendingPasswordChangeUser(null);
    localStorage.removeItem('scoutpro_user'); 
    localStorage.removeItem('scoutpro_last_activity');
    localStorage.removeItem('scoutpro_active_tab'); 
    localStorage.removeItem('scoutpro_active_team'); 
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const intervalId = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem('scoutpro_last_activity') || '0', 10);
      if (Date.now() - lastActivity > TIMEOUT_MS) { handleLogout(); alert('Sessão terminada por inatividade.'); }
    }, 30000);
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity));
    return () => { clearInterval(intervalId); events.forEach(event => window.removeEventListener(event, updateActivity)); };
  }, [currentUser, handleLogout, updateActivity]);

  const handleLogin = async (user: string, pass: string) => {
    const { data } = await supabase.from('staff').select('*').eq('username', user).eq('password', pass).single();
    if (data) { 
      const u = mapStaff(data);
      if (data.must_change_password) {
        setPendingPasswordChangeUser(u);
        setLoginError('');
      } else {
        setCurrentUser(u); setLoginError(''); setActiveTeam(null);
        localStorage.setItem('scoutpro_user', JSON.stringify(u));
        localStorage.setItem('scoutpro_last_activity', Date.now().toString());
      }
    } else setLoginError('Email ou palavra-passe incorretos.');
  };

  const handleForcePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p1 = fd.get('p1') as string;
    const p2 = fd.get('p2') as string;

    if (p1 !== p2) { alert("As senhas não coincidem!"); return; }
    if (p1.length < 6) { alert("A nova senha deve ter pelo menos 6 caracteres."); return; }

    if (pendingPasswordChangeUser) {
      const { error } = await supabase.from('staff').update({ password: p1, must_change_password: false }).eq('id', pendingPasswordChangeUser.id);
      if (!error) {
        const u = { ...pendingPasswordChangeUser, password: p1 };
        setCurrentUser(u); setPendingPasswordChangeUser(null);
        localStorage.setItem('scoutpro_user', JSON.stringify(u));
        localStorage.setItem('scoutpro_last_activity', Date.now().toString());
      } else { alert("Erro ao alterar senha: " + error.message); }
    }
  };

  if (pendingPasswordChangeUser) {
    return (
      <div className="flex h-screen bg-[#090e17] items-center justify-center p-4">
        <div className="bg-[#151c2c] border border-slate-800/60 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-slate-800/50 w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-700/50 shadow-sm mx-auto mb-4">
              <span className="text-white font-bold text-xl">SP<span className="text-blue-500">.</span></span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo(a), {pendingPasswordChangeUser.name.split(' ')[0]}</h2>
            <p className="text-slate-400 text-sm">Por questões de segurança, tem de definir uma nova palavra-passe para o seu primeiro acesso.</p>
          </div>
          
          <form onSubmit={handleForcePasswordSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nova Palavra-Passe</label>
              <input required type="password" name="p1" className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Confirmar Palavra-Passe</label>
              <input required type="password" name="p2" className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Repita a palavra-passe" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-lg shadow-md transition-colors text-sm mt-4">
              Guardar e Entrar
            </button>
          </form>
          <button onClick={() => setPendingPasswordChangeUser(null)} className="w-full text-center text-slate-500 text-xs hover:text-slate-300 mt-6 transition-colors">Voltar ao Login</button>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Login onLogin={handleLogin} error={loginError} />;
  const isAdmin = currentUser.role === 'Administrador';

  const handleCreateTeam = async (t: Team) => {
    const { data } = await supabase.from('teams').insert([{ year: t.year, club: t.club, name: t.name }]).select().single();
    if (data) setTeams([mapTeam(data), ...teams]);
  };

  const handleAddTrainingPlan = async (p: TrainingPlan) => {
    const payload = { team_id: activeTeam!.id, date: p.date, theme: p.theme, exercises: p.exercises, final_appreciation: p.finalAppreciation };
    const { data } = await supabase.from('training_plans').insert([payload]).select().single();
    if (data) setTrainingPlans([mapPlan(data), ...trainingPlans]);
  };

  const handleUpdateTrainingPlan = async (p: TrainingPlan) => {
    const payload = { date: p.date, theme: p.theme, exercises: p.exercises, final_appreciation: p.finalAppreciation };
    const { data } = await supabase.from('training_plans').update(payload).eq('id', p.id).select().single();
    if (data) {
      const updated = mapPlan(data);
      setTrainingPlans(trainingPlans.map(plan => plan.id === updated.id ? updated : plan));
    }
  };

  const handleAddMatchReport = async (r: MatchReport) => {
    const payload = {
      team_id: activeTeam!.id, date: r.date, opponent: r.opponent, opp_tactical_system: r.oppTacticalSystem, opp_behavior_winning: r.oppBehaviorWinning,
      opp_behavior_losing: r.oppBehaviorLosing, opp_substitutions: r.oppSubstitutions, opp_set_pieces: r.oppSetPieces, opp_final_eval: r.oppFinalEval,
      own_initial_system: r.ownInitialSystem, own_final_system: r.ownFinalSystem, own_team_positives: r.ownTeamPositives, own_team_negatives: r.ownTeamNegatives,
      goals_scored: r.goalsScored, goals_conceded: r.goalsConceded, individual_evals: r.individualEvals
    };
    const { data } = await supabase.from('match_reports').insert([payload]).select().single();
    if (data) setMatchReports([mapMatch(data), ...matchReports]);
  };

  const handleAddFutureReport = async (r: FutureOpponentScouting) => {
    const payload = {
      team_id: activeTeam!.id, opponent_name: r.opponentName, observation_date: r.observationDate, tactical_model: r.tacticalModel, behavior_winning: r.behaviorWinning,
      behavior_losing: r.behaviorLosing, substitutions_impact: r.substitutionsImpact, set_pieces: r.setPieces, set_pieces_photo_url: r.setPiecesPhotoUrl,
      strengths: r.strengths, weaknesses: r.weaknesses, strong_players: r.strongPlayers, weak_players: r.weakPlayers, observations: r.observations
    };
    const { data } = await supabase.from('future_scouting').insert([payload]).select().single();
    if (data) setFutureReports([mapScouting(data), ...futureReports]);
  };

  if (!activeTeam) {
    return <TeamSelection teams={teams} isAdmin={isAdmin} onSelectTeam={(t) => setActiveTeam(t)} onCreateTeam={handleCreateTeam} onLogout={handleLogout} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: '📊' },
    { id: 'players', label: 'Plantel', icon: '👕' },
    { id: 'training_plan', label: 'Planear Treino', icon: '📝' },
    { id: 'training', label: 'Avaliar Treino', icon: '⚽' },
    { id: 'match', label: 'Nossos Jogos', icon: '🏆' },
    { id: 'future_scouting', label: 'Adversários', icon: '🔭' },
    { id: 'tactics', label: 'Tática', icon: '📋' },
    { id: 'stats', label: 'Estatísticas', icon: '📈' },
    { id: 'account', label: 'Minha Conta', icon: '👤' },
  ];

  if (isAdmin) menuItems.splice(1, 0, { id: 'admin', label: 'Staff', icon: '👥' });

  return (
    <div className="flex h-screen bg-[#090e17] text-slate-200 font-sans overflow-hidden">
      
      {/* BARRA LATERAL COM A CORREÇÃO DE OVERFLOW (Agora esconde o texto ao fechar) */}
      <aside className={`hidden md:flex bg-[#0f1523] flex-col z-20 shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'w-64 border-r border-slate-800/60 opacity-100' : 'w-0 border-none opacity-0'}`}>
        {/* A largura fixa de w-64 aqui garante que o layout interno nunca é esmagado */}
        <div className="w-64 flex flex-col h-screen">
          <div className="p-6 border-b border-slate-800/60 shrink-0">
            <div className="flex items-center justify-between mb-5">
              <div className="bg-slate-800/50 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-700/50 shadow-sm"><span className="text-white font-bold text-[11px]">SP<span className="text-blue-500">.</span></span></div>
              <button onClick={() => setActiveTeam(null)} className="text-[10px] uppercase font-semibold text-slate-500 hover:text-slate-300 transition-colors tracking-wider">Trocar Equipa</button>
            </div>
            <h1 className="text-base font-semibold text-white tracking-tight leading-tight truncate">{activeTeam.club}</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-medium">{activeTeam.name} • {activeTeam.year}</p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Menu Principal</div>
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id as TabType)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${activeTab === item.id ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'}`}>
                <span className="text-base opacity-80">{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>

          <div className="p-5 border-t border-slate-800/60 bg-[#0f1523] shrink-0">
            <div 
              onClick={() => setActiveTab('account')}
              className="flex items-center gap-3 bg-slate-800/30 p-3 rounded-xl border border-slate-700/30 cursor-pointer hover:bg-slate-800/60 hover:border-slate-600/50 transition-all"
              title="Ir para as Definições da Conta"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">{currentUser.name.charAt(0)}</div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-[9px] text-slate-400 truncate uppercase tracking-widest mt-0.5">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-[#0f1523]/80 backdrop-blur-md border-b border-slate-800/60 px-4 md:px-8 py-3.5 flex justify-between items-center z-10 sticky top-0">
          
          <div className="flex items-center gap-3 md:hidden">
             {activeTab !== 'dashboard' && (
               <button onClick={handleGoBack} className="bg-slate-800/50 w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 border border-slate-700/50 active:bg-slate-700 transition-colors">
                 <span className="font-medium text-base leading-none mb-0.5">←</span>
               </button>
             )}
             <div className="bg-slate-800/50 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-700/50"><span className="text-white font-bold text-[10px]">SP<span className="text-blue-500">.</span></span></div>
             <div className="flex flex-col"><h1 className="text-xs font-semibold text-white leading-none truncate max-w-[120px]">{activeTeam.club}</h1><span className="text-[8px] text-slate-400 uppercase tracking-widest mt-0.5">{activeTeam.year}</span></div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700" title="Alternar Menu">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
             
             {activeTab !== 'dashboard' && (
               <button onClick={handleGoBack} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700" title="Voltar atrás">
                 <span className="font-medium text-lg leading-none mb-0.5">←</span>
               </button>
             )}
            <h2 className="text-lg font-semibold text-white tracking-wide">{menuItems.find(m => m.id === activeTab)?.label}</h2>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTeam(null)} className="md:hidden px-3 py-1.5 rounded-lg font-medium text-[10px] uppercase tracking-wider bg-slate-800/50 text-slate-300 border border-slate-700/50">Trocar</button>
            <button onClick={handleLogout} className="px-4 py-1.5 rounded-lg font-medium text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-colors">Terminar Sessão</button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 text-slate-200 pb-24 md:pb-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto" key={activeTeam.id}>
            {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
            {activeTab === 'admin' && isAdmin && <AdminModule />}
            {activeTab === 'players' && <PlayersModule />}
            {activeTab === 'training_plan' && <TrainingPlannerModule plans={trainingPlans} onAddPlan={handleAddTrainingPlan} onUpdatePlan={handleUpdateTrainingPlan} />}
            {activeTab === 'training' && <TrainingModule players={playersList} />}
            {activeTab === 'match' && <MatchModule players={playersList} reports={matchReports} onAddReport={handleAddMatchReport} />}
            {activeTab === 'future_scouting' && <FutureScoutingModule reports={futureReports} onAddReport={handleAddFutureReport} />}
            {activeTab === 'tactics' && <TacticalBoard players={playersList} />}
            {activeTab === 'stats' && <StatsModule players={playersList} reports={matchReports} />}
            {activeTab === 'account' && <MyAccount />}
          </div>
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f1523]/95 backdrop-blur-lg border-t border-slate-800/60 z-50 px-2 py-2 flex justify-between items-center overflow-x-auto custom-scrollbar shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
           {menuItems.map(item => (
             <button key={item.id} onClick={() => setActiveTab(item.id as TabType)} className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'text-blue-400 bg-blue-600/10' : 'text-slate-500'}`}>
               <span className={`text-xl mb-1 transition-transform ${activeTab === item.id ? 'scale-110' : 'scale-100'}`}>{item.icon}</span>
               <span className="text-[9px] font-semibold tracking-wider uppercase truncate max-w-full">{item.label.split(' ')[0]}</span>
             </button>
           ))}
        </nav>
      </div>
    </div>
  );
}