/**
 * League Detail – Data Browser. Tabs: Overview, Standings, Teams, Fixtures, Results (sync order). Sync buttons per section.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import NavigateNext from '@mui/icons-material/NavigateNext';
import Search from '@mui/icons-material/Search';
import Sync from '@mui/icons-material/Sync';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import Groups from '@mui/icons-material/Groups';
import Event from '@mui/icons-material/Event';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import Info from '@mui/icons-material/Info';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CalendarToday from '@mui/icons-material/CalendarToday';
import {
  getLeagueDetail,
  getTeamsByLeagueId,
  getApiFixtures,
  getApiStandings,
  syncTeamsFromApi,
  syncLeaguesFromApi,
  syncStandingsFromApi,
  syncLeagueFixturesFromApi,
  setLeagueUse,
} from '../services/apiSyncService';
import { colors } from '../config/theme';
import { constants } from '../config/theme';
import { formatSeasonLabel } from '../utils/seasonFormat';

const TAB_OVERVIEW = 'overview';
const TAB_TEAMS = 'teams';
const TAB_FIXTURES = 'fixtures';
const TAB_RESULTS = 'results';
const TAB_STANDINGS = 'standings';
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const currentSeason = new Date().getFullYear();
const DEFAULT_SEASON_TEAMS_AND_STANDINGS = 2025; // Teams & Standings tabs default; other tabs use current season (e.g. 2026)
const SEASON_MIN = 2020;
const SEASON_MAX = currentSeason + 1;
const seasonOptions = [
  { value: 'all', label: 'All data' },
  ...Array.from({ length: SEASON_MAX - SEASON_MIN + 1 }, (_, i) => {
    const y = SEASON_MAX - i;
    return { value: y, label: formatSeasonLabel(y) };
  })
];

function statusShort(status) {
  if (!status) return 'NS';
  const s = String(status).toUpperCase();
  if (s === 'SCHEDULED' || s === 'PUBLISHED' || s === 'PREDICTIONOPEN' || s === 'PREDICTIONLOCK') return 'NS';
  if (s === 'LIVE' || s === 'RESULTSPROCESSING') return 'LIVE';
  if (s === 'HALFTIME' || (status && String(status).toLowerCase().includes('half'))) return 'HT';
  if (s === 'COMPLETED') return 'FT';
  return s.slice(0, 4);
}

function isFixtureCompleted(f) {
  const fixture = f.fixture || f;
  const st = (fixture.status?.short ?? fixture.status ?? f.status ?? f.matchStatus ?? '').toString().toUpperCase();
  if (st === 'FT' || st === 'COMPLETED' || st === 'AET' || st === 'PEN_LIVE' || st === 'PEN') return true;
  const goals = f.goals || {};
  return goals.home != null && goals.away != null;
}

function getFixtureStatusShort(f) {
  const fixture = f.fixture || f;
  return statusShort(fixture.status?.short ?? f.status ?? f.matchStatus);
}

function matchesSearch(str, q) {
  if (!q || !q.trim()) return true;
  if (str == null) return false;
  const s = String(str).toLowerCase();
  const qq = q.trim().toLowerCase();
  return s.includes(qq) || qq.includes(s);
}

/** Canonical kickoff date from fixture (backend sends fixture.date from kickoffTime). */
function getFixtureKickoff(f) {
  const fixture = f.fixture || f;
  return fixture?.date ?? f.date ?? f.kickoffTime ?? null;
}

const KICKOFF_TIMEZONE = 'Etc/GMT-1'; // UTC+1

function formatKickoffShort(dateStr) {
  if (dateStr == null || dateStr === '') return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  const opts = { timeZone: KICKOFF_TIMEZONE };
  const date = d.toLocaleDateString('en-GB', { ...opts, day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString('en-GB', { ...opts, hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} • ${time}`;
}

/** Date key (YYYY-MM-DD) for grouping fixtures/results by day. */
function getFixtureDateKey(f) {
  const dateStr = getFixtureKickoff(f);
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

/** Format date key for display (e.g. "Mon, 14 Mar 2026"). */
function formatDateKeyLabel(dateKey) {
  if (!dateKey) return '—';
  const d = new Date(dateKey + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return dateKey;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/** Group list of fixtures by date key. Returns object { [dateKey]: [fixtures] } with keys sorted (asc for fixtures, desc for results). */
function groupFixturesByDate(list, sortNewestFirst = false) {
  const byDate = {};
  list.forEach((f) => {
    const key = getFixtureDateKey(f) || 'unknown';
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(f);
  });
  const keys = Object.keys(byDate).filter(Boolean).sort();
  if (sortNewestFirst) keys.reverse();
  return { byDate, dateKeys: keys };
}

/** Round string from fixture (league.round, fixture.round, or f.round). */
function getFixtureRound(f) {
  const r = f.round ?? f.league?.round ?? f.fixture?.round ?? '';
  return r != null && String(r).trim() !== '' ? String(r).trim() : '';
}

/** Extract numeric part of round for sorting (e.g. "Regular Season - 30" -> 30). */
function getRoundSortNumber(roundStr) {
  if (!roundStr) return -1;
  const m = String(roundStr).match(/\d+/g);
  return m && m.length > 0 ? parseInt(m[m.length - 1], 10) : -1;
}

/** Display label for round (e.g. "ROUND 30", "Gameweek 30"). */
function formatRoundLabel(roundStr) {
  if (!roundStr) return '—';
  const r = String(roundStr).trim();
  const num = getRoundSortNumber(r);
  if (num >= 0 && (r === String(num) || r.endsWith(' - ' + num) || r.toLowerCase().includes('gameweek'))) {
    return r.toLowerCase().includes('gameweek') ? `Gameweek ${num}` : `ROUND ${num}`;
  }
  return r || '—';
}

/** Group fixtures by round. sortNewestFirstWithinRound: true for results, false for fixtures.
 *  Results: reversed — most recent round first, most recent match first in each round. Fixtures: soonest first. */
function groupFixturesByRound(list, sortNewestFirstWithinRound = false) {
  const byRound = {};
  const getDate = (f) => { const k = getFixtureKickoff(f); return k ? new Date(k).getTime() : 0; };
  list.forEach((f) => {
    const key = getFixtureRound(f) || '_no_round';
    if (!byRound[key]) byRound[key] = [];
    byRound[key].push(f);
  });
  // Within each round: results = descending (most recent first); fixtures = ascending (soonest first)
  Object.keys(byRound).forEach((key) => {
    byRound[key].sort((a, b) => sortNewestFirstWithinRound ? getDate(b) - getDate(a) : getDate(a) - getDate(b));
  });
  const roundKeys = Object.keys(byRound).filter((k) => k !== '_no_round');
  const noRoundKey = byRound['_no_round'] ? ['_no_round'] : [];
  if (sortNewestFirstWithinRound) {
    // Results: reversed — round with latest match first; within round most recent match first
    roundKeys.sort((a, b) => {
      const maxA = Math.max(...(byRound[a] || []).map(getDate).filter(Boolean)) || 0;
      const maxB = Math.max(...(byRound[b] || []).map(getDate).filter(Boolean)) || 0;
      if (maxA !== maxB) return maxB - maxA;
      const numA = getRoundSortNumber(a);
      const numB = getRoundSortNumber(b);
      if (numA < 0 && numB < 0) return a.localeCompare(b);
      if (numA < 0) return 1;
      if (numB < 0) return -1;
      return numB - numA;
    });
  } else {
    // Fixtures: round with soonest match on top (sort by earliest kickoff in round)
    roundKeys.sort((a, b) => {
      const minA = Math.min(...(byRound[a] || []).map(getDate).filter(Boolean)) || 0;
      const minB = Math.min(...(byRound[b] || []).map(getDate).filter(Boolean)) || 0;
      if (minA !== minB) return minA - minB;
      const numA = getRoundSortNumber(a);
      const numB = getRoundSortNumber(b);
      if (numA < 0 && numB < 0) return a.localeCompare(b);
      if (numA < 0) return 1;
      if (numB < 0) return -1;
      return numA - numB;
    });
  }
  const allKeys = [...roundKeys, ...noRoundKey];
  return { byRound, roundKeys: allKeys };
}

/** Resolve team logo from teams list by name (fallback when fixture has no logo). */
function getTeamLogoFromList(teamsList, teamName) {
  if (!Array.isArray(teamsList) || !teamName) return null;
  const name = String(teamName).trim().toLowerCase();
  const t = teamsList.find((x) => (String(x.team_name ?? x.name ?? '').trim().toLowerCase() === name));
  return t?.logo || null;
}

/** Resolve team id (API id or Mongo _id) from teams list by name. */
function getTeamIdFromList(teamsList, teamName) {
  if (!Array.isArray(teamsList) || !teamName) return null;
  const name = String(teamName).trim().toLowerCase();
  const t = teamsList.find((x) => (String(x.team_name ?? x.name ?? '').trim().toLowerCase() === name));
  return t?.apiTeamId ?? t?._id ?? t?.team_id ?? null;
}

const TAB_VALID = [TAB_OVERVIEW, TAB_STANDINGS, TAB_TEAMS, TAB_FIXTURES, TAB_RESULTS];

export default function DataBrowserLeagueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const initialTab = tabFromUrl && TAB_VALID.includes(tabFromUrl) ? tabFromUrl : TAB_OVERVIEW;
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [detail, setDetail] = useState(null);
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [fixtures, setFixtures] = useState([]);
  const [fixturesLoading, setFixturesLoading] = useState(false);
  const [standings, setStandings] = useState([]);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [syncing, setSyncing] = useState(null);
  // Season: 2025 for Teams/Standings, current year for others. Initialise from tab so back from team keeps 25.
  const [selectedSeason, setSelectedSeason] = useState(
    initialTab === TAB_TEAMS || initialTab === TAB_STANDINGS ? DEFAULT_SEASON_TEAMS_AND_STANDINGS : currentSeason
  );
  // Optional second season: view 2 seasons at a time (e.g. 25-26 & 26-27)
  const [selectedSeason2, setSelectedSeason2] = useState('');
  // Filters (per-tab) for easier data viewing
  const [searchQuery, setSearchQuery] = useState('');
  const [fixtureStatusFilter, setFixtureStatusFilter] = useState('all'); // all | scheduled | live | ht
  const [resultsDateFrom, setResultsDateFrom] = useState('');
  const [resultsDateTo, setResultsDateTo] = useState('');
  // Sort (per-tab): review A–Z, Z–A, most recent, etc.
  const [sortTeams, setSortTeams] = useState('name-az');
  const [sortFixtures, setSortFixtures] = useState('date-asc');
  const [sortResults, setSortResults] = useState('date-desc');
  const [sortStandings, setSortStandings] = useState('position-asc');
  const [standingsGroup, setStandingsGroup] = useState('all'); // all | group name
  // Pagination per tab
  const [pageTeams, setPageTeams] = useState(0);
  const [rowsPerPageTeams, setRowsPerPageTeams] = useState(25);
  const [pageFixtures, setPageFixtures] = useState(0);
  const [rowsPerPageFixtures, setRowsPerPageFixtures] = useState(25);
  const [pageResults, setPageResults] = useState(0);
  const [rowsPerPageResults, setRowsPerPageResults] = useState(25);
  const [pageStandings, setPageStandings] = useState(0);
  const [rowsPerPageStandings, setRowsPerPageStandings] = useState(25);
  // Date-group expand/collapse: array of date keys (YYYY-MM-DD) that are expanded
  const [expandedFixtures, setExpandedFixtures] = useState([]);
  const [expandedResults, setExpandedResults] = useState([]);

  // Keep tab and season in sync with URL so Back from team/fixture restores tab and Teams/Standings stay on 2025
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TAB_VALID.includes(t)) {
      setTab(t);
      if (t === TAB_TEAMS || t === TAB_STANDINGS) setSelectedSeason(DEFAULT_SEASON_TEAMS_AND_STANDINGS);
    }
  }, [searchParams]);

  const leagueId = detail?.league?._id;
  const apiLeagueId = detail?.league?.apiLeagueId;
  const seasonFilter = selectedSeason === 'all' ? 'all' : selectedSeason;
  const isAllSeasons = selectedSeason === 'all';
  const season2Num = selectedSeason2 !== '' && selectedSeason2 != null ? Number(selectedSeason2) : null;
  const allowedSeasons = selectedSeason === 'all'
    ? null
    : season2Num != null && !Number.isNaN(season2Num)
      ? [String(selectedSeason), String(season2Num)]
      : [String(selectedSeason)];

  // Filter by selected season(s) in UI – 1 or 2 seasons at a time
  const teamsForSeason = allowedSeasons == null
    ? teams
    : teams.filter((t) => allowedSeasons.includes(String(t.season_tag ?? t.season ?? '')));
  const getFixtureSeason = (f) => { const k = getFixtureKickoff(f); return f.season ?? (k ? new Date(k).getFullYear() : null); };
  const fixturesForSeason = allowedSeasons == null
    ? fixtures
    : fixtures.filter((f) => { const y = getFixtureSeason(f); return y != null && allowedSeasons.includes(String(y)); });
  const standingsForSeason = allowedSeasons == null
    ? standings
    : standings.filter((r) => {
        const seasonValue = r._season != null ? r._season : (r.season != null ? r.season : '');
        return allowedSeasons.includes(String(seasonValue));
      });

  // Distinct standings groups (e.g. MLS Western/Eastern Conference)
  const standingsGroups = Array.from(new Set(
    standingsForSeason
      .map((r) => (r.group != null ? String(r.group).trim() : ''))
      .filter((g) => g !== '')
  ));

  const standingsForSeasonAndGroup = standingsGroup === 'all'
    ? standingsForSeason
    : standingsForSeason.filter((r) => String(r.group || '').trim() === standingsGroup);

  // Map team name -> conference/group based on standings (so Teams tab can use same Western/Eastern split)
  const teamGroupByName = (() => {
    const map = new Map();
    standingsForSeason.forEach((r) => {
      const groupName = r.group != null ? String(r.group).trim() : '';
      const teamName = r.team && r.team.name ? String(r.team.name).trim().toLowerCase() : '';
      if (groupName && teamName && !map.has(teamName)) {
        map.set(teamName, groupName);
      }
    });
    return map;
  })();

  const teamsForSeasonWithGroup = teamsForSeason.map((t) => {
    const nameKey = String(t.team_name ?? t.name ?? '').trim().toLowerCase();
    const groupName = nameKey ? teamGroupByName.get(nameKey) || null : null;
    return groupName && !t.group
      ? { ...t, group: groupName }
      : t;
  });

  const teamsForSeasonAndGroup = standingsGroup === 'all'
    ? teamsForSeasonWithGroup
    : teamsForSeasonWithGroup.filter((t) => String(t.group || '').trim() === standingsGroup);

  const fixturesOnly = fixturesForSeason.filter((f) => !isFixtureCompleted(f));
  const resultsOnly = fixturesForSeason.filter(isFixtureCompleted);

  // Apply filters for each tab (search, status, date)
  const teamsFiltered = teamsForSeasonAndGroup.filter((t) => matchesSearch(t.team_name ?? t.name, searchQuery));
  const fixturesOnlyFiltered = fixturesOnly.filter((f) => {
    const teamsObj = f.teams || {};
    const home = teamsObj.home?.name ?? f.homeTeam ?? '';
    const away = teamsObj.away?.name ?? f.awayTeam ?? '';
    if (!matchesSearch(home, searchQuery) && !matchesSearch(away, searchQuery)) return false;
    if (fixtureStatusFilter === 'all') return true;
    const st = getFixtureStatusShort(f);
    if (fixtureStatusFilter === 'scheduled') return st === 'NS';
    if (fixtureStatusFilter === 'live') return st === 'LIVE';
    if (fixtureStatusFilter === 'ht') return st === 'HT';
    return true;
  });
  const resultsOnlyFiltered = resultsOnly.filter((f) => {
    const teamsObj = f.teams || {};
    const home = teamsObj.home?.name ?? f.homeTeam ?? '';
    const away = teamsObj.away?.name ?? f.awayTeam ?? '';
    if (!matchesSearch(home, searchQuery) && !matchesSearch(away, searchQuery)) return false;
    if (resultsDateFrom || resultsDateTo) {
      const fixture = f.fixture || f;
      const dateStr = getFixtureKickoff(f) ? new Date(getFixtureKickoff(f)).toISOString().slice(0, 10) : '';
      if (resultsDateFrom && dateStr < resultsDateFrom) return false;
      if (resultsDateTo && dateStr > resultsDateTo) return false;
    }
    return true;
  });
  const standingsFiltered = standingsForSeasonAndGroup.filter((r) => matchesSearch(r.team?.name, searchQuery));

  // Apply sort (A–Z, Z–A, most recent, etc.)
  const teamsSorted = [...teamsFiltered].sort((a, b) => {
    const nameA = (a.team_name ?? a.name ?? '').toLowerCase();
    const nameB = (b.team_name ?? b.name ?? '').toLowerCase();
    if (sortTeams === 'name-za') return nameB.localeCompare(nameA);
    return nameA.localeCompare(nameB);
  });
  const getFixtureDate = (f) => { const k = getFixtureKickoff(f); return k ? new Date(k).getTime() : 0; };
  const getFixtureHome = (f) => (f.teams?.home?.name ?? f.homeTeam ?? '').toLowerCase();
  const getFixtureAway = (f) => (f.teams?.away?.name ?? f.awayTeam ?? '').toLowerCase();
  const fixturesOnlySorted = [...fixturesOnlyFiltered].sort((a, b) => {
    if (sortFixtures === 'date-desc') return getFixtureDate(b) - getFixtureDate(a);
    if (sortFixtures === 'date-asc') return getFixtureDate(a) - getFixtureDate(b);
    if (sortFixtures === 'home-az') return getFixtureHome(a).localeCompare(getFixtureHome(b));
    if (sortFixtures === 'home-za') return getFixtureHome(b).localeCompare(getFixtureHome(a));
    if (sortFixtures === 'away-az') return getFixtureAway(a).localeCompare(getFixtureAway(b));
    if (sortFixtures === 'away-za') return getFixtureAway(b).localeCompare(getFixtureAway(a));
    return getFixtureDate(a) - getFixtureDate(b);
  });
  const resultsOnlySorted = [...resultsOnlyFiltered].sort((a, b) => {
    if (sortResults === 'date-asc') return getFixtureDate(a) - getFixtureDate(b);
    if (sortResults === 'date-desc') return getFixtureDate(b) - getFixtureDate(a);
    if (sortResults === 'home-az') return getFixtureHome(a).localeCompare(getFixtureHome(b));
    if (sortResults === 'home-za') return getFixtureHome(b).localeCompare(getFixtureHome(a));
    if (sortResults === 'away-az') return getFixtureAway(a).localeCompare(getFixtureAway(b));
    if (sortResults === 'away-za') return getFixtureAway(b).localeCompare(getFixtureAway(a));
    return getFixtureDate(b) - getFixtureDate(a);
  });
  const standingsSorted = [...standingsFiltered].sort((a, b) => {
    const teamA = (a.team?.name ?? '').toLowerCase();
    const teamB = (b.team?.name ?? '').toLowerCase();
    const rankA = a.rank ?? 9999;
    const rankB = b.rank ?? 9999;
    const ptsA = Number(a.points) ?? 0;
    const ptsB = Number(b.points) ?? 0;
    if (sortStandings === 'team-az') return teamA.localeCompare(teamB);
    if (sortStandings === 'team-za') return teamB.localeCompare(teamA);
    if (sortStandings === 'position-desc') return rankB - rankA;
    if (sortStandings === 'points-desc') return ptsB - ptsA;
    if (sortStandings === 'points-asc') return ptsA - ptsB;
    return rankA - rankB; // position-asc default
  });

  const teamsDisplay = teamsSorted.slice(pageTeams * rowsPerPageTeams, pageTeams * rowsPerPageTeams + rowsPerPageTeams);
  const fixturesGroupedByRound = groupFixturesByRound(fixturesOnlySorted, false);
  const resultsGroupedByRound = groupFixturesByRound(resultsOnlySorted, true);
  const standingsDisplay = standingsSorted.slice(pageStandings * rowsPerPageStandings, pageStandings * rowsPerPageStandings + rowsPerPageStandings);

  // Default-expand all round groups when data changes
  const fixtureRoundKeysStr = fixturesGroupedByRound.roundKeys.join(',');
  const resultRoundKeysStr = resultsGroupedByRound.roundKeys.join(',');
  useEffect(() => {
    if (fixturesGroupedByRound.roundKeys.length) {
      setExpandedFixtures(prev => { const next = new Set(prev); fixturesGroupedByRound.roundKeys.forEach(k => next.add(k)); return Array.from(next); });
    }
  }, [fixtureRoundKeysStr]);
  useEffect(() => {
    if (resultsGroupedByRound.roundKeys.length) {
      setExpandedResults(prev => { const next = new Set(prev); resultsGroupedByRound.roundKeys.forEach(k => next.add(k)); return Array.from(next); });
    }
  }, [resultRoundKeysStr]);

  const handleChangePageTeams = (_, newPage) => setPageTeams(newPage);
  const handleChangeRowsPerPageTeams = (e) => { setRowsPerPageTeams(parseInt(e.target.value, 10)); setPageTeams(0); };
  const handleChangePageFixtures = (_, newPage) => setPageFixtures(newPage);
  const handleChangeRowsPerPageFixtures = (e) => { setRowsPerPageFixtures(parseInt(e.target.value, 10)); setPageFixtures(0); };
  const handleChangePageResults = (_, newPage) => setPageResults(newPage);
  const handleChangeRowsPerPageResults = (e) => { setRowsPerPageResults(parseInt(e.target.value, 10)); setPageResults(0); };
  const handleFixtureAccordionChange = (roundKey) => (_, isExpanded) => {
    setExpandedFixtures(prev => isExpanded ? (prev.includes(roundKey) ? prev : [...prev, roundKey]) : prev.filter(k => k !== roundKey));
  };
  const handleResultAccordionChange = (roundKey) => (_, isExpanded) => {
    setExpandedResults(prev => isExpanded ? (prev.includes(roundKey) ? prev : [...prev, roundKey]) : prev.filter(k => k !== roundKey));
  };
  const expandAllFixtures = () => setExpandedFixtures([...fixturesGroupedByRound.roundKeys]);
  const collapseAllFixtures = () => setExpandedFixtures([]);
  const expandAllResults = () => setExpandedResults([...resultsGroupedByRound.roundKeys]);
  const collapseAllResults = () => setExpandedResults([]);
  const handleChangePageStandings = (_, newPage) => setPageStandings(newPage);
  const handleChangeRowsPerPageStandings = (e) => { setRowsPerPageStandings(parseInt(e.target.value, 10)); setPageStandings(0); };

  // Data flow: On detail load / tab switch → fetch from DB only (no API). On Sync click → API → save to DB → refetch from DB → display.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLeagueDetail(id)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          setDetail(res.data);
        } else {
          setError(res.error || 'League not found');
        }
      })
      .catch((e) => { if (!cancelled) setError(e.message || 'Failed to load league'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  // Teams: fetch when Teams tab OR when Fixtures/Results (so we can use team logos as fallback).
  useEffect(() => {
    if (!leagueId) return;
    if (tab !== TAB_TEAMS && tab !== TAB_FIXTURES && tab !== TAB_RESULTS) return;
    let cancelled = false;
    setTeamsLoading(true);
    getTeamsByLeagueId(leagueId, 'all')
      .then((res) => {
        if (cancelled) return;
        setTeams(res.success && Array.isArray(res.data) ? res.data : []);
      })
      .finally(() => { if (!cancelled) setTeamsLoading(false); });
    return () => { cancelled = true; };
  }, [tab, leagueId]);

  useEffect(() => { setPageTeams(0); }, [teamsFiltered.length, sortTeams, selectedSeason]);
  useEffect(() => { setPageFixtures(0); }, [fixturesOnlyFiltered.length, sortFixtures, selectedSeason]);
  useEffect(() => { setPageResults(0); }, [resultsOnlyFiltered.length, sortResults, selectedSeason]);
  useEffect(() => { setPageStandings(0); }, [standingsFiltered.length, sortStandings, selectedSeason]);

  // Fixtures & Results: fetch "all" seasons once; season filter applied in UI for instant switch.
  useEffect(() => {
    if ((tab !== TAB_FIXTURES && tab !== TAB_RESULTS) || (!apiLeagueId && !id)) return;
    let cancelled = false;
    setFixturesLoading(true);
    getApiFixtures({ league: apiLeagueId ?? id, season: 'all' })
      .then((res) => {
        if (cancelled) return;
        setFixtures(res.success && Array.isArray(res.data) ? res.data : []);
      })
      .finally(() => { if (!cancelled) setFixturesLoading(false); });
    return () => { cancelled = true; };
  }, [tab, apiLeagueId, id]);

  // Standings: fetch "all" seasons once; season filter applied in UI for instant switch.
  useEffect(() => {
    if (tab !== TAB_STANDINGS || apiLeagueId == null) return;
    let cancelled = false;
    setStandingsLoading(true);
    getApiStandings(apiLeagueId, 'all')
      .then((res) => {
        if (cancelled) return;
        const raw = res.data;
        let list = [];
        if (Array.isArray(raw) && raw.length > 0) {
          if (raw[0].season != null && Array.isArray(raw[0].rows)) {
            list = raw.flatMap((s) => (s.rows || []).map((r) => ({ ...r, _season: s.season })));
          } else if (raw[0].rank != null && raw[0].team != null) list = raw;
          else if (raw[0]?.league?.standings?.[0]) list = raw[0].league.standings[0];
          else list = raw;
        }
        setStandings(Array.isArray(list) ? list : []);
      })
      .finally(() => { if (!cancelled) setStandingsLoading(false); });
    return () => { cancelled = true; };
  }, [tab, apiLeagueId]);

  const handleSyncLeagues = async () => {
    setSyncing('leagues');
    setMessage(null);
    const res = await syncLeaguesFromApi(); // API → save to DB
    setSyncing(null);
    if (res.success) {
      setMessage(res.message || 'Leagues synced. Refreshing…');
      getLeagueDetail(id).then((r) => {
        if (r.success && r.data) setDetail(r.data); // Refetch from DB → display
      });
    } else setError(res.error);
  };

  // Sync always fetches and stores all seasons (no frontend choice). Then refetch with current filter.
  const handleSyncTeams = async () => {
    if (apiLeagueId == null) return;
    setSyncing('teams');
    setMessage(null);
    const res = await syncTeamsFromApi(apiLeagueId, null, true);
    setSyncing(null);
    if (res.success) {
      setMessage(res.message || 'Syncing all seasons to DB. Refreshing list…');
      setTimeout(() => {
        getTeamsByLeagueId(leagueId, 'all').then((r) => {
          if (r.success && Array.isArray(r.data)) setTeams(r.data);
        });
      }, 60000);
    } else setError(res.error);
  };

  const handleSyncFixtures = async () => {
    if (apiLeagueId == null) return;
    setSyncing('fixtures');
    setMessage(null);
    const res = await syncLeagueFixturesFromApi(apiLeagueId, null, true);
    setSyncing(null);
    if (res?.success) {
      setMessage(res.message || 'League fixtures synced from API. Refreshing…');
      getApiFixtures({ league: apiLeagueId, season: 'all' }).then((r) => {
        if (r.success && Array.isArray(r.data)) setFixtures(r.data);
      });
    } else setError(res?.error || res?.message || 'Sync failed');
  };

  const handleSyncStandings = async () => {
    if (apiLeagueId == null) return;
    setSyncing('standings');
    setMessage(null);
    const res = await syncStandingsFromApi(apiLeagueId, null, true);
    setSyncing(null);
    if (res.success) {
      setMessage(res.message || 'Standings synced. Refreshing…');
      getApiStandings(apiLeagueId, 'all').then((r) => {
        if (!r.success || !Array.isArray(r.data)) return;
        const raw = r.data;
        if (raw.length > 0 && raw[0].season != null && Array.isArray(raw[0].rows)) {
          setStandings(raw.flatMap((s) => (s.rows || []).map((row) => ({ ...row, _season: s.season }))));
        } else {
          setStandings(raw);
        }
      });
    } else setError(res.error);
  };

  const handleSetUse = async (use) => {
    const leagueMongoId = (leagueId && (typeof leagueId === 'string' ? leagueId : leagueId.toString?.())) || detail?.league?._id?.toString();
    if (!leagueMongoId) return;
    setMessage(null);
    const res = await setLeagueUse(leagueMongoId, use);
    if (res.success) {
      setMessage(use ? 'League set to Use.' : 'League set to Don\'t use.');
      getLeagueDetail(id).then((r) => {
        if (r.success && r.data) setDetail(r.data);
      });
    } else setError(res.error);
  };

  const handleTeamClick = (team) => {
    const tid = team.team_id ?? team._id ?? team.apiTeamId;
    if (tid) navigate(`${constants.routes.apiSync}/team/${tid}`, { state: { leagueId: id, tab } });
  };

  if (loading || !detail) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
        {error ? <Alert severity="error">{error}</Alert> : <Box sx={{ textAlign: 'center' }}><CircularProgress /><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Loading league…</Typography></Box>}
      </Box>
    );
  }

  const league = detail.league || {};
  const teamCount = detail.teamCount ?? 0;
  const activeTeamCount = detail.activeTeamCount ?? teamCount;
  const inactiveTeamCount = detail.inactiveTeamCount ?? 0;
  const useInApp = league.useInApp !== false;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 }, minHeight: '60vh', bgcolor: 'grey.50' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} size="small" sx={{ mb: 2 }}>
        Back
      </Button>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2.5, '& .MuiBreadcrumbs-separator': { mx: 0.75 }, '& .MuiTypography-root': { fontSize: '0.875rem' } }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate(-1)}
          sx={{ color: colors.brandRed, cursor: 'pointer', textDecoration: 'none', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
        >
          API Data & Sync
        </Link>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {league.name_display || league.league_name || 'League'}
        </Typography>
      </Breadcrumbs>

      {message && <Alert severity="success" onClose={() => setMessage(null)} sx={{ mb: 2, borderRadius: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Alert
        severity="info"
        icon={<Info />}
        sx={{ mb: 2, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Sync order (required)</Typography>
        <Typography variant="body2" component="span">
          1) <strong>Standings</strong> → 2) <strong>Teams</strong> → 3) <strong>Fixtures</strong>. Only official current-season data is saved; filtered-out data (relegated, historical, etc.) is not saved.
        </Typography>
      </Alert>

      <Card variant="outlined" sx={{ mb: 3, borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderColor: 'divider', overflow: 'hidden' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, minWidth: 0, flex: '1 1 200px' }}>
              <Box sx={{ width: 72, height: 72, borderRadius: 2.5, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid', borderColor: 'divider' }}>
                {league.logo ? (
                  <Box component="img" src={league.logo} alt="" sx={{ width: 72, height: 72, objectFit: 'contain', p: 0.5 }} />
                ) : (
                  <SportsSoccer sx={{ fontSize: 44, color: 'grey.400' }} />
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.01em', color: 'grey.900' }}>{league.name_display || league.league_name || '—'}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>{league.country || '—'}</Typography>
              </Box>
            </Box>
            <FormControl size="small" sx={{ minWidth: 100, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper', fontWeight: 500 } }}>
              <InputLabel id="season-label">Season</InputLabel>
              <Select
                labelId="season-label"
                label="Season"
                value={selectedSeason}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedSeason(v === 'all' ? 'all' : Number(v));
                  if (v === 'all') setSelectedSeason2('');
                }}
                sx={{ fontSize: '0.875rem' }}
              >
                {seasonOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedSeason !== 'all' && (
              <FormControl size="small" sx={{ minWidth: 100, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper', fontWeight: 500 } }}>
                <InputLabel id="season2-label">+ Season 2</InputLabel>
                <Select
                  labelId="season2-label"
                  label="+ Season 2"
                  value={selectedSeason2}
                  onChange={(e) => setSelectedSeason2(e.target.value === '' ? '' : Number(e.target.value))}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">None</MenuItem>
                  {seasonOptions.filter((opt) => opt.value !== 'all' && opt.value !== selectedSeason).map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </CardContent>
      </Card>

      <Tabs
        value={tab}
        onChange={(_, v) => {
          setTab(v);
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('tab', v);
            return next;
          });
          const use2025 = v === TAB_TEAMS || v === TAB_STANDINGS;
          setSelectedSeason(use2025 ? DEFAULT_SEASON_TEAMS_AND_STANDINGS : currentSeason);
        }}
        sx={{
          mb: 0,
          minHeight: 48,
          '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
          '& .Mui-selected': { color: colors.brandRed },
          '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', backgroundColor: colors.brandRed },
          '& .MuiTabs-flexContainer': { gap: 4 },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: 1,
          borderRadius: '12px 12px 0 0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
        indicatorColor="primary"
        textColor="inherit"
      >
        <Tab icon={<Info sx={{ fontSize: 20 }} />} iconPosition="start" label="Overview" value={TAB_OVERVIEW} />
        <Tab icon={<EmojiEvents sx={{ fontSize: 20 }} />} iconPosition="start" label="Standings" value={TAB_STANDINGS} />
        <Tab icon={<Groups sx={{ fontSize: 20 }} />} iconPosition="start" label="Teams" value={TAB_TEAMS} />
        <Tab icon={<Event sx={{ fontSize: 20 }} />} iconPosition="start" label="Fixtures" value={TAB_FIXTURES} />
        <Tab icon={<CheckCircle sx={{ fontSize: 20 }} />} iconPosition="start" label="Results" value={TAB_RESULTS} />
      </Tabs>

      {tab === TAB_OVERVIEW && (
        <Box sx={{ border: 1, borderColor: 'divider', borderTop: 'none', borderRadius: '0 0 12px 12px', bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', p: { xs: 2.5, sm: 3 } }}>
          <Card variant="outlined" sx={{ maxWidth: 540, borderRadius: 2.5, borderColor: 'divider', boxShadow: 'none', bgcolor: 'grey.50' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'grey.700', mb: 2, letterSpacing: '0.02em' }}>League details</Typography>
              <Box sx={{ display: 'grid', gap: 2.5 }}>
                {[
                  { label: 'League name', value: league.name_display || league.league_name || '—' },
                  { label: 'Country', value: league.country || '—' },
                  { label: 'Display', value: isAllSeasons ? 'All data' : (allowedSeasons && allowedSeasons.length === 2 ? `${formatSeasonLabel(allowedSeasons[0])} & ${formatSeasonLabel(allowedSeasons[1])}` : `Season ${formatSeasonLabel(seasonFilter)}`) },
                  { label: 'Number of teams', value: teamCount === 0 ? '0' : (inactiveTeamCount > 0 ? `${teamCount} (${activeTeamCount} active, ${inactiveTeamCount} inactive)` : `${teamCount} (${activeTeamCount} active)`) },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider', '&:last-of-type': { borderBottom: 0 } }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, fontSize: '0.7rem' }}>{label}</Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5, color: 'grey.900' }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'grey.700', mt: 3, mb: 1, letterSpacing: '0.02em' }}>Use in app</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Show or hide this league in the app.</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <Box component="span" sx={{ px: 2, py: 0.75, borderRadius: 1.5, bgcolor: useInApp ? 'rgba(76,175,80,0.12)' : 'grey.200', color: useInApp ? '#2e7d32' : 'grey.700', fontSize: '0.8125rem', fontWeight: 700 }}>
                  {useInApp ? 'Use' : "Don't use"}
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleSetUse(true)}
                  disabled={useInApp}
                  sx={{ borderRadius: 2, px: 2, fontWeight: 600, bgcolor: colors.brandRed, '&:hover': { bgcolor: '#b9141a' }, '&.Mui-disabled': { bgcolor: 'grey.300', color: 'grey.500' } }}
                >
                  Set to Use
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleSetUse(false)}
                  disabled={!useInApp}
                  color="inherit"
                  sx={{ borderRadius: 2, px: 2, fontWeight: 600, borderColor: 'grey.300', color: 'grey.700', '&:hover': { borderColor: 'grey.400', bgcolor: 'grey.100' }, '&.Mui-disabled': { borderColor: 'grey.200', color: 'grey.400' } }}
                >
                  Set to Don't use
                </Button>
              </Box>
              <Button
                startIcon={syncing === 'leagues' ? <CircularProgress size={18} color="inherit" /> : <Sync />}
                onClick={handleSyncLeagues}
                disabled={syncing === 'leagues'}
                size="medium"
                variant="contained"
                sx={{ mt: 3, borderRadius: 2, fontWeight: 600, bgcolor: colors.brandRed, '&:hover': { bgcolor: '#b9141a' } }}
              >
                {syncing === 'leagues' ? 'Syncing…' : 'Sync leagues from API'}
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      {tab === TAB_TEAMS && (
        <Box sx={{ border: 1, borderColor: 'divider', borderTop: 'none', borderRadius: '0 0 12px 12px', bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, px: { xs: 2, sm: 3 }, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'grey.800' }}>Teams in this league</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>Sync Standings first (step 1). Only teams in current season standings are saved.</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search by team name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: 'grey.500' }} /></InputAdornment> }}
                sx={{ width: 240, '& .MuiInputBase-root': { bgcolor: 'background.paper', borderRadius: 2, '& fieldset': { borderColor: 'grey.300' } } }}
              />
              <FormControl size="small" sx={{ minWidth: 160, bgcolor: 'background.paper', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel id="sort-teams-label">Sort by</InputLabel>
                <Select labelId="sort-teams-label" label="Sort by" value={sortTeams} onChange={(e) => setSortTeams(e.target.value)}>
                  <MenuItem value="name-az">Name A → Z</MenuItem>
                  <MenuItem value="name-za">Name Z → A</MenuItem>
                </Select>
              </FormControl>
              {standingsGroups.length > 1 && (
                <FormControl size="small" sx={{ minWidth: 170, bgcolor: 'background.paper', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                  <InputLabel id="group-teams-label">Conference</InputLabel>
                  <Select
                    labelId="group-teams-label"
                    label="Conference"
                    value={standingsGroup}
                    onChange={(e) => setStandingsGroup(e.target.value)}
                  >
                    <MenuItem value="all">All conferences</MenuItem>
                    {standingsGroups.map((g) => (
                      <MenuItem key={g} value={g}>{g}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <Button
                startIcon={syncing === 'teams' ? <CircularProgress size={18} color="inherit" /> : <Sync />}
                onClick={handleSyncTeams}
                disabled={syncing === 'teams' || apiLeagueId == null}
                size="medium"
                variant="contained"
                sx={{ borderRadius: 2, fontWeight: 600, bgcolor: colors.brandRed, '&:hover': { bgcolor: '#b9141a' } }}
              >
                {syncing === 'teams' ? 'Syncing…' : 'Sync Teams'}
              </Button>
            </Box>
          </Box>
          {standingsGroups.length > 1 && !teamsLoading && teams.length > 0 && (
            <Box sx={{ px: { xs: 2, sm: 3 }, pt: 1.5, pb: 0.5, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Conference:
              </Typography>
              <Button
                size="small"
                variant={standingsGroup === 'all' ? 'contained' : 'outlined'}
                onClick={() => setStandingsGroup('all')}
                sx={{ textTransform: 'none', borderRadius: 999, px: 1.75, py: 0.25, fontSize: '0.72rem' }}
              >
                All
              </Button>
              {standingsGroups.map((g) => (
                <Button
                  key={g}
                  size="small"
                  variant={standingsGroup === g ? 'contained' : 'outlined'}
                  onClick={() => setStandingsGroup(g)}
                  sx={{ textTransform: 'none', borderRadius: 999, px: 1.75, py: 0.25, fontSize: '0.72rem' }}
                >
                  {g}
                </Button>
              ))}
            </Box>
          )}
          {teamsLoading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress sx={{ color: colors.brandRed }} /><Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontWeight: 500 }}>Loading teams…</Typography></Box>
          ) : teams.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><Groups sx={{ fontSize: 56, color: 'grey.300', mb: 1.5 }} /><Typography variant="body2" color="text.secondary" fontWeight={500}>No teams in this league. Sync Standings first, then Sync Teams (only official teams are saved).</Typography></Box>
          ) : teamsFiltered.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><Groups sx={{ fontSize: 56, color: 'grey.300', mb: 1.5 }} /><Typography variant="body2" color="text.secondary" fontWeight={500}>No teams match your search. Try a different filter.</Typography></Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
              <Table size="medium" sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    {isAllSeasons && <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'grey.700', borderColor: 'divider' }}>Season</TableCell>}
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'grey.700', borderColor: 'divider' }}>Team</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'grey.700', borderColor: 'divider' }}>Team ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamsDisplay.map((t) => (
                    <TableRow
                      key={t.team_id ?? t._id ?? t.apiTeamId ?? t.team_name}
                      hover
                      onClick={() => handleTeamClick(t)}
                      sx={{ cursor: 'pointer', '&:nth-of-type(even)': { bgcolor: 'grey.50' }, '&:hover': { bgcolor: 'rgba(215,25,32,0.06)' } }}
                    >
                      {isAllSeasons && <TableCell sx={{ fontSize: '0.875rem', borderColor: 'divider' }}>{t.season_tag ?? t.season ?? '—'}</TableCell>}
                      <TableCell sx={{ borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {t.logo ? (
                            <Box component="img" src={t.logo} alt="" sx={{ width: 32, height: 32, objectFit: 'contain' }} />
                          ) : (
                            <Groups sx={{ color: 'grey.400', fontSize: 32 }} />
                          )}
                          <Typography variant="body2" fontWeight={600} sx={{ color: 'grey.900' }}>{t.team_name ?? t.name ?? '—'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary', borderColor: 'divider' }}>{t.team_id ?? t._id ?? t.apiTeamId ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={teamsFiltered.length}
                page={pageTeams}
                onPageChange={handleChangePageTeams}
                rowsPerPage={rowsPerPageTeams}
                onRowsPerPageChange={handleChangeRowsPerPageTeams}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                labelRowsPerPage="Rows per page:"
                showFirstButton
                showLastButton
                sx={{ borderTop: 1, borderColor: 'divider', fontWeight: 500 }}
              />
            </TableContainer>
          )}
        </Box>
      )}

      {tab === TAB_FIXTURES && (
        <Box sx={{ border: 1, borderColor: 'divider', borderTop: 'none', borderRadius: '0 0 12px 12px', bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, px: { xs: 2, sm: 3 }, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'grey.800' }}>Fixtures ({fixturesOnlyFiltered.length}{fixturesOnlyFiltered.length !== fixturesOnly.length ? ` of ${fixturesOnly.length}` : ''})</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>Sync Standings first (step 1). Only fixtures with both teams in standings are saved.</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search by team"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: 'grey.500' }} /></InputAdornment> }}
                sx={{ width: 200, '& .MuiInputBase-root': { bgcolor: 'background.paper', borderRadius: 2, '& fieldset': { borderColor: 'grey.300' } } }}
              />
              <FormControl size="small" sx={{ minWidth: 130, bgcolor: 'background.paper', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel id="fixture-status-label">Status</InputLabel>
                <Select labelId="fixture-status-label" label="Status" value={fixtureStatusFilter} onChange={(e) => setFixtureStatusFilter(e.target.value)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="live">Live</MenuItem>
                  <MenuItem value="ht">Halftime</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 180, bgcolor: 'background.paper', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel id="sort-fixtures-label">Sort by</InputLabel>
                <Select labelId="sort-fixtures-label" label="Sort by" value={sortFixtures} onChange={(e) => setSortFixtures(e.target.value)}>
                  <MenuItem value="date-asc">Date (earliest first)</MenuItem>
                  <MenuItem value="date-desc">Date (most recent first)</MenuItem>
                  <MenuItem value="home-az">Home team A → Z</MenuItem>
                  <MenuItem value="home-za">Home team Z → A</MenuItem>
                  <MenuItem value="away-az">Away team A → Z</MenuItem>
                  <MenuItem value="away-za">Away team Z → A</MenuItem>
                </Select>
              </FormControl>
              <Button
                startIcon={syncing === 'fixtures' ? <CircularProgress size={18} color="inherit" /> : <Sync />}
                onClick={handleSyncFixtures}
                disabled={syncing === 'fixtures'}
                size="medium"
                variant="contained"
                sx={{ borderRadius: 2, fontWeight: 600, bgcolor: colors.brandRed, '&:hover': { bgcolor: '#b9141a' } }}
              >
                {syncing === 'fixtures' ? 'Syncing…' : 'Sync Fixtures'}
              </Button>
            </Box>
          </Box>
          {fixturesLoading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress sx={{ color: colors.brandRed }} /><Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontWeight: 500 }}>Loading fixtures…</Typography></Box>
          ) : fixtures.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><Event sx={{ fontSize: 56, color: 'grey.300', mb: 1.5 }} /><Typography variant="body2" color="text.secondary" fontWeight={500}>No fixtures in DB. Sync Standings first, then Sync Fixtures (only fixtures with both teams in standings are saved).</Typography></Box>
          ) : fixturesOnly.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><Event sx={{ fontSize: 56, color: 'grey.300', mb: 1.5 }} /><Typography variant="body2" color="text.secondary" fontWeight={500}>No upcoming fixtures. Check the Results tab for completed matches.</Typography></Box>
          ) : fixturesOnlyFiltered.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><Event sx={{ fontSize: 56, color: 'grey.300', mb: 1.5 }} /><Typography variant="body2" color="text.secondary" fontWeight={500}>No fixtures match your filters. Try a different search or status.</Typography></Box>
          ) : (
            <>
              <Box sx={{ px: { xs: 1, sm: 2 }, py: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" variant="outlined" onClick={expandAllFixtures}>Expand all</Button>
                <Button size="small" variant="outlined" onClick={collapseAllFixtures}>Collapse all</Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', px: { xs: 2, sm: 3 }, pb: 2 }}>
                {fixturesGroupedByRound.roundKeys.map((roundKey) => {
                  const list = fixturesGroupedByRound.byRound[roundKey] || [];
                  const expanded = expandedFixtures.includes(roundKey);
                  const roundLabel = roundKey === '_no_round' ? 'Other' : formatRoundLabel(roundKey);
                  return (
                    <Accordion
                      key={roundKey}
                      expanded={expanded}
                      onChange={handleFixtureAccordionChange(roundKey)}
                      elevation={0}
                      sx={{ border: `1px solid ${colors.divider}`, borderRadius: '0 !important', '&:first-of-type': { borderTopLeftRadius: 8, borderTopRightRadius: 8 }, '&:last-of-type': { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }, '&:before': { display: 'none' }, '&.Mui-expanded': { margin: 0 } }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'grey.50', minHeight: 48, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1 } }}>
                        <CalendarToday sx={{ fontSize: 20, color: 'grey.600' }} />
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'grey.800' }}>{roundLabel}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>({list.length} {list.length === 1 ? 'match' : 'matches'})</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 0 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {list.map((f, idx) => {
                            const fixture = f.fixture || f;
                            const teamsObj = f.teams || {};
                            const homeName = teamsObj.home?.name ?? f.homeTeam ?? '—';
                            const awayName = teamsObj.away?.name ?? f.awayTeam ?? '—';
                            const homeLogo = teamsObj.home?.logo ?? f.homeLogo ?? getTeamLogoFromList(teams, homeName);
                            const awayLogo = teamsObj.away?.logo ?? f.awayLogo ?? getTeamLogoFromList(teams, awayName);
                            const homeTeamId = teamsObj.home?.id ?? getTeamIdFromList(teams, homeName);
                            const awayTeamId = teamsObj.away?.id ?? getTeamIdFromList(teams, awayName);
                            const st = fixture.status?.short ?? f.status ?? f.matchStatus;
                            const apiFixtureId = f.fixture?.id ?? f.apiFixtureId;
                            const kickoff = formatKickoffShort(getFixtureKickoff(f));
                            const goToTeam = (tid) => (e) => { e.stopPropagation(); if (tid) navigate(`${constants.routes.apiSync}/team/${tid}`, { state: { leagueId: id, tab } }); };
                            return (
                              <Paper
                                key={f.fixture?.id ?? idx}
                                elevation={0}
                                onClick={(e) => { e.stopPropagation(); apiFixtureId && navigate(`${constants.routes.apiSync}/league/${id}/fixture/${apiFixtureId}`, { state: { tab } }); }}
                                sx={{
                                  p: 2,
                                  border: `1px solid ${colors.divider}`,
                                  borderRadius: 2,
                                  cursor: apiFixtureId ? 'pointer' : 'default',
                                  '&:hover': apiFixtureId ? { bgcolor: 'grey.50', borderColor: colors.brandRed } : {},
                                  transition: 'background-color 0.2s, border-color 0.2s',
                                }}
                              >
                                {/* Same layout as fixture detail page: home (logo + name) | vs + meta | away (logo + name) */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                                  <Box
                                    onClick={goToTeam(homeTeamId)}
                                    role={homeTeamId ? 'button' : undefined}
                                    title={homeTeamId ? 'View squad' : undefined}
                                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100, ...(homeTeamId && { cursor: 'pointer' }) }}
                                  >
                                    {homeLogo ? (
                                      <Box component="img" src={homeLogo} alt="" referrerPolicy="no-referrer" sx={{ width: 40, height: 40, objectFit: 'contain', mb: 0.5 }} />
                                    ) : (
                                      <SportsSoccer sx={{ color: 'grey.300', fontSize: 40, mb: 0.5 }} />
                                    )}
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      textAlign="center"
                                      sx={{ maxWidth: 150, px: 0.5, wordBreak: 'break-word', whiteSpace: 'normal' }}
                                    >
                                      {homeName}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center', px: 1.5, minWidth: 80 }}>
                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>vs</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>{kickoff}</Typography>
                                    <Typography variant="caption" fontWeight={700} sx={{ color: colors.brandRed, display: 'inline-block', mt: 0.25, px: 1, py: 0.25, borderRadius: 1, bgcolor: 'grey.100' }}>{statusShort(st)}</Typography>
                                  </Box>
                                  <Box
                                    onClick={goToTeam(awayTeamId)}
                                    role={awayTeamId ? 'button' : undefined}
                                    title={awayTeamId ? 'View squad' : undefined}
                                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100, ...(awayTeamId && { cursor: 'pointer' }) }}
                                  >
                                    {awayLogo ? (
                                      <Box component="img" src={awayLogo} alt="" referrerPolicy="no-referrer" sx={{ width: 40, height: 40, objectFit: 'contain', mb: 0.5 }} />
                                    ) : (
                                      <SportsSoccer sx={{ color: 'grey.300', fontSize: 40, mb: 0.5 }} />
                                    )}
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      textAlign="center"
                                      sx={{ maxWidth: 150, px: 0.5, wordBreak: 'break-word', whiteSpace: 'normal' }}
                                    >
                                      {awayName}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Paper>
                            );
                          })}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            </>
          )}
        </Box>
      )}

      {tab === TAB_RESULTS && (
        <Box sx={{ border: 1, borderColor: 'divider', borderTop: 'none', borderRadius: '0 0 12px 12px', bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, px: { xs: 2, sm: 3 }, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'grey.800' }}>Results ({resultsOnlyFiltered.length}{resultsOnlyFiltered.length !== resultsOnly.length ? ` of ${resultsOnly.length}` : ''})</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search by team"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: 'grey.500' }} /></InputAdornment> }}
                sx={{ width: 200, '& .MuiInputBase-root': { bgcolor: 'background.paper', borderRadius: 2, '& fieldset': { borderColor: 'grey.300' } } }}
              />
              <TextField
                size="small"
                label="From date"
                type="date"
                value={resultsDateFrom}
                onChange={(e) => setResultsDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 150, '& .MuiInputBase-root': { bgcolor: 'background.paper', borderRadius: 2 } }}
              />
              <TextField
                size="small"
                label="To date"
                type="date"
                value={resultsDateTo}
                onChange={(e) => setResultsDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 150, '& .MuiInputBase-root': { bgcolor: 'background.paper', borderRadius: 2 } }}
              />
              <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'background.paper', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel id="sort-results-label">Sort by</InputLabel>
                <Select labelId="sort-results-label" label="Sort by" value={sortResults} onChange={(e) => setSortResults(e.target.value)}>
                  <MenuItem value="date-desc">Date (most recent first)</MenuItem>
                  <MenuItem value="date-asc">Date (oldest first)</MenuItem>
                  <MenuItem value="home-az">Home team A → Z</MenuItem>
                  <MenuItem value="home-za">Home team Z → A</MenuItem>
                  <MenuItem value="away-az">Away team A → Z</MenuItem>
                  <MenuItem value="away-za">Away team Z → A</MenuItem>
                </Select>
              </FormControl>
              <Button
                startIcon={syncing === 'fixtures' ? <CircularProgress size={18} color="inherit" /> : <Sync />}
                onClick={handleSyncFixtures}
                disabled={syncing === 'fixtures'}
                size="medium"
                variant="contained"
                sx={{ borderRadius: 2, fontWeight: 600, bgcolor: colors.brandRed, '&:hover': { bgcolor: '#b9141a' } }}
              >
                {syncing === 'fixtures' ? 'Syncing…' : 'Sync Fixtures'}
              </Button>
            </Box>
          </Box>
          {fixturesLoading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress sx={{ color: colors.brandRed }} /><Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontWeight: 500 }}>Loading results…</Typography></Box>
          ) : fixtures.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><CheckCircle sx={{ fontSize: 56, color: 'grey.300', mb: 1.5 }} /><Typography variant="body2" color="text.secondary" fontWeight={500}>No fixtures in DB. Sync Standings first, then Sync Fixtures.</Typography></Box>
          ) : resultsOnly.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><CheckCircle sx={{ fontSize: 56, color: 'grey.300', mb: 1.5 }} /><Typography variant="body2" color="text.secondary" fontWeight={500}>No results yet. Check the Fixtures tab for upcoming matches.</Typography></Box>
          ) : resultsOnlyFiltered.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><CheckCircle sx={{ fontSize: 56, color: 'grey.300', mb: 1.5 }} /><Typography variant="body2" color="text.secondary" fontWeight={500}>No results match your filters. Try a different search or date range.</Typography></Box>
          ) : (
            <>
              <Box sx={{ px: { xs: 1, sm: 2 }, py: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" variant="outlined" onClick={expandAllResults}>Expand all</Button>
                <Button size="small" variant="outlined" onClick={collapseAllResults}>Collapse all</Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', px: { xs: 2, sm: 3 }, pb: 2 }}>
                {resultsGroupedByRound.roundKeys.map((roundKey) => {
                  const list = resultsGroupedByRound.byRound[roundKey] || [];
                  const expanded = expandedResults.includes(roundKey);
                  const roundLabel = roundKey === '_no_round' ? 'Other' : formatRoundLabel(roundKey);
                  return (
                    <Accordion
                      key={roundKey}
                      expanded={expanded}
                      onChange={handleResultAccordionChange(roundKey)}
                      elevation={0}
                      sx={{ border: `1px solid ${colors.divider}`, borderRadius: '0 !important', '&:first-of-type': { borderTopLeftRadius: 8, borderTopRightRadius: 8 }, '&:last-of-type': { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }, '&:before': { display: 'none' }, '&.Mui-expanded': { margin: 0 } }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'grey.50', minHeight: 48, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1 } }}>
                        <CalendarToday sx={{ fontSize: 20, color: 'grey.600' }} />
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'grey.800' }}>{roundLabel}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>({list.length} {list.length === 1 ? 'result' : 'results'})</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 0 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {list.map((f, idx) => {
                            const fixture = f.fixture || f;
                            const teamsObj = f.teams || {};
                            const homeName = teamsObj.home?.name ?? f.homeTeam ?? '—';
                            const awayName = teamsObj.away?.name ?? f.awayTeam ?? '—';
                            const homeLogo = teamsObj.home?.logo ?? f.homeLogo ?? getTeamLogoFromList(teams, homeName);
                            const awayLogo = teamsObj.away?.logo ?? f.awayLogo ?? getTeamLogoFromList(teams, awayName);
                            const homeTeamId = teamsObj.home?.id ?? getTeamIdFromList(teams, homeName);
                            const awayTeamId = teamsObj.away?.id ?? getTeamIdFromList(teams, awayName);
                            const goals = f.goals || {};
                            const scoreHome = goals.home ?? '0';
                            const scoreAway = goals.away ?? '0';
                            const st = fixture.status?.short ?? f.status ?? f.matchStatus;
                            const apiFixtureId = f.fixture?.id ?? f.apiFixtureId;
                            const kickoff = formatKickoffShort(getFixtureKickoff(f));
                            const goToTeam = (tid) => (e) => { e.stopPropagation(); if (tid) navigate(`${constants.routes.apiSync}/team/${tid}`, { state: { leagueId: id, tab } }); };
                            return (
                              <Paper
                                key={f.fixture?.id ?? idx}
                                elevation={0}
                                onClick={(e) => { e.stopPropagation(); apiFixtureId && navigate(`${constants.routes.apiSync}/league/${id}/fixture/${apiFixtureId}`, { state: { tab } }); }}
                                sx={{
                                  p: 2,
                                  border: `1px solid ${colors.divider}`,
                                  borderRadius: 2,
                                  cursor: apiFixtureId ? 'pointer' : 'default',
                                  '&:hover': apiFixtureId ? { bgcolor: 'grey.50', borderColor: colors.brandRed } : {},
                                  transition: 'background-color 0.2s, border-color 0.2s',
                                }}
                              >
                                {/* Same layout as fixture detail page: home (logo + name) | score + meta | away (logo + name) */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                                  <Box
                                    onClick={goToTeam(homeTeamId)}
                                    role={homeTeamId ? 'button' : undefined}
                                    title={homeTeamId ? 'View squad' : undefined}
                                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100, ...(homeTeamId && { cursor: 'pointer' }) }}
                                  >
                                    {homeLogo ? (
                                      <Box component="img" src={homeLogo} alt="" referrerPolicy="no-referrer" sx={{ width: 40, height: 40, objectFit: 'contain', mb: 0.5 }} />
                                    ) : (
                                      <SportsSoccer sx={{ color: 'grey.300', fontSize: 40, mb: 0.5 }} />
                                    )}
                                    <Typography variant="body2" fontWeight={600} textAlign="center" noWrap sx={{ maxWidth: 120 }}>{homeName}</Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center', px: 1.5, minWidth: 80 }}>
                                    <Typography variant="body2" fontWeight={700} sx={{ color: colors.brandRed }}>{scoreHome} — {scoreAway}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>{kickoff}</Typography>
                                    <Typography variant="caption" fontWeight={700} sx={{ color: colors.brandRed, display: 'inline-block', mt: 0.25, px: 1, py: 0.25, borderRadius: 1, bgcolor: 'grey.100' }}>{statusShort(st)}</Typography>
                                  </Box>
                                  <Box
                                    onClick={goToTeam(awayTeamId)}
                                    role={awayTeamId ? 'button' : undefined}
                                    title={awayTeamId ? 'View squad' : undefined}
                                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100, ...(awayTeamId && { cursor: 'pointer' }) }}
                                  >
                                    {awayLogo ? (
                                      <Box component="img" src={awayLogo} alt="" referrerPolicy="no-referrer" sx={{ width: 40, height: 40, objectFit: 'contain', mb: 0.5 }} />
                                    ) : (
                                      <SportsSoccer sx={{ color: 'grey.300', fontSize: 40, mb: 0.5 }} />
                                    )}
                                    <Typography variant="body2" fontWeight={600} textAlign="center" noWrap sx={{ maxWidth: 120 }}>{awayName}</Typography>
                                  </Box>
                                </Box>
                              </Paper>
                            );
                          })}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            </>
          )}
        </Box>
      )}

      {tab === TAB_STANDINGS && (
        <Box sx={{ border: 1, borderColor: 'divider', borderTop: 'none', borderRadius: '0 0 12px 12px', bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, px: { xs: 2, sm: 3 }, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'grey.800' }}>Standings ({standingsFiltered.length}{standingsFiltered.length !== standings.length ? ` of ${standings.length}` : ''})</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>Step 1 – sync this first. Then Teams, then Fixtures. Source of truth for official teams.</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search by team"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: 'grey.500' }} /></InputAdornment> }}
                sx={{ width: 220, '& .MuiInputBase-root': { bgcolor: 'background.paper', borderRadius: 2, '& fieldset': { borderColor: 'grey.300' } } }}
              />
              <FormControl size="small" sx={{ minWidth: 180, bgcolor: 'background.paper', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel id="sort-standings-label">Sort by</InputLabel>
                <Select labelId="sort-standings-label" label="Sort by" value={sortStandings} onChange={(e) => setSortStandings(e.target.value)}>
                  <MenuItem value="position-asc">Position (1st first)</MenuItem>
                  <MenuItem value="position-desc">Position (last first)</MenuItem>
                  <MenuItem value="team-az">Team A → Z</MenuItem>
                  <MenuItem value="team-za">Team Z → A</MenuItem>
                  <MenuItem value="points-desc">Points (high → low)</MenuItem>
                  <MenuItem value="points-asc">Points (low → high)</MenuItem>
                </Select>
              </FormControl>
              <Button
                startIcon={syncing === 'standings' ? <CircularProgress size={18} color="inherit" /> : <Sync />}
                onClick={handleSyncStandings}
                disabled={syncing === 'standings'}
                size="medium"
                variant="contained"
                sx={{ borderRadius: 2, fontWeight: 600, bgcolor: colors.brandRed, '&:hover': { bgcolor: '#b9141a' } }}
              >
                {syncing === 'standings' ? 'Syncing…' : 'Sync Standings'}
              </Button>
            </Box>
          </Box>
          {standingsGroups.length > 1 && !standingsLoading && standings.length > 0 && (
            <Box sx={{ px: { xs: 2, sm: 3 }, pt: 1.5, pb: 0.5, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Conference:
              </Typography>
              <Button
                size="small"
                variant={standingsGroup === 'all' ? 'contained' : 'outlined'}
                onClick={() => setStandingsGroup('all')}
                sx={{ textTransform: 'none', borderRadius: 999, px: 1.75, py: 0.25, fontSize: '0.72rem' }}
              >
                All
              </Button>
              {standingsGroups.map((g) => (
                <Button
                  key={g}
                  size="small"
                  variant={standingsGroup === g ? 'contained' : 'outlined'}
                  onClick={() => setStandingsGroup(g)}
                  sx={{ textTransform: 'none', borderRadius: 999, px: 1.75, py: 0.25, fontSize: '0.72rem' }}
                >
                  {g}
                </Button>
              ))}
            </Box>
          )}
          {standingsLoading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress sx={{ color: colors.brandRed }} /><Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontWeight: 500 }}>Loading standings…</Typography></Box>
          ) : standings.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><EmojiEvents sx={{ fontSize: 56, color: 'grey.300', mb: 1.5 }} /><Typography variant="body2" color="text.secondary" fontWeight={500}>No standings in DB. Sync Standings first (step 1), then Teams, then Fixtures.</Typography></Box>
          ) : standingsFiltered.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><EmojiEvents sx={{ fontSize: 56, color: 'grey.300', mb: 1.5 }} /><Typography variant="body2" color="text.secondary" fontWeight={500}>No teams match your search. Try a different filter.</Typography></Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
              <Table size="medium" sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    {isAllSeasons && <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'grey.700', borderColor: 'divider' }}>Season</TableCell>}
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'grey.700', borderColor: 'divider' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'grey.700', borderColor: 'divider' }}>Team</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'grey.700', borderColor: 'divider' }}>P</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'grey.700', borderColor: 'divider' }}>W</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'grey.700', borderColor: 'divider' }}>D</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'grey.700', borderColor: 'divider' }}>L</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'grey.700', borderColor: 'divider' }}>GD</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'grey.700', borderColor: 'divider' }}>Pts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {standingsDisplay.map((row, idx) => {
                    const team = row.team || {};
                    const all = row.all || {};
                    const teamId = team.id ?? getTeamIdFromList(teams, team.name);
                    const goToTeam = () => { if (teamId) navigate(`${constants.routes.apiSync}/team/${teamId}`, { state: { leagueId: id, tab } }); };
                    return (
                      <TableRow key={`${row._season ?? ''}-${row.rank ?? idx}`} sx={{ '&:nth-of-type(even)': { bgcolor: 'grey.50' } }}>
                        {isAllSeasons && <TableCell sx={{ fontSize: '0.875rem', borderColor: 'divider' }}>{row._season ?? '—'}</TableCell>}
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', borderColor: 'divider' }}>{row.rank ?? idx + 1}</TableCell>
                        <TableCell sx={{ borderColor: 'divider' }}>
                          <Box
                            onClick={goToTeam}
                            role={teamId ? 'button' : undefined}
                            title={teamId ? 'View squad' : undefined}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              ...(teamId && { cursor: 'pointer', '&:hover': { opacity: 0.85 } }),
                            }}
                          >
                            {team.logo && <Box component="img" src={team.logo} alt="" sx={{ width: 28, height: 28, objectFit: 'contain' }} />}
                            <Typography variant="body2" fontWeight={600} sx={{ color: 'grey.900' }}>{team.name ?? '—'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', borderColor: 'divider' }}>{all.played ?? row.played ?? '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', borderColor: 'divider' }}>{all.win ?? row.win ?? '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', borderColor: 'divider' }}>{all.draw ?? row.draw ?? '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', borderColor: 'divider' }}>{all.lose ?? row.lose ?? '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', borderColor: 'divider' }}>{row.goalsDiff ?? row.goalDiff ?? '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', fontWeight: 700, borderColor: 'divider' }}>{row.points ?? '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={standingsFiltered.length}
                page={pageStandings}
                onPageChange={handleChangePageStandings}
                rowsPerPage={rowsPerPageStandings}
                onRowsPerPageChange={handleChangeRowsPerPageStandings}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                labelRowsPerPage="Rows per page:"
                showFirstButton
                showLastButton
                sx={{ borderTop: 1, borderColor: 'divider', fontWeight: 500 }}
              />
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
}
