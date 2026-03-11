/**
 * Match Detail – API Data & Sync. CeBee Results Page layout: league • matchday, teams + score,
 * kickoff, venue, city, status, half-time, goals (PEN/OG), cards.
 * Uses data.resultsPage from backend when available; falls back to legacy fixture shape.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import { colors, typography as themeTypo, buttons as themeButtons } from '../config/theme';
import { constants } from '../config/theme';

function getTeamLogoFromList(teamsList, teamName) {
  if (!Array.isArray(teamsList) || !teamName) return null;
  const name = String(teamName).trim().toLowerCase();
  const t = teamsList.find((x) => (String(x.team_name ?? x.name ?? '').trim().toLowerCase() === name));
  return t?.logo || null;
}

function getTeamIdFromList(teamsList, teamName) {
  if (!Array.isArray(teamsList) || !teamName) return null;
  const name = String(teamName).trim().toLowerCase();
  const t = teamsList.find((x) => (String(x.team_name ?? x.name ?? '').trim().toLowerCase() === name));
  return t?.apiTeamId ?? t?._id ?? t?.team_id ?? null;
}

const KICKOFF_TIMEZONE = 'Etc/GMT-1'; // UTC+1

function formatKickoff(dateStr) {
  if (dateStr == null || dateStr === '') return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  const opts = { timeZone: KICKOFF_TIMEZONE };
  const weekday = d.toLocaleDateString('en-GB', { ...opts, weekday: 'short' });
  const date = d.toLocaleDateString('en-GB', { ...opts, day: 'numeric', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { ...opts, hour: '2-digit', minute: '2-digit', hour12: false });
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
  const location = useLocation();
  const fromTab = location.state?.tab;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fixture, setFixture] = useState(null);
  const [leagueDetail, setLeagueDetail] = useState(null);
  const [teams, setTeams] = useState([]);
  const [liveTick, setLiveTick] = useState(0);
  const [countdownTick, setCountdownTick] = useState(0);

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

  useEffect(() => {
    if (!fixture) return;
    const kickoffDate = (fixture.fixture || {}).date;
    const matchStatus = (fixture.resultsPage || {}).matchInfo?.matchStatus ?? statusLabel((fixture.fixture || {}).status?.short ?? fixture.status);
    const isLiveOrHT = matchStatus === 'Live' || matchStatus === 'Halftime' || matchStatus === 'HT';
    if (!isLiveOrHT || !kickoffDate) return;
    const id = setInterval(() => setLiveTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [fixture]);

  useEffect(() => {
    if (!fixture) return;
    const kickoffDate = (fixture.fixture || {}).date;
    if (!kickoffDate || new Date(kickoffDate).getTime() <= Date.now()) return;
    const matchStatus = (fixture.resultsPage || {}).matchInfo?.matchStatus ?? statusLabel((fixture.fixture || {}).status?.short ?? fixture.status);
    if (matchStatus === 'Live' || matchStatus === 'Halftime' || matchStatus === 'HT') return;
    const id = setInterval(() => setCountdownTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [fixture]);

  const handleBack = () => {
    if (leagueId) {
      const tab = fromTab && ['overview', 'fixtures', 'results', 'standings', 'teams'].includes(fromTab) ? fromTab : 'fixtures';
      navigate(`${constants.routes.apiSync}/league/${leagueId}?tab=${tab}`);
    } else {
      navigate(-1);
    }
  };

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
        <Alert severity="error" onClose={handleBack}>{error || 'Fixture not found'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mt: 2 }}>Back</Button>
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
  const substitutionsList = Array.isArray(rp.substitutions) ? rp.substitutions : [];
  const matchStats = rp.matchStats && typeof rp.matchStats === 'object' ? rp.matchStats : null;

  const leagueName = comp.leagueName ?? leagueDetail?.league?.name_display ?? leagueDetail?.league?.league_name ?? fixture.leagueName ?? (fixture.league || {}).name ?? 'League';
  const roundLabel = comp.round != null && String(comp.round).trim() !== '' ? getRoundLabel(comp.round) : getRoundLabel(fixture.round ?? (fixture.league || {}).round ?? (fixture.fixture || {}).round);
  const leagueLogo = leagueDetail?.league?.logo ?? (fixture.league || {}).logo ?? null;

  const home = identity.homeTeam || fixture.teams?.home || {};
  const away = identity.awayTeam || fixture.teams?.away || {};
  const homeLogo = home.logo ?? getTeamLogoFromList(teams, home.name);
  const awayLogo = away.logo ?? getTeamLogoFromList(teams, away.name);
  const homeTeamId = home.id ?? getTeamIdFromList(teams, home.name);
  const awayTeamId = away.id ?? getTeamIdFromList(teams, away.name);
  const goToPlayers = (tid) => (e) => { e.preventDefault(); e.stopPropagation(); if (tid) navigate(`${constants.routes.apiSync}/team/${tid}`, { state: { leagueId, fixtureId } }); };
  const fullTime = result.fullTimeScore || fixture.goals || {};
  const halfTime = result.halfTimeScore || null;
  const homeScore = fullTime.home;
  const awayScore = fullTime.away;
  const hasScore = homeScore != null && awayScore != null;

  const kickoffDateRaw = (fixture.fixture || {}).date;
  const kickoffStr = kickoffDateRaw ? formatKickoff(kickoffDateRaw) : (info.kickoffLabel || '—');
  const matchStatus = info.matchStatus ?? statusLabel((fixture.fixture || {}).status?.short ?? fixture.status);
  const stadiumName = info.stadiumName ?? fixture.venue ?? (fixture.fixture || {}).venue?.name;
  const city = info.city;
  const venueLine = stadiumName ? (city ? `${stadiumName} — ${city}` : stadiumName) : '—';

  const isLiveOrHT = matchStatus === 'Live' || matchStatus === 'Halftime' || matchStatus === 'HT';
  const kickoffDate = (fixture.fixture || {}).date;
  const liveElapsedMins = isLiveOrHT && kickoffDate
    ? Math.max(0, Math.floor((Date.now() - new Date(kickoffDate).getTime()) / 60000))
    : null;
  const countdownToKickoffMs = kickoffDate && !isLiveOrHT ? new Date(kickoffDate).getTime() - Date.now() : null;
  const countdownToKickoffStr = (() => {
    if (countdownToKickoffMs == null || countdownToKickoffMs <= 0) return null;
    const d = Math.floor(countdownToKickoffMs / 86400000);
    const h = Math.floor((countdownToKickoffMs % 86400000) / 3600000);
    const m = Math.floor((countdownToKickoffMs % 3600000) / 60000);
    if (d > 0) return `Starts in ${d}d ${h}h ${m}m`;
    if (h > 0) return `Starts in ${h}h ${m}m`;
    if (m > 0) return `Starts in ${m}m`;
    return 'Starts soon';
  })();

  // Fallback goals from raw events when no resultsPage.goals
  const events = Array.isArray(fixture.events) ? fixture.events : [];
  const goalEvents = goalsList.length > 0 ? goalsList : events.filter((e) => (e.type || '').toLowerCase() === 'goal');
  const homeGoals = goalEvents.filter((g) => g.isHomeGoal === true);
  const awayGoals = goalEvents.filter((g) => g.isHomeGoal === false);
  const otherGoals = goalEvents.filter((g) => g.isHomeGoal !== true && g.isHomeGoal !== false);
  const hasSplitGoals = homeGoals.length > 0 || awayGoals.length > 0;

  const homeCards = cardsList.filter((c) => c.isHomeTeam === true);
  const awayCards = cardsList.filter((c) => c.isHomeTeam === false);
  const otherCards = cardsList.filter((c) => c.isHomeTeam !== true && c.isHomeTeam !== false);
  const hasSplitCards = homeCards.length > 0 || awayCards.length > 0;

  const homeSubs = substitutionsList.filter((s) => s.isHomeTeam === true);
  const awaySubs = substitutionsList.filter((s) => s.isHomeTeam === false);
  const otherSubs = substitutionsList.filter((s) => s.isHomeTeam !== true && s.isHomeTeam !== false);
  const hasSplitSubs = homeSubs.length > 0 || awaySubs.length > 0;

  const renderCardLine = (c, key) => (
    <li key={key} style={{ marginBottom: 6 }}>
      <Typography sx={{ fontSize: themeTypo.fontSize.bodySmall, lineHeight: themeTypo.lineHeight.relaxed, color: colors.textPrimary }}>
        {c.label || (c.minute != null ? `${c.cardType === 'red' ? '🟥' : '🟨'} ${c.playerName || '?'} — ${c.minute}'` : `${c.cardType === 'red' ? '🟥' : '🟨'} ${c.playerName || '?'}`)}
      </Typography>
    </li>
  );

  // Match stats rows: [ { label, homeVal, awayVal, suffix } ]. Higher value gets highlighted.
  const matchStatRows = matchStats ? (() => {
    const s = matchStats;
    const rows = [];
    if (s.shotsHome != null || s.shotsAway != null) rows.push({ label: 'Shots', homeVal: s.shotsHome ?? 0, awayVal: s.shotsAway ?? 0, suffix: '' });
    if (s.shotsOnTargetHome != null || s.shotsOnTargetAway != null) rows.push({ label: 'Shots on target', homeVal: s.shotsOnTargetHome ?? 0, awayVal: s.shotsOnTargetAway ?? 0, suffix: '' });
    if (s.possessionHome != null || s.possessionAway != null) rows.push({ label: 'Possession', homeVal: s.possessionHome ?? 0, awayVal: s.possessionAway ?? 0, suffix: '%' });
    if (s.passesHome != null || s.passesAway != null) rows.push({ label: 'Passes', homeVal: s.passesHome ?? 0, awayVal: s.passesAway ?? 0, suffix: '' });
    if (s.passAccuracyHome != null || s.passAccuracyAway != null) rows.push({ label: 'Pass accuracy', homeVal: s.passAccuracyHome ?? 0, awayVal: s.passAccuracyAway ?? 0, suffix: '%' });
    if (s.foulsHome != null || s.foulsAway != null) rows.push({ label: 'Fouls', homeVal: s.foulsHome ?? 0, awayVal: s.foulsAway ?? 0, suffix: '' });
    if (s.yellowCardsHome != null || s.yellowCardsAway != null) rows.push({ label: 'Yellow cards', homeVal: s.yellowCardsHome ?? 0, awayVal: s.yellowCardsAway ?? 0, suffix: '' });
    if (s.redCardsHome != null || s.redCardsAway != null) rows.push({ label: 'Red cards', homeVal: s.redCardsHome ?? 0, awayVal: s.redCardsAway ?? 0, suffix: '' });
    if (s.offsidesHome != null || s.offsidesAway != null) rows.push({ label: 'Offsides', homeVal: s.offsidesHome ?? 0, awayVal: s.offsidesAway ?? 0, suffix: '' });
    if (s.cornersHome != null || s.cornersAway != null) rows.push({ label: 'Corners', homeVal: s.cornersHome ?? 0, awayVal: s.cornersAway ?? 0, suffix: '' });
    return rows;
  })() : [];

  const renderGoalLine = (g, key) => {
    const hasFullGoal = g.scorerName != null && (g.minute != null || g.scoreAfter != null);
    if (hasFullGoal) {
      const minuteStr = g.minute != null ? `${g.minute}'` : '';
      const scoreStr = g.scoreAfter ? `${g.scoreAfter.home}-${g.scoreAfter.away}` : '';
      return (
        <li key={key} style={{ marginBottom: 10, listStyle: 'none', display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.25em' }}>
          {minuteStr && (
            <Typography component="span" sx={{ fontSize: themeTypo.fontSize.bodySmall, color: colors.textSecondary, fontWeight: themeTypo.fontWeight.medium, minWidth: 28 }}>
              {minuteStr}
            </Typography>
          )}
          <Typography component="span" sx={{ fontSize: themeTypo.fontSize.bodySmall, color: colors.textPrimary, mr: 0.5 }}>⚽</Typography>
          {scoreStr && (
            <Typography component="span" sx={{ fontSize: themeTypo.fontSize.bodySmall, color: colors.textPrimary, fontWeight: themeTypo.fontWeight.semibold, mr: 1 }}>
              {scoreStr}
            </Typography>
          )}
          <Typography component="span" sx={{ fontSize: themeTypo.fontSize.bodySmall, color: colors.textPrimary, fontWeight: themeTypo.fontWeight.bold }}>
            {g.scorerName || '?'}
          </Typography>
          {g.assistName && (
            <Typography component="span" sx={{ fontSize: themeTypo.fontSize.bodySmall, color: colors.textSecondary, fontWeight: themeTypo.fontWeight.regular }}>
              {' '}({g.assistName})
            </Typography>
          )}
          {g.isPenalty && (
            <Typography
              component="span"
              sx={{
                fontSize: themeTypo.fontSize.caption,
                fontWeight: themeTypo.fontWeight.semibold,
                ml: 0.5,
                px: 0.75,
                py: 0.15,
                borderRadius: 1,
                bgcolor: 'action.hover',
                color: 'text.secondary',
              }}
            >
              PEN
            </Typography>
          )}
          {g.isOwnGoal && (
            <Typography
              component="span"
              sx={{
                fontSize: themeTypo.fontSize.caption,
                fontWeight: themeTypo.fontWeight.semibold,
                ml: 0.5,
                px: 0.75,
                py: 0.15,
                borderRadius: 1,
                bgcolor: 'action.hover',
                color: 'text.secondary',
              }}
            >
              OG
            </Typography>
          )}
        </li>
      );
    }
    const player = g.scorerName ?? g.player?.name ?? '?';
    const elapsed = g.minute ?? g.time?.elapsed;
    const detail = g.detail || '';
    const isPenalty = (detail || '').toLowerCase().includes('penalty');
    const isOwnGoal = (detail || '').toLowerCase().includes('own');
    const namePart = [player, isPenalty ? '(PEN)' : '', isOwnGoal ? '(OG)' : ''].filter(Boolean).join(' ');
    const goalLine = elapsed != null ? `${elapsed}' ${namePart}` : namePart;
    return (
      <li key={key} style={{ marginBottom: 10, listStyle: 'none' }}>
        <Typography component="span" sx={{ fontSize: themeTypo.fontSize.bodySmall, lineHeight: themeTypo.lineHeight.relaxed, color: colors.textPrimary }}>
          ⚽ {goalLine}
        </Typography>
      </li>
    );
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: 720,
        mx: 'auto',
        fontFamily: themeTypo.fontFamily.primary,
      }}
    >
      <Breadcrumbs
        sx={{
          mb: 2,
          '& .MuiBreadcrumbs-separator': { mx: 0.5 },
        }}
      >
        <Link
          underline="hover"
          color="inherit"
          href="#"
          onClick={(e) => { e.preventDefault(); handleBack(); }}
          sx={{ fontSize: themeTypo.fontSize.caption, fontWeight: themeTypo.fontWeight.medium, color: colors.textSecondary }}
        >
          League
        </Link>
        <Typography sx={{ fontSize: themeTypo.fontSize.caption, fontWeight: themeTypo.fontWeight.semibold, color: colors.textPrimary }}>
          Match
        </Typography>
      </Breadcrumbs>

      <Button
        startIcon={<ArrowBack />}
        onClick={handleBack}
        size="small"
        sx={{
          mb: 2,
          fontSize: themeTypo.fontSize.button,
          fontWeight: themeTypo.fontWeight.semibold,
          textTransform: 'none',
          color: colors.brandRed,
        }}
      >
        Back
      </Button>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3.5 },
          border: `1px solid ${colors.divider}`,
          borderRadius: themeButtons.borderRadius.medium,
          overflow: 'hidden',
          bgcolor: colors.cardBackground,
          boxShadow: '0 1px 3px ' + colors.shadow,
        }}
      >
        {/* League + round | Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {leagueLogo ? (
              <Box component="img" src={leagueLogo} alt="" referrerPolicy="no-referrer" sx={{ width: 36, height: 36, objectFit: 'contain' }} />
          ) : null}
            <Typography
              sx={{
                fontSize: themeTypo.fontSize.bodySmall,
                fontWeight: themeTypo.fontWeight.semibold,
                color: colors.textSecondary,
                letterSpacing: themeTypo.letterSpacing.normal,
                lineHeight: themeTypo.lineHeight.normal,
              }}
            >
              {leagueName}{roundLabel ? ` · ${roundLabel}` : ''}
            </Typography>
          </Box>
          <Box
            component="span"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: themeTypo.fontSize.caption,
              fontWeight: themeTypo.fontWeight.bold,
              color: colors.brandWhite,
              bgcolor: colors.brandRed,
              letterSpacing: themeTypo.letterSpacing.wide,
            }}
          >
            {matchStatus}
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          {countdownToKickoffStr && (
            <Typography sx={{ fontSize: themeTypo.fontSize.bodySmall, fontWeight: themeTypo.fontWeight.semibold, color: colors.brandRed, lineHeight: 1.5 }}>
              {countdownToKickoffStr}
            </Typography>
          )}
          {kickoffStr && (
            <Typography
              sx={{
                fontSize: themeTypo.fontSize.bodySmall,
                color: colors.textSecondary,
                mt: countdownToKickoffStr ? 0.5 : 0,
                fontWeight: themeTypo.fontWeight.medium,
                lineHeight: themeTypo.lineHeight.normal,
              }}
            >
              {kickoffStr}
          </Typography>
          )}
        </Box>

        {liveElapsedMins != null && (
          <Typography sx={{ textAlign: 'center', fontSize: themeTypo.fontSize.h4, fontWeight: themeTypo.fontWeight.bold, color: colors.brandRed, mb: 1.5, letterSpacing: themeTypo.letterSpacing.tight }}>
            {liveElapsedMins}'
          </Typography>
        )}

        {/* Teams + Score */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            py: 3.5,
            px: { xs: 1, sm: 2 },
            bgcolor: colors.backgroundLight,
            borderRadius: themeButtons.borderRadius.small,
            my: 2.5,
          }}
        >
          <Box
            onClick={goToPlayers(homeTeamId)}
            role={homeTeamId ? 'button' : undefined}
            title={homeTeamId ? 'View squad' : undefined}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: '1 1 0',
              minWidth: 120,
              maxWidth: 200,
              ...(homeTeamId && { cursor: 'pointer', '&:hover': { opacity: 0.9 } }),
            }}
          >
            {homeLogo ? (
              <Box component="img" src={homeLogo} alt="" referrerPolicy="no-referrer" sx={{ width: 60, height: 60, objectFit: 'contain', mb: 1.5 }} />
            ) : (
              <SportsSoccer sx={{ fontSize: 60, color: 'grey.400', mb: 1.5 }} />
            )}
            <Typography
              sx={{
                fontSize: themeTypo.fontSize.body,
                fontWeight: themeTypo.fontWeight.bold,
                textAlign: 'center',
                color: colors.textPrimary,
                lineHeight: themeTypo.lineHeight.tight,
              }}
            >
              {home.name || '—'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', px: 2, flex: '0 0 auto' }}>
            {hasScore ? (
              <Typography
                sx={{
                  fontSize: themeTypo.fontSize.h2,
                  fontWeight: themeTypo.fontWeight.extrabold,
                  color: colors.brandRed,
                  letterSpacing: '-0.02em',
                  lineHeight: themeTypo.lineHeight.tight,
                }}
              >
                {homeScore ?? 0} — {awayScore ?? 0}
              </Typography>
            ) : (
              <Typography sx={{ fontSize: themeTypo.fontSize.h6, fontWeight: themeTypo.fontWeight.semibold, color: colors.textSecondary }}>vs</Typography>
            )}
            <Typography
              sx={{
                mt: 0.75,
                fontSize: themeTypo.fontSize.bodySmall,
                color: colors.textSecondary,
                fontWeight: themeTypo.fontWeight.medium,
                lineHeight: themeTypo.lineHeight.normal,
              }}
            >
              {venueLine || '—'}
            </Typography>
          </Box>
          <Box
            onClick={goToPlayers(awayTeamId)}
            role={awayTeamId ? 'button' : undefined}
            title={awayTeamId ? 'View squad' : undefined}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: '1 1 0',
              minWidth: 120,
              maxWidth: 200,
              ...(awayTeamId && { cursor: 'pointer', '&:hover': { opacity: 0.9 } }),
            }}
          >
            {awayLogo ? (
              <Box component="img" src={awayLogo} alt="" referrerPolicy="no-referrer" sx={{ width: 60, height: 60, objectFit: 'contain', mb: 1.5 }} />
            ) : (
              <SportsSoccer sx={{ fontSize: 60, color: 'grey.400', mb: 1.5 }} />
            )}
            <Typography
              sx={{
                fontSize: themeTypo.fontSize.body,
                fontWeight: themeTypo.fontWeight.bold,
                textAlign: 'center',
                color: colors.textPrimary,
                lineHeight: themeTypo.lineHeight.tight,
              }}
            >
              {away.name || '—'}
            </Typography>
          </Box>
        </Box>

        {/* Half-time */}
          {halfTime != null && (halfTime.home != null || halfTime.away != null) && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography
              sx={{
                fontSize: themeTypo.fontSize.bodySmall,
                color: colors.textSecondary,
                fontWeight: themeTypo.fontWeight.medium,
                lineHeight: themeTypo.lineHeight.normal,
              }}
            >
              <Box component="span" sx={{ fontWeight: themeTypo.fontWeight.bold, color: colors.textPrimary }}>Half-time:</Box> {halfTime.home ?? 0} — {halfTime.away ?? 0}
            </Typography>
          </Box>
          )}

        {/* Goals */}
        {(goalEvents.length > 0) && (
          <Box sx={{ mt: 3.5, mb: 2 }}>
            <Divider sx={{ mb: 2.5, borderColor: colors.divider }} />
            <Typography
              sx={{
                fontSize: themeTypo.fontSize.h6,
                fontWeight: themeTypo.fontWeight.bold,
                color: colors.textPrimary,
                mb: 2,
                letterSpacing: themeTypo.letterSpacing.normal,
                lineHeight: themeTypo.lineHeight.tight,
              }}
            >
              Goals
            </Typography>
            {hasSplitGoals ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 0' }, maxWidth: { sm: '48%' }, textAlign: 'left' }}>
                  <Typography
                    sx={{
                      display: 'block',
                      mb: 1.25,
                      fontSize: themeTypo.fontSize.caption,
                      fontWeight: themeTypo.fontWeight.bold,
                      color: colors.textPrimary,
                      textTransform: 'uppercase',
                      letterSpacing: themeTypo.letterSpacing.wider,
                      lineHeight: 1.3,
                    }}
                  >
                    {home.name || 'Home'}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5, listStylePosition: 'outside' }}>
                    {homeGoals.map((g, idx) => renderGoalLine(g, `home-${idx}`))}
                  </Box>
                  {homeGoals.length === 0 && (
                    <Typography sx={{ fontSize: themeTypo.fontSize.bodySmall, color: colors.textHint, fontStyle: 'italic', lineHeight: themeTypo.lineHeight.normal }}>— No goals</Typography>
                  )}
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 0' }, maxWidth: { sm: '48%' }, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Typography
                    sx={{
                      display: 'block',
                      mb: 1.25,
                      fontSize: themeTypo.fontSize.caption,
                      fontWeight: themeTypo.fontWeight.bold,
                      color: colors.textPrimary,
                      textTransform: 'uppercase',
                      letterSpacing: themeTypo.letterSpacing.wider,
                      lineHeight: 1.3,
                    }}
                  >
                    {away.name || 'Away'}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5, listStylePosition: 'outside', textAlign: 'left', alignSelf: 'flex-end' }}>
                    {awayGoals.map((g, idx) => renderGoalLine(g, `away-${idx}`))}
                  </Box>
                  {awayGoals.length === 0 && (
                    <Typography sx={{ fontSize: themeTypo.fontSize.bodySmall, color: colors.textHint, fontStyle: 'italic', lineHeight: themeTypo.lineHeight.normal }}>— No goals</Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Box component="ul" sx={{ m: 0, pl: 2.5, listStylePosition: 'outside' }}>
                {goalEvents.map((g, idx) => renderGoalLine(g, `goal-${idx}`))}
              </Box>
            )}
            {otherGoals.length > 0 && hasSplitGoals && (
              <Box sx={{ mt: 2.5, pt: 2.5, borderTop: 1, borderColor: colors.divider }}>
                <Typography sx={{ display: 'block', mb: 1, fontSize: themeTypo.fontSize.caption, fontWeight: themeTypo.fontWeight.semibold, color: colors.textSecondary }}>Other</Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5, listStylePosition: 'outside' }}>
                  {otherGoals.map((g, idx) => renderGoalLine(g, `other-${idx}`))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Cards — home team left, away team right */}
        {cardsList.length > 0 && (
          <Box sx={{ mt: 3.5 }}>
            <Divider sx={{ mb: 2.5, borderColor: colors.divider }} />
            <Typography
              sx={{
                fontSize: themeTypo.fontSize.h6,
                fontWeight: themeTypo.fontWeight.bold,
                color: colors.textPrimary,
                mb: 2,
                letterSpacing: themeTypo.letterSpacing.normal,
                lineHeight: themeTypo.lineHeight.tight,
              }}
            >
              Cards
            </Typography>
            {hasSplitCards ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 0' }, maxWidth: { sm: '48%' }, textAlign: 'left' }}>
                  <Typography sx={{ display: 'block', mb: 1.25, fontSize: themeTypo.fontSize.caption, fontWeight: themeTypo.fontWeight.bold, color: 'text.primary', textTransform: 'uppercase', letterSpacing: themeTypo.letterSpacing.wider, lineHeight: 1.3 }}>
                    {home.name || 'Home'}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5, listStylePosition: 'outside' }}>
                    {homeCards.map((c, idx) => renderCardLine(c, `home-card-${idx}`))}
                  </Box>
                  {homeCards.length === 0 && (
                    <Typography sx={{ fontSize: themeTypo.fontSize.bodySmall, color: colors.textHint, fontStyle: 'italic', lineHeight: themeTypo.lineHeight.normal }}>— No cards</Typography>
                  )}
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 0' }, maxWidth: { sm: '48%' }, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Typography sx={{ display: 'block', mb: 1.25, fontSize: themeTypo.fontSize.caption, fontWeight: themeTypo.fontWeight.bold, color: 'text.primary', textTransform: 'uppercase', letterSpacing: themeTypo.letterSpacing.wider, lineHeight: 1.3 }}>
                    {away.name || 'Away'}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5, listStylePosition: 'outside', textAlign: 'left', alignSelf: 'flex-end' }}>
                    {awayCards.map((c, idx) => renderCardLine(c, `away-card-${idx}`))}
                  </Box>
                  {awayCards.length === 0 && (
                    <Typography sx={{ fontSize: themeTypo.fontSize.bodySmall, color: colors.textHint, fontStyle: 'italic', lineHeight: themeTypo.lineHeight.normal }}>— No cards</Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Box component="ul" sx={{ m: 0, pl: 2.5, listStylePosition: 'outside' }}>
                {cardsList.map((c, idx) => renderCardLine(c, `card-${idx}`))}
              </Box>
            )}
            {otherCards.length > 0 && hasSplitCards && (
              <Box sx={{ mt: 2.5, pt: 2.5, borderTop: 1, borderColor: colors.divider }}>
                <Typography sx={{ display: 'block', mb: 1, fontSize: themeTypo.fontSize.caption, fontWeight: themeTypo.fontWeight.semibold, color: colors.textSecondary }}>Other</Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5, listStylePosition: 'outside' }}>
                  {otherCards.map((c, idx) => renderCardLine(c, `other-card-${idx}`))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Substitutions — below Cards, home left / away right */}
        {substitutionsList.length > 0 && (
          <Box sx={{ mt: 3.5 }}>
            <Divider sx={{ mb: 2.5, borderColor: colors.divider }} />
            <Typography sx={{ fontSize: themeTypo.fontSize.h6, fontWeight: themeTypo.fontWeight.bold, color: colors.textPrimary, mb: 2, letterSpacing: themeTypo.letterSpacing.normal, lineHeight: themeTypo.lineHeight.tight }}>
              Substitutions
            </Typography>
            {hasSplitSubs ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 0' }, maxWidth: { sm: '48%' }, textAlign: 'left' }}>
                  <Typography sx={{ display: 'block', mb: 1.25, fontSize: themeTypo.fontSize.caption, fontWeight: themeTypo.fontWeight.bold, color: 'text.primary', textTransform: 'uppercase', letterSpacing: themeTypo.letterSpacing.wider, lineHeight: 1.3 }}>
                    {home.name || 'Home'}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5, listStylePosition: 'outside' }}>
                    {homeSubs.map((s, idx) => (
                      <li key={`home-sub-${idx}`} style={{ marginBottom: 6 }}>
                        <Typography sx={{ fontSize: themeTypo.fontSize.bodySmall, lineHeight: themeTypo.lineHeight.relaxed, color: colors.textPrimary }}>
                          {s.minute != null ? `${s.minute}' ` : ''}{s.label || (s.playerOut && s.playerIn ? `${s.playerOut} → ${s.playerIn}` : s.playerIn || s.playerOut || '—')}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                  {homeSubs.length === 0 && (
                    <Typography sx={{ fontSize: themeTypo.fontSize.bodySmall, color: colors.textHint, fontStyle: 'italic', lineHeight: themeTypo.lineHeight.normal }}>— No substitutions</Typography>
                  )}
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 0' }, maxWidth: { sm: '48%' }, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Typography sx={{ display: 'block', mb: 1.25, fontSize: themeTypo.fontSize.caption, fontWeight: themeTypo.fontWeight.bold, color: 'text.primary', textTransform: 'uppercase', letterSpacing: themeTypo.letterSpacing.wider, lineHeight: 1.3 }}>
                    {away.name || 'Away'}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5, listStylePosition: 'outside', textAlign: 'left', alignSelf: 'flex-end' }}>
                    {awaySubs.map((s, idx) => (
                      <li key={`away-sub-${idx}`} style={{ marginBottom: 6 }}>
                        <Typography sx={{ fontSize: themeTypo.fontSize.bodySmall, lineHeight: themeTypo.lineHeight.relaxed, color: colors.textPrimary }}>
                          {s.minute != null ? `${s.minute}' ` : ''}{s.label || (s.playerOut && s.playerIn ? `${s.playerOut} → ${s.playerIn}` : s.playerIn || s.playerOut || '—')}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                  {awaySubs.length === 0 && (
                    <Typography sx={{ fontSize: themeTypo.fontSize.bodySmall, color: colors.textHint, fontStyle: 'italic', lineHeight: themeTypo.lineHeight.normal }}>— No substitutions</Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Box component="ul" sx={{ m: 0, pl: 2.5, listStylePosition: 'outside' }}>
                {substitutionsList.map((s, idx) => (
                  <li key={`sub-${idx}`} style={{ marginBottom: 6 }}>
                    <Typography sx={{ fontSize: themeTypo.fontSize.bodySmall, lineHeight: themeTypo.lineHeight.relaxed, color: colors.textPrimary }}>
                      {s.minute != null ? `${s.minute}' ` : ''}{s.label || (s.playerOut && s.playerIn ? `${s.playerOut} → ${s.playerIn}` : s.playerIn || s.playerOut || '—')}
                    </Typography>
                  </li>
                ))}
              </Box>
            )}
            {otherSubs.length > 0 && hasSplitSubs && (
              <Box sx={{ mt: 2.5, pt: 2.5, borderTop: 1, borderColor: colors.divider }}>
                <Typography sx={{ display: 'block', mb: 1, fontSize: themeTypo.fontSize.caption, fontWeight: themeTypo.fontWeight.semibold, color: colors.textSecondary }}>Other</Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5, listStylePosition: 'outside' }}>
                  {otherSubs.map((s, idx) => (
                    <li key={`other-sub-${idx}`} style={{ marginBottom: 6 }}>
                      <Typography sx={{ fontSize: themeTypo.fontSize.bodySmall, lineHeight: themeTypo.lineHeight.relaxed, color: colors.textPrimary }}>
                        {s.minute != null ? `${s.minute}' ` : ''}{s.label || (s.playerOut && s.playerIn ? `${s.playerOut} → ${s.playerIn}` : s.playerIn || s.playerOut || '—')}
                      </Typography>
                    </li>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Match stats — professional, readable layout */}
        {matchStatRows.length > 0 && (
          <Box sx={{ mt: 3.5 }}>
            <Divider sx={{ mb: 2.5, borderColor: colors.divider }} />
            <Typography
              sx={{
                fontSize: themeTypo.fontSize.h6,
                fontWeight: themeTypo.fontWeight.bold,
                color: colors.textPrimary,
                mb: 2,
                letterSpacing: themeTypo.letterSpacing.normal,
                lineHeight: themeTypo.lineHeight.tight,
              }}
            >
              Match stats
            </Typography>
            <Box
              sx={{
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: `1px solid ${colors.divider}`,
                overflow: 'hidden',
              }}
            >
              {matchStatRows.map((row, idx) => {
                const homeStr = `${row.homeVal}${row.suffix}`;
                const awayStr = `${row.awayVal}${row.suffix}`;
                const total = row.homeVal + row.awayVal;
                const homeRatio = total > 0 ? row.homeVal / total : 0.5;
                const homeHigher = row.homeVal > row.awayVal;
                const awayHigher = row.awayVal > row.homeVal;
                return (
                  <Box
                    key={row.label}
                    sx={{
                      px: 2,
                      pt: 1.5,
                      pb: 1.25,
                      borderBottom: idx < matchStatRows.length - 1 ? `1px solid ${colors.divider}` : 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 0.75 }}>
                      <Typography
                        component="span"
                        sx={{
                          width: 64,
                          textAlign: 'right',
                          fontSize: themeTypo.fontSize.body,
                          fontWeight: homeHigher ? themeTypo.fontWeight.bold : themeTypo.fontWeight.medium,
                          color: colors.textPrimary,
                          lineHeight: 1.4,
                        }}
                      >
                        {homeStr}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: themeTypo.fontSize.bodySmall,
                          fontWeight: themeTypo.fontWeight.semibold,
                          color: colors.textSecondary,
                          textTransform: 'capitalize',
                          lineHeight: 1.4,
                          flexShrink: 0,
                        }}
                      >
                        {row.label}
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          width: 64,
                          textAlign: 'left',
                          fontSize: themeTypo.fontSize.body,
                          fontWeight: awayHigher ? themeTypo.fontWeight.bold : themeTypo.fontWeight.medium,
                          color: colors.textPrimary,
                          lineHeight: 1.4,
                        }}
                      >
                        {awayStr}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', height: 6, borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.200' }}>
                      <Box sx={{ width: `${Math.max(0.05, Math.min(0.95, homeRatio)) * 100}%`, bgcolor: colors.brandRed, borderRadius: '3px 0 0 3px' }} />
                      <Box sx={{ flex: 1, bgcolor: 'grey.300', borderRadius: '0 3px 3px 0' }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
            </Box>
        )}
      </Paper>
    </Box>
  );
}
