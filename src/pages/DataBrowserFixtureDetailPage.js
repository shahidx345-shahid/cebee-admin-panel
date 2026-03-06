/**
 * Match Detail – API Data & Sync. CeBee Results Page layout: league • matchday, teams + score,
 * kickoff, venue, city, status, half-time, goals (PEN/OG), cards.
 * Uses data.resultsPage from backend when available; falls back to legacy fixture shape.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Paper,
  Divider,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import { getFixtureDetail, getLeagueDetail, getTeamsByLeagueId } from '../services/apiSyncService';
import { colors } from '../config/theme';
import { constants } from '../config/theme';

function getTeamLogoFromList(teamsList, teamName) {
  if (!Array.isArray(teamsList) || !teamName) return null;
  const name = String(teamName).trim().toLowerCase();
  const t = teamsList.find((x) => (String(x.team_name ?? x.name ?? '').trim().toLowerCase() === name));
  return t?.logo || null;
}

function formatKickoff(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'short' });
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${weekday}, ${date} • ${time}`;
}

function getRoundLabel(round) {
  if (round == null || String(round).trim() === '') return null;
  const r = String(round).trim();
  const match = r.match(/\d+$/);
  const num = match ? match[0] : null;
  if (num != null && (r === num || r.endsWith(' - ' + num) || r.toLowerCase().includes('gameweek'))) {
    return r.toLowerCase().includes('gameweek') ? `Gameweek ${num}` : `Matchday ${num}`;
  }
  return r;
}

function statusLabel(short) {
  const s = String(short || '').toUpperCase();
  if (s === 'NS') return 'Not Started';
  if (s === 'FT') return 'Finished';
  if (s === 'HT') return 'Halftime';
  if (s === '1H' || s === '2H') return 'Live';
  return short || '—';
}

export default function DataBrowserFixtureDetailPage() {
  const { id: leagueId, fixtureId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fixture, setFixture] = useState(null);
  const [leagueDetail, setLeagueDetail] = useState(null);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (!fixtureId) return;
    setLoading(true);
    setError(null);
    getFixtureDetail(fixtureId, true)
      .then((res) => {
        if (res.success && res.data) setFixture(res.data);
        else setError(res.error || 'Fixture not found');
      })
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [fixtureId]);

  useEffect(() => {
    if (!leagueId) return;
    getLeagueDetail(leagueId)
      .then((res) => {
        if (res.success && res.data) setLeagueDetail(res.data);
      })
      .catch(() => setLeagueDetail(null));
  }, [leagueId]);

  useEffect(() => {
    if (!leagueId) return;
    getTeamsByLeagueId(leagueId, 'all')
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setTeams(res.data);
      })
      .catch(() => setTeams([]));
  }, [leagueId]);

  const handleBack = () => navigate(`${constants.routes.apiSync}/league/${leagueId}`);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress sx={{ color: colors.brandRed }} />
        <Typography variant="body2" color="text.secondary">Loading match…</Typography>
      </Box>
    );
  }

  if (error || !fixture) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => navigate(-1)}>{error || 'Fixture not found'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mt: 2 }}>Back to league</Button>
      </Box>
    );
  }

  // CeBee Results Page: prefer resultsPage from backend when available
  const rp = fixture.resultsPage || {};
  const comp = rp.competitionContext || {};
  const identity = rp.matchIdentity || {};
  const info = rp.matchInfo || {};
  const result = rp.resultSummary || {};
  const goalsList = Array.isArray(rp.goals) ? rp.goals : [];
  const cardsList = Array.isArray(rp.cards) ? rp.cards : [];

  const leagueName = comp.leagueName ?? leagueDetail?.league?.name_display ?? leagueDetail?.league?.league_name ?? fixture.leagueName ?? (fixture.league || {}).name ?? 'League';
  const roundLabel = comp.round != null && String(comp.round).trim() !== '' ? getRoundLabel(comp.round) : getRoundLabel(fixture.round ?? (fixture.league || {}).round ?? (fixture.fixture || {}).round);
  const leagueLogo = leagueDetail?.league?.logo ?? (fixture.league || {}).logo ?? null;

  const home = identity.homeTeam || fixture.teams?.home || {};
  const away = identity.awayTeam || fixture.teams?.away || {};
  const homeLogo = home.logo ?? getTeamLogoFromList(teams, home.name);
  const awayLogo = away.logo ?? getTeamLogoFromList(teams, away.name);

  const fullTime = result.fullTimeScore || fixture.goals || {};
  const halfTime = result.halfTimeScore || null;
  const homeScore = fullTime.home;
  const awayScore = fullTime.away;
  const hasScore = homeScore != null && awayScore != null;

  const kickoffStr = info.kickoffLabel ?? formatKickoff((fixture.fixture || {}).date);
  const matchStatus = info.matchStatus ?? statusLabel((fixture.fixture || {}).status?.short ?? fixture.status);
  const stadiumName = info.stadiumName ?? fixture.venue ?? (fixture.fixture || {}).venue?.name;
  const city = info.city;
  const venueLine = stadiumName ? (city ? `${stadiumName} — ${city}` : stadiumName) : '—';

  // Fallback goals from raw events when no resultsPage.goals
  const events = Array.isArray(fixture.events) ? fixture.events : [];
  const goalEvents = goalsList.length > 0 ? goalsList : events.filter((e) => (e.type || '').toLowerCase() === 'goal');

  return (
    <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate(constants.routes.apiSync); }}>
          API Data & Sync
        </Link>
        <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); handleBack(); }}>
          League
        </Link>
        <Typography color="text.primary">Match</Typography>
      </Breadcrumbs>

      <Button startIcon={<ArrowBack />} onClick={handleBack} size="small" sx={{ mb: 2 }}>
        Back to league
      </Button>

      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${colors.divider}`, borderRadius: 2 }}>
        {/* Competition: League • Matchday */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          {leagueLogo ? (
            <Box component="img" src={leagueLogo} alt="" referrerPolicy="no-referrer" sx={{ width: 40, height: 40, objectFit: 'contain' }} />
          ) : null}
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
            {[leagueName, roundLabel].filter(Boolean).join(' • ')}
          </Typography>
        </Box>

        {/* Match identity + score */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap', py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140 }}>
            {homeLogo ? (
              <Box component="img" src={homeLogo} alt="" referrerPolicy="no-referrer" sx={{ width: 56, height: 56, objectFit: 'contain', mb: 1 }} />
            ) : (
              <SportsSoccer sx={{ fontSize: 56, color: 'grey.300', mb: 1 }} />
            )}
            <Typography variant="subtitle1" fontWeight={700} textAlign="center">{home.name || '—'}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', px: 2 }}>
            {hasScore ? (
              <Typography variant="h4" fontWeight={800} sx={{ color: colors.brandRed }}>
                {homeScore ?? 0} — {awayScore ?? 0}
              </Typography>
            ) : (
              <Typography variant="h6" color="text.secondary">vs</Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>{matchStatus}</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140 }}>
            {awayLogo ? (
              <Box component="img" src={awayLogo} alt="" referrerPolicy="no-referrer" sx={{ width: 56, height: 56, objectFit: 'contain', mb: 1 }} />
            ) : (
              <SportsSoccer sx={{ fontSize: 56, color: 'grey.300', mb: 1 }} />
            )}
            <Typography variant="subtitle1" fontWeight={700} textAlign="center">{away.name || '—'}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Match info: Kickoff, Venue, City, Status */}
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          <Typography variant="body2">
            <strong>Kickoff:</strong> {kickoffStr}
          </Typography>
          <Typography variant="body2">
            <strong>Venue:</strong> {venueLine}
          </Typography>
          <Typography variant="body2">
            <strong>Status:</strong> {matchStatus}
          </Typography>
          {halfTime != null && (halfTime.home != null || halfTime.away != null) && (
            <Typography variant="body2">
              <strong>Half-time:</strong> {halfTime.home ?? 0} — {halfTime.away ?? 0}
            </Typography>
          )}
        </Box>

        {/* Goals (with PEN / OG from resultsPage or parsed from events) */}
        {(goalEvents.length > 0) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Goals</Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {goalEvents.map((g, idx) => {
                if (g.label) {
                  return (
                    <li key={idx} style={{ marginBottom: 4 }}>
                      <Typography variant="body2">⚽ {g.label}</Typography>
                    </li>
                  );
                }
                const player = g.scorerName ?? g.player?.name ?? '?';
                const elapsed = g.minute ?? g.time?.elapsed;
                const detail = g.detail || '';
                const isPenalty = (detail || '').toLowerCase().includes('penalty');
                const isOwnGoal = (detail || '').toLowerCase().includes('own');
                const namePart = [player, isPenalty ? '(PEN)' : '', isOwnGoal ? '(OG)' : ''].filter(Boolean).join(' ');
                const goalLine = elapsed != null ? `${namePart} — ${elapsed}'` : namePart;
                return (
                  <li key={idx} style={{ marginBottom: 4 }}>
                    <Typography variant="body2">⚽ {goalLine}</Typography>
                  </li>
                );
              })}
            </Box>
          </>
        )}

        {/* Discipline: Yellow / Red cards */}
        {cardsList.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Cards</Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {cardsList.map((c, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>
                  <Typography variant="body2">{c.label || (c.minute != null ? `${c.cardType === 'red' ? '🟥' : '🟨'} ${c.playerName || '?'} — ${c.minute}'` : `${c.cardType === 'red' ? '🟥' : '🟨'} ${c.playerName || '?'}`)}</Typography>
                </li>
              ))}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
