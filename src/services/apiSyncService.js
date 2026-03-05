/**
 * API Data & Sync Center – Admin only.
 * Leagues, Teams, Players, Standings, Fixtures (upcoming & past), Match results/scores + Manual Sync / Force Refresh / Re-fetch match.
 */

import { apiGet, apiPost, apiPatch } from './apiBase';

const BASE = '/admin/api-sync';

/** Leagues from database (all leagues, no limit). Use syncLeaguesFromApi() to fetch from Football API and save. */
export const getApiLeagues = async () => {
  const res = await apiGet(`${BASE}/leagues`);
  const raw = res.data?.leagues ?? res.data;
  const list = Array.isArray(raw) ? raw : (Array.isArray(res.data) ? res.data : []);
  return res.success ? { success: true, data: list } : { success: false, error: res.error, data: [] };
};

/** Trigger league sync from Football API in background (no duplicates). Returns immediately. */
export const syncLeaguesFromApi = async () => {
  const res = await apiPost(`${BASE}/sync-leagues`, {});
  return res.success ? { success: true, message: res.message } : { success: false, error: res.error || res.message };
};

/** Set league Use (true) or Don't use (false). Only "Use" leagues are fetched for teams, players, fixtures. */
export const setLeagueUse = async (leagueId, use) => {
  const res = await apiPatch(`${BASE}/leagues/${leagueId}/use`, { use: !!use });
  return res.success ? { success: true, data: res.data } : { success: false, error: res.error || res.message };
};

export const getApiStandings = async (league, season) => {
  if (!league || !season) return { success: false, error: 'League ID and Season are required', data: [] };
  const res = await apiGet(`${BASE}/standings`, { league, season });
  const raw = res.data?.standings ?? res.data;
  const list = Array.isArray(raw) ? raw : [];
  return res.success ? { success: true, data: list } : { success: false, error: res.error, data: [] };
};

/** Fixtures: from DB by default (fast). Pass source: 'api' to load from Football API. */
export const getApiFixtures = async (params = {}) => {
  const { league, season, date, status, source } = params;
  if (!league || !season) return { success: false, error: 'League ID and Season are required', data: [] };
  const query = { league, season };
  if (date) query.date = date;
  if (status) query.status = status;
  if (source) query.source = source;
  const res = await apiGet(`${BASE}/fixtures`, query);
  const raw = res.data?.fixtures ?? res.data;
  const list = Array.isArray(raw) ? raw : [];
  return res.success ? { success: true, data: list } : { success: false, error: res.error, data: [] };
};

/** Teams from database (fast). Use syncTeamsFromApi(league, season) to update from API in background. */
export const getApiTeams = async (league, season) => {
  if (!league || !season) return { success: false, error: 'League ID and Season are required', data: [] };
  const res = await apiGet(`${BASE}/teams`, { league, season });
  const raw = res.data?.teams ?? res.data;
  const list = Array.isArray(raw) ? raw : [];
  return res.success ? { success: true, data: list } : { success: false, error: res.error, data: [] };
};

/** Trigger team sync from Football API in background. Body: { league, season }. */
export const syncTeamsFromApi = async (league, season) => {
  if (!league || !season) return { success: false, error: 'League and season are required' };
  const res = await apiPost(`${BASE}/sync-teams`, { league, season });
  return res.success ? { success: true, message: res.message } : { success: false, error: res.error || res.message };
};

/** Players from database (fast). Use syncPlayersFromApi(team) to update from API in background. */
export const getApiPlayers = async (team) => {
  if (team == null || team === '') return { success: false, error: 'API Team ID is required', data: [] };
  const res = await apiGet(`${BASE}/players`, { team });
  const raw = res.data?.players ?? res.data;
  const list = Array.isArray(raw) ? raw : [];
  return res.success ? { success: true, data: list } : { success: false, error: res.error, data: [] };
};

/** Trigger player sync from Football API in background. Body: { team }. */
export const syncPlayersFromApi = async (team) => {
  if (team == null || team === '') return { success: false, error: 'API Team ID is required' };
  const res = await apiPost(`${BASE}/sync-players`, { team });
  return res.success ? { success: true, message: res.message } : { success: false, error: res.error || res.message };
};

export const getApiEvents = async (fixture) => {
  if (fixture == null || fixture === '') return { success: false, error: 'API Fixture ID is required', data: [] };
  const res = await apiGet(`${BASE}/events`, { fixture });
  const raw = res.data?.events ?? res.data;
  const list = Array.isArray(raw) ? raw : [];
  return res.success ? { success: true, data: list } : { success: false, error: res.error, data: [] };
};

export const manualSync = async () => {
  const res = await apiPost(`${BASE}/sync-now`);
  return res;
};

export const forceRefresh = async () => {
  const res = await apiPost(`${BASE}/force-refresh`);
  return res;
};

export const refetchMatchData = async (apiFixtureId) => {
  if (apiFixtureId == null) return { success: false, error: 'apiFixtureId is required' };
  const res = await apiPost(`${BASE}/fixture`, { apiFixtureId: Number(apiFixtureId) });
  return res;
};
