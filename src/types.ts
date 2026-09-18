export type UserRole =
  | 'Administrador'
  | 'Treinador Adjunto'
  | 'Treinador de Guarda Redes'
  | 'Observador'
  | 'Preparador Físico';

export interface StaffMember {
  id: string;
  username: string;
  password?: string;
  name: string;
  age: string;
  address: string;
  phone: string;
  role: UserRole;
}

export interface Player {
  id: string;
  name: string;
  age: string;
  position: 'GR' | 'DEF' | 'MED' | 'AVA';
  preferredFoot: 'Direito' | 'Esquerdo' | 'Ambidestro';
  birthDate: string;
  notes: string;
  photoUrl?: string;
}

export interface TrainingEvaluation {
  id: string;
  playerId: string;
  date: string;
  performance: number;
  strengths: string;
  weaknesses: string;
  observations: string;
}

export interface IndividualMatchEval {
  playerId: string;
  minutesPlayed: number; // NOVO CAMPO
  rating: number;
  positives: string;
  negatives: string;
}

export interface GoalScored {
  id: string;
  minute: number;
  scorerId: string;
  assistId?: string;
}

export interface GoalConceded {
  id: string;
  minute: number;
  corridor: 'Direito' | 'Centro' | 'Esquerdo';
}

export interface MatchReport {
  id: string;
  date: string;
  opponent: string;
  oppTacticalSystem: string;
  oppBehaviorWinning: string;
  oppBehaviorLosing: string;
  oppSubstitutions: string;
  oppSetPieces: string;
  oppFinalEval: string;
  ownInitialSystem: string;
  ownFinalSystem: string;
  ownTeamPositives: string;
  ownTeamNegatives: string;
  goalsScored: GoalScored[];
  goalsConceded: GoalConceded[];
  individualEvals: IndividualMatchEval[];
}
