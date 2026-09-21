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
import Login from './Login';
import TeamSelection from './TeamSelection';
import { StaffMember, Player, MatchReport, FutureOpponentScouting, Team, TrainingPlan } from './types';

type TabType = 'dashboard' | 'training_plan' | 'training' | 'match' | 'future_scouting' | 'admin' | 'players' | 'tactics' | 'stats';
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
  
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

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
    setCurrentUser(null); setActiveTeam(null);
    localStorage.removeItem('scoutpro_user'); localStorage.removeItem('scoutpro_last_activity');
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
      setCurrentUser(u); setLoginError(''); setActiveTeam(null);
      localStorage.setItem('scoutpro_user', JSON.stringify(u));
      localStorage.setItem('scoutpro_last_activity', Date.now().toString());
    } else setLoginError('Email ou palavra-passe incorretos.');
  };

  if (!currentUser) return <Login onLogin={handleLogin} error={loginError} />;
  const isAdmin = currentUser.role === 'Administrador';

  const handleCreateTeam = async (t: Team) => {
    const { data } = await supabase.from('teams').insert([{ year: t.year, club: t.club, name: t.name }]).select().single();
    if (data) setTeams([mapTeam(data), ...teams]);
  };

  const handleAddStaff = async (s: StaffMember) => {
    const payload = { username: s.username, password: s.password, name: s.name, age: s.age, address: s.address, phone: s.phone, role: s.role };
    const { data } = await supabase.from('staff').insert([payload]).select().single();
    if (data) setStaffList([...staffList, mapStaff(data)]);
  };

  const handleAddPlayer = async (p: Player) => {
    const payload = { team_id: activeTeam!.id, name: p.name, age: p.age, position: p.position, preferred_foot: p.preferredFoot, birth_date: p.birthDate, notes: p.notes, photo_url: p.photoUrl };
    const { data } = await supabase.from('players').insert([payload]).select().single();
    if (data) setPlayersList([mapPlayer(data), ...playersList]);
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
    return <TeamSelection teams={teams} isAdmin={isAdmin} onSelectTeam={(t) => { setActiveTeam(t); setActiveTab('dashboard'); }} onCreateTeam={handleCreateTeam} onLogout={handleLogout} />;
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
  ];

  if (isAdmin) menuItems.splice(1, 0, { id: 'admin', label: 'Staff', icon: '👥' });

  return (
    <div className="flex h-screen bg-[#0b1121] text-slate-200 font-sans overflow-hidden">
      
      <aside className="hidden md:flex w-72 bg-[#151c2c] border-r border-slate-800 flex-col z-20 shadow-2xl">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-black w-10 h-10 rounded-lg flex items-center justify-center shadow-lg border border-slate-800"><span className="text-white font-black text-sm">SP<span className="text-blue-500">.</span></span></div>
            <button onClick={() => setActiveTeam(null)} className="text-[10px] uppercase font-bold text-slate-500 hover:text-white bg-slate-800 px-2 py-1 rounded">Trocar Equipa</button>
          </div>
          <h1 className="text-lg font-black text-white tracking-tight leading-tight">{activeTeam.club}</h1>
          <p className="text-xs text-blue-400 mt-1 uppercase tracking-widest font-bold">{activeTeam.name} • {activeTeam.year}</p>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-3">Menu</div>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as TabType)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
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

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-[#151c2c] border-b border-slate-800 px-4 md:px-8 py-4 flex justify-between items-center z-10 shadow-md">
          <div className="flex items-center gap-2 md:hidden">
             <div className="bg-black w-8 h-8 rounded-lg flex items-center justify-center border border-slate-800"><span className="text-white font-black text-xs">SP<span className="text-blue-500">.</span></span></div>
             <div className="flex flex-col"><h1 className="text-sm font-black text-white leading-none">{activeTeam.club}</h1><span className="text-[9px] text-slate-400">{activeTeam.year}</span></div>
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
            {activeTab === 'admin' && isAdmin && <AdminModule staff={staffList} onAddStaff={handleAddStaff} />}
            {activeTab === 'players' && <PlayersModule players={playersList} onAddPlayer={handleAddPlayer} />}
            {activeTab === 'training_plan' && <TrainingPlannerModule plans={trainingPlans} onAddPlan={handleAddTrainingPlan} onUpdatePlan={handleUpdateTrainingPlan} />}
            {activeTab === 'training' && <TrainingModule players={playersList} />}
            {activeTab === 'match' && <MatchModule players={playersList} reports={matchReports} onAddReport={handleAddMatchReport} />}
            {activeTab === 'future_scouting' && <FutureScoutingModule reports={futureReports} onAddReport={handleAddFutureReport} />}
            {activeTab === 'tactics' && <TacticalBoard players={playersList} />}
            {activeTab === 'stats' && <StatsModule players={playersList} reports={matchReports} />}
          </div>
        </main>

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