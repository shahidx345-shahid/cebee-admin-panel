/**
 * API Data & Sync Center – Admin only.
 * Leagues, Teams, Players, Standings, Fixtures (upcoming & past), Match results/scores + Manual Sync / Force Refresh / Re-fetch match.
 * Data Browser: hierarchical Leagues → League Detail (Teams, Fixtures, Standings) → Team Page (squad).
 */

import { apiGet, apiPost, apiPatch } from './apiBase';

const BASE = '/admin/api-sync';

/** Leagues from database with pagination (fast). Use limit/skip/q for quick load. Use syncLeaguesFromApi() to fetch from Football API and save. */
export const getApiLeagues = async (params = {}) => {
  const { limit = 150, skip = 0, q = '' } = params;
  const query = { limit, skip };
  if (q && String(q).trim()) query.q = String(q).trim();
  const res = await apiGet(`${BASE}/leagues`, query);
  const raw = res.data?.leagues ?? res.data;
  const list = Array.isArray(raw) ? raw : (Array.isArray(res.data) ? res.data : []);
  const total = res.data?.total != null ? res.data.total : list.length;
  return res.success ? { success: true, data: list, total } : { success: false, error: res.error, data: [], total: 0 };
};

/** League detail for Data Browser (overview + team count + season). id = MongoDB _id or apiLeagueId. */
export const getLeagueDetail = async (id) => {
  const res = await apiGet(`${BASE}/leagues/${id}`);
  if (!res.success) return { success: false, error: res.error || res.message };
  return { success: true, data: res.data };
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

/** Set league display order (0, 1, 2, 3…) or clear (pass null). Lower number = higher in list. */
export const setLeagueOrder = async (leagueId, order) => {
  const body = order == null ? { order: null } : { order: Number(order) };
  const res = await apiPatch(`${BASE}/leagues/${leagueId}/order`, body);
  return res.success ? { success: true, data: res.data } : { success: false, error: res.error || res.message };
};

/** Standings from database only. Pass season='all' to get all seasons (returns { data: [{ season, rows }, ...] }). */
export const getApiStandings = async (league, season) => {
  if (!league) return { success: false, error: 'League ID is required', data: [] };
  const res = await apiGet(`${BASE}/standings`, { league, season: season ?? 'all' });
  const raw = res.data?.standings ?? res.data;
  const list = Array.isArray(raw) ? raw : [];
  return res.success ? { success: true, data: list } : { success: false, error: res.error, data: [] };
};

/** Sync standings from Football API → save to DB. Pass allSeasons: true to sync all seasons (no season param needed). */
export const syncStandingsFromApi = async (league, season, allSeasons = false) => {
  if (league == null) return { success: false, error: 'League is required' };
  if (!allSeasons && season == null) return { success: false, error: 'Season is required (or use allSeasons: true)' };
  const res = await apiPost(`${BASE}/sync-standings`, allSeasons ? { league, allSeasons: true } : { league, season });
  return res.success ? { success: true, message: res.message } : { success: false, error: res.error || res.message };
};

/** Fixtures: from DB (LeagueFixture collection – API fixtures). Pass season='all' for no filter. */
export const getApiFixtures = async (params = {}) => {
  const { league, season, date, status, source } = params;
  if (!league) return { success: false, error: 'League ID is required', data: [] };
  const query = { league, season: season ?? 'all' };
  if (date) query.date = date;
  if (status) query.status = status;
  if (source) query.source = source;
  const res = await apiGet(`${BASE}/fixtures`, query);
  const raw = res.data?.fixtures ?? res.data;
  const list = Array.isArray(raw) ? raw : [];
  return res.success ? { success: true, data: list } : { success: false, error: res.error, data: [] };
};

/** Sync league fixtures from Football API into LeagueFixture collection (fetch → save → display). Pass allSeasons: true to sync all seasons. */
export const syncLeagueFixturesFromApi = async (league, season, allSeasons = false) => {
  if (!league) return { success: false, error: 'League is required' };
  if (!allSeasons && season == null) return { success: false, error: 'Season is required (or use allSeasons: true)' };
  const res = await apiPost(`${BASE}/sync-league-fixtures`, allSeasons ? { league, allSeasons: true } : { league, season });
  return res.success ? { success: true, message: res.message } : { success: false, error: res.error || res.message };
};

/** Teams from database (fast). Use syncTeamsFromApi(league, season) to update from API in background. */
export const getApiTeams = async (league, season) => {
  if (!league || !season) return { success: false, error: 'League ID and Season are required', data: [] };
  const res = await apiGet(`${BASE}/teams`, { league, season });
  const raw = res.data?.teams ?? res.data;
  const list = Array.isArray(raw) ? raw : [];
  return res.success ? { success: true, data: list } : { success: false, error: res.error, data: [] };
};

/** Teams by league (MongoDB league _id) for Data Browser. Uses main /api/teams. Pass season='all' or any year; backend returns all for league when using league_id. */
export const getTeamsByLeagueId = async (leagueIdMongo, season) => {
  if (!leagueIdMongo) return { success: false, error: 'League ID is required', data: [] };
  const res = await apiGet('/teams', { league_id: leagueIdMongo, season: season || new Date().getFullYear(), limit: 500 });
  const teams = res.data?.teams ?? [];
  return res.success ? { success: true, data: Array.isArray(teams) ? teams : [] } : { success: false, error: res.error, data: [] };
};

/** Trigger team sync from Football API. Pass allSeasons: true to sync all seasons (no season param needed). */
export const syncTeamsFromApi = async (league, season, allSeasons = false) => {
  if (!league) return { success: false, error: 'League is required' };
  if (!allSeasons && season == null) return { success: false, error: 'Season is required (or use allSeasons: true)' };
  const res = await apiPost(`${BASE}/sync-teams`, allSeasons ? { league, allSeasons: true } : { league, season });
  return res.success ? { success: true, message: res.message } : { success: false, error: res.error || res.message };
};

/** Players from database (with pagination). team = API team id or CeBee team _id. Optional page, limit. */
export const getApiPlayers = async (team, params = {}) => {
  if (team == null || team === '') return { success: false, error: 'Team ID is required', data: { players: [], pagination: {} } };
  const { page = 1, limit = 25 } = params;
  const res = await apiGet(`${BASE}/players`, { team, page, limit });
  const raw = res.data?.players ?? res.data ?? [];
  const list = Array.isArray(raw) ? raw : [];
  const pagination = res.data?.pagination ?? { page: 1, limit: 25, total: list.length, pages: 1 };
  return res.success ? { success: true, data: { players: list, pagination } } : { success: false, error: res.error, data: { players: [], pagination: {} } };
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
