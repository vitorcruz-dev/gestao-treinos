export interface StaffMember {
  id: string;
  username: string;
  password?: string;
  name: string;
  age?: number;
  address?: string;
  phone?: string;
  role: string;
  must_change_password?: boolean;
}

export interface Team {
  id: string;
  year: string;
  club: string;
  name: string;
}

export interface WeightRecord {
  date: string;
  weight: number;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  age?: number | string;
  position: string;
  preferredFoot: string;
  birthDate?: string;
  notes?: string;
  photoUrl?: string;
  height?: number | string;
  weight?: number | string;
  weight_history?: WeightRecord[];
}

export interface IndividualEval {
  playerId: string;
  rating?: number;
  notes?: string;
  minutesPlayed?: number;
  status?: string; // 'titular' | 'suplente' | 'nao_utilizado' | 'nao_convocado'
  positives?: string;
  negatives?: string;
}

export interface MatchReport {
  id: string;
  teamId: string;
  date: string;
  opponent: string;
  oppTacticalSystem?: string;
  oppBehaviorWinning?: string;
  oppBehaviorLosing?: string;
  oppSubstitutions?: string;
  oppSetPieces?: string;
  oppFinalEval?: string;
  ownInitialSystem?: string;
  ownFinalSystem?: string;
  ownTeamPositives?: string;
  ownTeamNegatives?: string;
  goalsScored?: number | any[];
  goalsConceded?: number;
  individualEvals?: IndividualEval[];
}

export interface ExercisePlan {
  id?: string;
  title?: string;
  name?: string;
  duration?: string;
  description?: string;
  board_image?: string;
}

export interface TrainingPlan {
  id: string;
  teamId: string;
  date: string;
  theme: string;
  exercises?: ExercisePlan[];
  finalAppreciation?: string;
  board_image?: string;
}

export interface TrainingEvaluation {
  id?: string;
  teamId?: string;
  date: string;
  playerId?: string;
  playerName?: string;
  attendance?: string;
  intensity?: number;
  focus?: number;
  notes?: string;
  evaluations?: any[];
}

export interface FutureOpponentScouting {
  id: string;
  teamId: string;
  opponentName: string;
  observationDate: string;
  tacticalModel?: string;
  behaviorWinning?: string;
  behaviorLosing?: string;
  substitutionsImpact?: string;
  setPieces?: string;
  setPiecesPhotoUrl?: string;
  strengths?: string;
  weaknesses?: string;
  strongPlayers?: string;
  weakPlayers?: string;
  observations?: string;
}