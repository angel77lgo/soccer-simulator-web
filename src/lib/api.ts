import axios from 'axios';
import type { GroupMatch, StandingRow } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api/v1',
});

export const getTeams = async () => {
  const res = await api.get('/teams');
  return res.data;
};

export const getClubs = async (confed?: string) => {
  const query = confed ? `?confed=${confed}` : '';
  const res = await api.get(`/teams/clubs${query}`);
  return res.data;
};

export const getClubsByConfederation = async () => {
  const res = await api.get('/teams/clubs/by-confederation');
  return res.data as Record<string, Club[]>;
};

export const getClubConfederations = async () => {
  const res = await api.get('/teams/clubs/confederations');
  return res.data as string[];
};

export interface Club {
  id: string;
  name: string;
  shortName?: string;
  code: string;
  flagUrl?: string;
  country: string;
  league?: string;
  confederation?: string;
  simulationRating?: number;
}

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

export const getTournamentLeaguePhase = async (id: string) => {
  const res = await api.get(`/tournaments/${id}/league-phase`);
  return res.data as { standings: StandingRow[]; matches: GroupMatch[] };
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
