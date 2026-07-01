export interface Team {
  id: string;
  name: string;
  shortName: string;
  fifaCode: string;
  flagUrl: string;
  confederationId: string;
  confederation?: {
    id: string;
    name: string;
    code: string;
  };
  fifaRanking?: number;
}

export interface Template {
  name: string;
  teamsCount: number;
  quotas: Record<string, number>;
}

export interface TournamentListItem {
  id: string;
  name: string;
  type: string;
  status: string;
  champion_name?: string;
  championCode?: string;
}

export interface StandingRow {
  position: number;
  teamId: string;
  teamName: string;
  teamCode: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface GroupData {
  groupId: string;
  groupName: string;
  standings: StandingRow[];
}

export interface GroupMatch {
  id: string;
  groupId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: string;
  homeCode: string;
  awayTeam: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
  winnerId: string | null;
  status: string;
  phase: string;
}

export interface BracketMatch {
  id: string;
  homeTeam: string;
  homeCode: string;
  awayTeam: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
  home_extra: number;
  away_extra: number;
  home_pen: number;
  away_pen: number;
  winnerId: string;
  status: string;
  bracket_position: number;
}

export interface TournamentData {
  id?: string;
  name: string;
  status: string;
  champion_name?: string | null;
  championCode?: string | null;
}

export interface MatchSaveData {
  homeScore: number;
  awayScore: number;
  homeExtraScore?: number;
  awayExtraScore?: number;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
}

export interface WizardState {
  step: number;
  name: string;
  type: "official" | "custom";
  subType: string;
  teamsCount: number | "";
  customQuotas: Record<string, number | "">;
  hostIds: string[];
  selectedTeamIds: string[];
  repechajeTeamIds: string[];
  drawMode: "auto" | "manual";
  manualGroups: Record<number, string[]>;
  potsOverride?: Record<string, number>;
}

export type TeamLocation =
  | { type: "pot"; potIndex: number }
  | { type: "group"; gIndex: number; sIndex: number };
