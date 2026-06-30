import axios from 'axios';

const defaultBaseURL =
  typeof window !== 'undefined'
    ? `${window.location.origin}/api/v1`
    : 'http://localhost:3005/api/v1';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || defaultBaseURL,
});

export const getTeams = async () => {
  const res = await api.get('/teams');
  return res.data;
};

export const getTournaments = async () => {
  const res = await api.get('/tournaments');
  return res.data;
};

export const getTemplates = async () => {
  const res = await api.get('/tournaments/templates');
  return res.data;
};

export const createTournament = async (data: { 
  name: string; 
  type: string; 
  subType?: string; 
  teamsCount: number; 
  teamIds: string[];
  hostIds?: string[];
  customQuotas?: Record<string, number>;
  groups?: string[][];
}) => {
  const res = await api.post('/tournaments', data);
  return res.data;
};

export const simulateMatch = async (homeId: string, awayId: string) => {
  const res = await api.post(`/simulation/simulate?homeId=${homeId}&awayId=${awayId}`);
  return res.data;
};

export const getTournamentStatus = async (id: string) => {
  const res = await api.get(`/tournaments/${id}/status`);
  return res.data;
};

export const getTournamentStandings = async (id: string) => {
  const res = await api.get(`/tournaments/${id}/standings`);
  return res.data;
};

export const getTournamentBracket = async (id: string) => {
  const res = await api.get(`/tournaments/${id}/bracket`);
  return res.data;
};

export const generateGroupMatches = async (id: string) => {
  const res = await api.post(`/tournaments/${id}/generate-matches`);
  return res.data;
};

export const simulateGroupStage = async (id: string) => {
  const res = await api.post(`/tournaments/${id}/simulate-groups`);
  return res.data;
};

export const generateKnockoutBracket = async (id: string) => {
  const res = await api.post(`/tournaments/${id}/generate-knockout`);
  return res.data;
};

export const simulateKnockoutRound = async (id: string, phase: string) => {
  const res = await api.post(`/tournaments/${id}/simulate-knockout/${phase}`);
  return res.data;
};

export const getTournamentGroupMatches = async (id: string) => {
  const res = await api.get(`/tournaments/${id}/group-matches`);
  return res.data;
};

export const deleteTournament = async (id: string) => {
  const res = await api.delete(`/tournaments/${id}`);
  return res.data;
};

export const updateMatchScore = async (matchId: string, data: {
  homeScore: number;
  awayScore: number;
  homeExtraScore?: number;
  awayExtraScore?: number;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
}) => {
  const res = await api.post(`/tournaments/matches/${matchId}`, data);
  return res.data;
};

export default api;
