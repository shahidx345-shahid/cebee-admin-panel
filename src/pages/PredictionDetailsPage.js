import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  SportsSoccer,
  AccessTime,
  CheckCircle,
  Cancel,
  Shield,
  Diamond,
  ExpandMore,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import { format } from 'date-fns';
import { getPredictionById } from '../services/predictionsService';

const statMini = (label, value, sub) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      variant="body2"
      sx={{ color: colors.textSecondary, fontWeight: 700, fontSize: 12, display: 'block', mb: 0.35, lineHeight: 1.3 }}
    >
      {label}
    </Typography>
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1,
        py: 0.5,
        borderRadius: '8px',
        backgroundColor: '#FFE5E5',
        color: colors.brandRed,
        fontWeight: 700,
        fontSize: 14,
        maxWidth: '100%',
      }}
      component="span"
    >
      <Typography component="span" variant="body2" sx={{ fontWeight: 800, fontSize: 14, color: colors.brandRed, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
    {sub != null && sub !== '' && (
      <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 500, fontSize: 12, display: 'block', mt: 0.35, lineHeight: 1.35 }}>
        {sub}
      </Typography>
    )}
  </Box>
);

/** Sort key for timeline / scorer minutes e.g. "30", "90+2" */
function minuteSortKey(ev) {
  const raw = String(ev.minute ?? '0');
  const parts = raw.split('+');
  const main = parseInt(parts[0], 10);
  const extra = parts[1] != null ? parseInt(parts[1], 10) : 0;
  const M = Number.isNaN(main) ? 9999 : main;
  const E = Number.isNaN(extra) ? 0 : extra;
  return M * 100 + E;
}

function isScoreTimelineEvent(ev) {
  const t = String(ev.type || '').toLowerCase();
  if (t === 'kickoff' || t === 'fulltime') return false;
  if (t === 'goal') return true;
  if (t === 'card') {
    const e = String(ev.event || '').toLowerCase();
    return e.includes('red');
  }
  return false;
}

/**
 * Goals + red cards only, earliest → latest. Prefers timeline rows with `side`;
 * otherwise builds goals from homeGoalScorers / awayGoalScorers and merges red cards from timeline.
 */
function buildChronologicalScoreEvents(groupData) {
  const tl = Array.isArray(groupData.timeline) ? groupData.timeline : [];
  const fromTimeline = tl.filter(isScoreTimelineEvent);
  const reds = fromTimeline.filter((e) => String(e.type).toLowerCase() === 'card');
  const goalsTl = fromTimeline.filter((e) => String(e.type).toLowerCase() === 'goal');
  const hasSide = (e) => e.side === 'home' || e.side === 'away';

  let sorted;
  if (goalsTl.length > 0 && goalsTl.every(hasSide)) {
    sorted = [...fromTimeline.filter(isScoreTimelineEvent)].sort((a, b) => minuteSortKey(a) - minuteSortKey(b));
  } else {
    const merged = [];
    const homeG = Array.isArray(groupData.homeGoalScorers) ? groupData.homeGoalScorers : [];
    const awayG = Array.isArray(groupData.awayGoalScorers) ? groupData.awayGoalScorers : [];
    for (const e of homeG) {
      const m = e.minute != null ? String(e.minute) : '';
      const ex = e.extra != null && Number(e.extra) > 0 ? `+${e.extra}` : '';
      merged.push({
        minute: `${m}${ex}`,
        event: 'Goal',
        detail: e.name || 'Unknown',
        type: 'goal',
        side: 'home',
        assist: e.assist || undefined,
      });
    }
    for (const e of awayG) {
      const m = e.minute != null ? String(e.minute) : '';
      const ex = e.extra != null && Number(e.extra) > 0 ? `+${e.extra}` : '';
      merged.push({
        minute: `${m}${ex}`,
        event: 'Goal',
        detail: e.name || 'Unknown',
        type: 'goal',
        side: 'away',
        assist: e.assist || undefined,
      });
    }
    merged.push(...reds);

    if (merged.length === 0 && goalsTl.length > 0) {
      sorted = [...goalsTl].sort((a, b) => minuteSortKey(a) - minuteSortKey(b));
    } else {
      sorted = merged.sort((a, b) => minuteSortKey(a) - minuteSortKey(b));
    }
  }

  return sorted.map((ev) => ({
    ...ev,
    side: resolveScoreEventSide(ev, groupData) || ev.side || null,
  }));
}

function normalizeDetailPlayer(detail) {
  if (detail == null) return '';
  return String(detail)
    .replace(/\s*\(P\)\s*$/i, '')
    .replace(/\s*\(OG\)\s*$/i, '')
    .trim();
}

function scorerEntriesMatchDetail(entries, detail) {
  const d = normalizeDetailPlayer(detail).toLowerCase();
  if (!d) return false;
  return entries.some((e) => {
    const n = String(e.name || '').trim().toLowerCase();
    if (!n) return false;
    return d === n || d.includes(n) || n.includes(d);
  });
}

/** Fill missing `side` using home/away scorer lists or scoreline (legacy timeline rows). */
function resolveScoreEventSide(ev, groupData) {
  if (ev.side === 'home' || ev.side === 'away') return ev.side;
  const h = Array.isArray(groupData.homeGoalScorers) ? groupData.homeGoalScorers : [];
  const a = Array.isArray(groupData.awayGoalScorers) ? groupData.awayGoalScorers : [];
  const t = String(ev.type || '').toLowerCase();
  const detail = ev.detail;

  if (t === 'goal') {
    const hm = scorerEntriesMatchDetail(h, detail);
    const am = scorerEntriesMatchDetail(a, detail);
    if (hm && !am) return 'home';
    if (am && !hm) return 'away';
    const hs = groupData.homeScore != null ? Number(groupData.homeScore) : null;
    const ascr = groupData.awayScore != null ? Number(groupData.awayScore) : null;
    if (hs != null && ascr != null && ascr > hs) return 'away';
    if (hs != null && ascr != null && hs > ascr) return 'home';
  }

  return null;
}

function resultStatusChipConfig(apiShort, matchStatus) {
  const sh = apiShort ? String(apiShort).toUpperCase().trim() : '';
  const green = { bgcolor: '#E8F5E9', color: '#2E7D32', border: '1px solid #C8E6C9', fontWeight: 800 };
  const amber = { bgcolor: '#FFF8E1', color: '#F57F17', border: '1px solid #FFE082', fontWeight: 800 };
  const red = { bgcolor: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2', fontWeight: 800 };
  const grey = { bgcolor: '#F5F5F5', color: '#616161', border: '1px solid #E0E0E0', fontWeight: 800 };
  const liveSx = { bgcolor: `${colors.brandRed}14`, color: colors.brandRed, border: `1px solid ${colors.brandRed}40`, fontWeight: 800 };

  if (sh === 'PST') return { label: 'PST', subtitle: 'Postponed', sx: amber };
  if (sh === 'CANC') return { label: 'CANC', subtitle: 'Cancelled', sx: red };
  if (sh === 'ABD' || sh === 'ABN' || sh === 'AWD') return { label: 'ABD', subtitle: 'Abandoned', sx: red };

  const m = String(matchStatus || '').toLowerCase();
  if (m === 'completed' || sh === 'FT' || sh === 'AET' || sh === 'PEN') return { label: 'FT', subtitle: 'Full Time', sx: green };
  if (m === 'halftime') return { label: 'HT', subtitle: 'Half time', sx: liveSx };
  if (m === 'live') return { label: 'Live', subtitle: 'In progress', sx: liveSx };
  return { label: 'NS', subtitle: 'Not started', sx: grey };
}

const statTopUserMatch = (ms) => {
  const sp = ms?.topUserHighestSP ?? 0;
  const sub = 'Highest total SP earned by one user on this match';
  if (sp <= 0) return statMini('Top user', '—', sub);
  const handle =
    ms?.topUserUsername && String(ms.topUserUsername).trim() && ms.topUserUsername !== '—'
      ? String(ms.topUserUsername).trim()
      : null;
  const name =
    ms?.topUserFullName && String(ms.topUserFullName).trim() && ms.topUserFullName !== '—'
      ? String(ms.topUserFullName).trim()
      : null;
  const who = handle || name || 'User';
  return statMini('Top user', `${who} — ${sp} SP`, sub);
};

const PredictionDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [breakdownLines, setBreakdownLines] = useState([]);
  const [totalSPMatch, setTotalSPMatch] = useState(0);
  const [matchStats, setMatchStats] = useState(null);
  const [liveTick, setLiveTick] = useState(0);
  const [countdownTick, setCountdownTick] = useState(0);
  const [matchSummaryExpanded, setMatchSummaryExpanded] = useState(false);

  useEffect(() => {
    if (!groupData) return;
    const s = String(groupData.matchStatus || 'scheduled').toLowerCase();
    const isLiveOrHT = s === 'live' || s === 'halftime';
    if (!isLiveOrHT || !groupData.kickoffTime) return;
    const id = setInterval(() => setLiveTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [groupData?.matchStatus, groupData?.kickoffTime]);

  useEffect(() => {
    if (!groupData?.kickoffTime) return;
    const kickoff = new Date(groupData.kickoffTime).getTime();
    if (Date.now() >= kickoff) return;
    const s = String(groupData.matchStatus || 'scheduled').toLowerCase();
    if (s === 'live' || s === 'halftime') return;
    const id = setInterval(() => setCountdownTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [groupData?.kickoffTime, groupData?.matchStatus]);

  useEffect(() => {
    const loadPredictionDetails = async () => {
      try {
        setLoading(true);
        
        const decodedId = decodeURIComponent(id);
        
        if (!decodedId) {
          console.error('Invalid prediction ID');
          setLoading(false);
          return;
        }

        // Fetch prediction details from API using /api/predictions/admin/{id}
        const result = await getPredictionById(decodedId);

        if (result.success && result.data) {
          const apiData = result.data;
          const prediction = apiData.prediction || {};
          const fixture = apiData.fixture || {};
          const user = apiData.user || {};
          const matchSummary = apiData.matchSummary || {};
          const lines = Array.isArray(apiData.predictionBreakdown) ? apiData.predictionBreakdown : [];
          setBreakdownLines(lines);
          const apiTotal = apiData.totalSPMatch;
          setTotalSPMatch(
            typeof apiTotal === 'number'
              ? apiTotal
              : lines.reduce((s, row) => s + (Number(row.lineSP) || 0), 0),
          );
          setMatchStats(apiData.matchSummary || null);
          
          // Get actual result from fixture
          let actualResult = null;
          if (fixture.homeScore !== null && fixture.homeScore !== undefined && 
              fixture.awayScore !== null && fixture.awayScore !== undefined) {
            actualResult = `${fixture.homeScore}-${fixture.awayScore}`;
          }
          
          // Format prediction data for display
          const formattedPrediction = {
            id: prediction._id || decodedId,
            predictionId: prediction.predictionId || prediction._id,
            predictionType: prediction.predictionType || 'match_result',
            prediction: prediction.predictionValue || `${prediction.homeGoals || 0}-${prediction.awayGoals || 0}`,
            predictedHomeScore: prediction.homeGoals || null,
            predictedAwayScore: prediction.awayGoals || null,
            firstGoalScorer: prediction.firstPlayer || '',
            firstGoalMinute: prediction.firstGoalMinutes || null,
            goalRange: prediction.goalRange || '',
            predictionTime: prediction.predictedAt ? new Date(prediction.predictedAt) : new Date(),
            status: prediction.status || 'ongoing',
            predictionStatus: prediction.status || 'ongoing',
            actualResult: actualResult,
            matchStatus: fixture.status || 'ongoing',
            spStatus: prediction.spStatus === 'AWARDED' ? 'awarded' : 
                      prediction.spStatus === 'NOT AWARDED' ? 'not_awarded' : 'pending',
            spAwarded: prediction.spAwarded || 0,
            points: prediction.spAwarded || 0,
            isCorrect: prediction.status === 'correct',
            correctness: prediction.correctnessStatus === 'CORRECT' ? 'won' : 
                        prediction.correctnessStatus === 'INCORRECT' ? 'lost' : 'pending',
            scorelineCorrect: prediction.scorelineCorrect || false,
            firstPlayerCorrect: prediction.firstPlayerCorrect || false,
            goalRangeCorrect: prediction.goalRangeCorrect || false,
            firstGoalMinutesCorrect: prediction.firstGoalMinutesCorrect || false,
            evaluatedAt: prediction.evaluatedAt ? new Date(prediction.evaluatedAt) : null,
          };
          
          const kickoffTime = fixture.kickoffTime ? (() => {
            const d = new Date(fixture.kickoffTime);
            return isNaN(d.getTime()) ? null : d;
          })() : null;
          setGroupData({
            userId: user._id || '',
            username: user.username || user.fullName || 'Unknown User',
            userEmail: user.email || '',
            userCountry: user.country || '',
            userTotalPredictions: (matchSummary.userSubmittedSlots ?? matchSummary.totalPredictions) || 0,
            userAccuracy:
              matchSummary.userMatchAccuracy != null
                ? String(matchSummary.userMatchAccuracy)
                : matchSummary.correctPredictions && matchSummary.totalPredictions
                  ? ((matchSummary.correctPredictions / matchSummary.totalPredictions) * 100).toFixed(1)
                  : 0,
            userMatchStatusLabel: matchSummary.userMatchStatus || null,
            matchId: fixture.matchId || fixture._id || '',
            matchName: fixture.matchName || `${fixture.homeTeam || 'TBD'} vs ${fixture.awayTeam || 'TBD'}`,
            homeTeam: fixture.homeTeam || 'TBD',
            awayTeam: fixture.awayTeam || 'TBD',
            fixtureId: fixture._id || '',
            matchStatus: fixture.matchStatus || fixture.status || 'ongoing',
            apiStatusShort: fixture.apiStatusShort || null,
            actualResult: actualResult,
            timeline: Array.isArray(fixture.timeline) ? fixture.timeline : [],
            totalPredictions: matchSummary.totalPredictions || 0,
            totalSPWon: matchSummary.totalSPWon || 0,
            isCommunityFeatured: fixture.isCommunityFeatured || false,
            hot: fixture.isFeatured || fixture.isCeBeFeatured || fixture.isCommunityFeatured || false,
            league: fixture.league || (fixture.cmdId?.name) || '',
            matchday: fixture.matchday || '',
            round: fixture.round != null && String(fixture.round).trim() ? fixture.round : '',
            cmdName: fixture.cmdId?.name || '',
            kickoffTime,
            venue: fixture.venue || '',
            homeTeamLogo: fixture.homeTeamLogo || fixture.home_team_logo || null,
            awayTeamLogo: fixture.awayTeamLogo || fixture.away_team_logo || null,
            homeTeamId: fixture.homeTeamId?._id ?? fixture.homeTeamId ?? null,
            awayTeamId: fixture.awayTeamId?._id ?? fixture.awayTeamId ?? null,
            homeScore: fixture.homeScore != null ? fixture.homeScore : null,
            awayScore: fixture.awayScore != null ? fixture.awayScore : null,
            homeGoalScorers: Array.isArray(fixture.homeGoalScorers) ? fixture.homeGoalScorers : null,
            awayGoalScorers: Array.isArray(fixture.awayGoalScorers) ? fixture.awayGoalScorers : null,
          });
          
          // Set as single prediction array for display
          setPredictions([formattedPrediction]);
        } else {
          // API call failed - show error state
          console.error('Failed to load prediction details from API:', result.error);
          setGroupData(null);
          setPredictions([]);
          setBreakdownLines([]);
          setTotalSPMatch(0);
          setMatchStats(null);
        }
      } catch (error) {
        console.error('Error loading prediction details:', error);
        setGroupData(null);
        setPredictions([]);
        setBreakdownLines([]);
        setTotalSPMatch(0);
        setMatchStats(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPredictionDetails();
    }
  }, [id]);

  useEffect(() => {
    if (!id || !groupData) return;
    const ms = String(groupData.matchStatus || '').toLowerCase();
    if (ms !== 'live' && ms !== 'halftime') return;
    const tick = setInterval(async () => {
      try {
        const decodedId = decodeURIComponent(id);
        const result = await getPredictionById(decodedId);
        if (!result.success || !result.data) return;
        const fixture = result.data.fixture || {};
        setGroupData((prev) => {
          if (!prev) return prev;
          let ar = prev.actualResult;
          if (fixture.homeScore != null && fixture.awayScore != null) {
            ar = `${fixture.homeScore}-${fixture.awayScore}`;
          }
          return {
            ...prev,
            matchStatus: fixture.matchStatus || fixture.status || prev.matchStatus,
            apiStatusShort: fixture.apiStatusShort != null ? fixture.apiStatusShort : prev.apiStatusShort,
            homeScore: fixture.homeScore != null ? fixture.homeScore : prev.homeScore,
            awayScore: fixture.awayScore != null ? fixture.awayScore : prev.awayScore,
            actualResult: ar,
            timeline: Array.isArray(fixture.timeline) ? fixture.timeline : prev.timeline,
            homeGoalScorers: Array.isArray(fixture.homeGoalScorers)
              ? fixture.homeGoalScorers
              : fixture.homeGoalScorers === null
                ? null
                : prev.homeGoalScorers,
            awayGoalScorers: Array.isArray(fixture.awayGoalScorers)
              ? fixture.awayGoalScorers
              : fixture.awayGoalScorers === null
                ? null
                : prev.awayGoalScorers,
          };
        });
      } catch (_) {
        /* ignore */
      }
    }, 15000);
    return () => clearInterval(tick);
  }, [id, groupData?.matchStatus]);

  const getTypeChip = (type) => {
    const typeMap = {
      'correct_score': { label: 'Correct Score', color: colors.brandRed },
      'goal_range': { label: 'Goal Range', color: colors.warning },
      'match_result': { label: 'Match Result', color: colors.info },
      'both_teams_score': { label: 'Both Teams Score', color: colors.success },
    };

    const config = typeMap[type] || typeMap['correct_score'];

    return (
      <Chip
        icon={<Diamond sx={{ fontSize: 14 }} />}
        label={config.label}
        sx={{
          backgroundColor: `${config.color}20`,
          color: config.color,
          border: `1.5px solid ${config.color}40`,
          fontWeight: 700,
          fontSize: 12,
          height: 28,
        }}
      />
    );
  };

  const goBack = () => {
    const fid = location.state?.fromFixtureId;
    if (fid) {
      navigate(`/predictions/match/${encodeURIComponent(fid)}/users`);
      return;
    }
    navigate(constants.routes.predictions);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: colors.brandRed }} />
      </Box>
    );
  }

  if (!groupData || predictions.length === 0) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={goBack}
          sx={{
            mb: 3,
            color: colors.brandRed,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Back
        </Button>
        <Typography variant="h6" sx={{ color: colors.textSecondary }}>
          Prediction not found
        </Typography>
      </Box>
    );
  }

  const totalSP = matchStats?.totalSPWon ?? predictions.reduce((sum, pred) => sum + (pred.spAwarded || 0), 0);
  const ms = matchStats || {};
  const avgPredPerUser =
    ms.uniqueUsers > 0 && ms.totalPredictions != null
      ? Math.round((ms.totalPredictions / ms.uniqueUsers) * 100) / 100
      : 0;

  const DetailRow = ({ label, value, valueHighlight }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
      <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: valueHighlight ? colors.brandRed : colors.brandBlack, textAlign: 'right' }}>{value}</Typography>
    </Box>
  );

  // Show actual status (same as Fixture Details)
  const matchStatusDisplay = (() => {
    const s = String(groupData.matchStatus || 'scheduled').toLowerCase();
    if (s === 'halftime') return 'HT';
    if (s === 'live') return 'Live';
    if (s === 'completed') return 'Full Time';
    if (s === 'resultpending' || s === 'result_pending') return 'Result Pending';
    if (s === 'resultsprocessing' || s === 'results_processing') return 'Results Processing';
    if (s === 'pending') return 'Pending';
    if (s === 'scheduled') return 'Scheduled';
    if (s === 'published' || s === 'predictionopen' || s === 'predictionlock') return 'Not Started';
    return 'Not Started';
  })();
  const isLiveOrHT = matchStatusDisplay === 'Live' || matchStatusDisplay === 'HT';
  const liveElapsedMins = isLiveOrHT && groupData.kickoffTime
    ? Math.max(0, Math.floor((Date.now() - new Date(groupData.kickoffTime).getTime()) / 60000))
    : null;
  const countdownToKickoffMs = groupData.kickoffTime && !isLiveOrHT
    ? new Date(groupData.kickoffTime).getTime() - Date.now()
    : null;
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
  const venueDisplay = groupData.venue && String(groupData.venue).trim() ? groupData.venue : 'Stadium TBD';
  const roundLabel = (groupData.round && String(groupData.round).trim()) || (groupData.matchday ? `Matchday ${groupData.matchday}` : null) || (groupData.cmdName && String(groupData.cmdName).trim()) || null;
  const leagueDisplay = (() => {
    const raw = groupData.league || 'League';
    const s = String(raw).replace(/\s*\(API\s+\d+\)\s*/gi, '').trim();
    return s || raw;
  })();

  const kickoffFormatted =
    groupData.kickoffTime && !Number.isNaN(new Date(groupData.kickoffTime).getTime())
      ? format(new Date(groupData.kickoffTime), 'EEE, d MMM yyyy • HH:mm')
      : null;
  const MATCH_LOGO = 52;
  const homeScoreNum =
    groupData.homeScore != null && groupData.homeScore !== ''
      ? groupData.homeScore
      : groupData.actualResult && /^\d+-\d+$/.test(String(groupData.actualResult).replace(/\s/g, ''))
        ? String(groupData.actualResult).replace(/\s/g, '').split('-')[0]
        : null;
  const awayScoreNum =
    groupData.awayScore != null && groupData.awayScore !== ''
      ? groupData.awayScore
      : groupData.actualResult && /^\d+-\d+$/.test(String(groupData.actualResult).replace(/\s/g, ''))
        ? String(groupData.actualResult).replace(/\s/g, '').split('-')[1]
        : null;

  const chronologicalScoreEvents = buildChronologicalScoreEvents(groupData);
  const resultStatus = resultStatusChipConfig(groupData.apiStatusShort, groupData.matchStatus);
  const isCompletedMatch = String(groupData.matchStatus || '').toLowerCase() === 'completed';
  const showScoreDetailSection =
    chronologicalScoreEvents.length > 0 || isLiveOrHT || isCompletedMatch;
  const liveScoreHeading = isLiveOrHT
    ? 'LIVE SCORE · Updates every 15s'
    : isCompletedMatch || resultStatus.label === 'FT'
      ? 'MATCH SCORE · Final'
      : 'SCORE EVENTS';

  /** Logo + name + Home/Away stacked and centered as a column (column sits left or right of score via parent flex). */
  const MatchTeamStack = ({ teamId, name, logoUrl, side }) => {
    const inner = (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          minWidth: 0,
          maxWidth: { xs: 140, sm: 180 },
          cursor: teamId ? 'pointer' : 'default',
          borderRadius: 2,
          py: 0.5,
          px: 0.5,
          '&:hover': teamId ? { bgcolor: 'rgba(0,0,0,0.04)' } : {},
        }}
      >
        <Box
          sx={{
            width: MATCH_LOGO,
            height: MATCH_LOGO,
            borderRadius: '50%',
            bgcolor: '#fff',
            border: '1px solid #E8E8E8',
            boxSizing: 'border-box',
            marginBottom: '8px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {logoUrl ? (
            <Box component="img" src={logoUrl} alt="" sx={{ width: MATCH_LOGO - 14, height: MATCH_LOGO - 14, objectFit: 'contain', display: 'block' }} />
          ) : (
            <SportsSoccer sx={{ fontSize: 26, color: colors.brandBlack }} />
          )}
        </Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: colors.brandBlack, lineHeight: 1.25, width: '100%', textAlign: 'center' }}
          title={name || 'TBD'}
        >
          {name || 'TBD'}
        </Typography>
        <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: 10, letterSpacing: '0.04em' }}>
          {side}
        </Typography>
      </Box>
    );
    if (teamId) {
      return (
        <Link to={`${constants.routes.apiSync}/team/${teamId}`} style={{ textDecoration: 'none', color: 'inherit' }} title="View squad (API Data & Sync)">
          {inner}
        </Link>
      );
    }
    return inner;
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 900, pb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={goBack}
        sx={{ mb: 2, color: colors.brandRed, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: `${colors.brandRed}0A` } }}
      >
        {location.state?.fromFixtureId ? 'Back to match users' : 'Back to predictions'}
      </Button>

      {/* 1. Match card — reference-style: league (accent) + round, status right; logo–score row; venue; events */}
      <Card sx={{ mb: 3, borderRadius: '16px', border: `1px solid ${colors.divider}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden', bgcolor: '#fff' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
            <Box sx={{ pl: 2, borderLeft: `4px solid ${colors.brandRed}`, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.8125rem', letterSpacing: '0.08em', color: colors.brandBlack }}>
                {leagueDisplay.toUpperCase()}
              </Typography>
              {roundLabel ? (
                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mt: 0.35 }}>
                  {roundLabel}
                </Typography>
              ) : null}
              {kickoffFormatted ? (
                <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <AccessTime sx={{ fontSize: 18, color: colors.brandRed }} />
                  {kickoffFormatted}
                </Typography>
              ) : null}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
              <Chip label={resultStatus.label} size="small" title={resultStatus.subtitle} sx={{ fontSize: 13, height: 30, ...resultStatus.sx }} />
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, textAlign: 'right' }}>
                {resultStatus.subtitle}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                {groupData.totalPredictions || predictions.length} predictions
              </Typography>
            </Box>
          </Box>

          {countdownToKickoffStr && (
            <Typography variant="caption" sx={{ color: colors.brandRed, fontWeight: 600, display: 'block', mb: 1 }}>
              {countdownToKickoffStr}
            </Typography>
          )}
          {liveElapsedMins != null && (
            <Typography variant="body2" sx={{ textAlign: 'center', color: colors.brandRed, fontWeight: 700, mb: 1 }}>
              {liveElapsedMins}&apos;
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: { xs: 0.5, sm: 1 },
              py: { xs: 1.5, sm: 2 },
              width: '100%',
              flexWrap: 'nowrap',
            }}
          >
            <Box
              sx={{
                flex: '1 1 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                minWidth: 0,
              }}
            >
              <MatchTeamStack
                teamId={groupData.homeTeamId}
                name={groupData.homeTeam}
                logoUrl={groupData.homeTeamLogo}
                side="Home"
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                gap: { xs: 0.5, sm: 0.75 },
                px: { xs: 0.25, sm: 0.5 },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.5rem' },
                  fontWeight: 800,
                  color: colors.brandBlack,
                  lineHeight: 1,
                }}
              >
                {homeScoreNum != null ? homeScoreNum : '—'}
              </Typography>
              <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 600, color: colors.textSecondary }}>
                –
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.5rem' },
                  fontWeight: 800,
                  color: colors.brandBlack,
                  lineHeight: 1,
                }}
              >
                {awayScoreNum != null ? awayScoreNum : '—'}
              </Typography>
            </Box>
            <Box
              sx={{
                flex: '1 1 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                minWidth: 0,
              }}
            >
              <MatchTeamStack
                teamId={groupData.awayTeamId}
                name={groupData.awayTeam}
                logoUrl={groupData.awayTeamLogo}
                side="Away"
              />
            </Box>
          </Box>

          <Typography
            variant="body2"
            sx={{ color: colors.textSecondary, textAlign: 'center', fontWeight: 500, mb: showScoreDetailSection ? 2 : 0 }}
          >
            {venueDisplay}
          </Typography>

          {showScoreDetailSection && (
            <Box sx={{ pt: 2, borderTop: `1px solid ${colors.divider}` }}>
              <Typography
                variant="caption"
                sx={{
                  color: colors.textSecondary,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  display: 'block',
                  mb: 2,
                }}
              >
                {liveScoreHeading}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'minmax(0,1fr) auto minmax(0,1fr)' },
                  columnGap: { xs: 2, sm: 3 },
                  rowGap: { xs: 1.5, sm: 0 },
                  alignItems: 'center',
                  width: '100%',
                  mb: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 800, color: colors.brandBlack, textAlign: 'left' }}>
                  {groupData.homeTeam}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <SportsSoccer
                    sx={{
                      fontSize: 28,
                      color: '#9E9E9E',
                      opacity: chronologicalScoreEvents.length > 0 ? 1 : 0.45,
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: colors.brandBlack, textAlign: 'right' }}>
                  {groupData.awayTeam}
                </Typography>
              </Box>
              {chronologicalScoreEvents.length === 0 ? (
                <Typography variant="body2" sx={{ color: colors.textSecondary, textAlign: 'center', py: 1 }}>
                  {isCompletedMatch ? 'No goal or red card events in match data.' : '—'}
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {chronologicalScoreEvents.map((ev, i) => {
                    const min = ev.minute != null && String(ev.minute) !== '' ? `${ev.minute}'` : '';
                    const isGoal = String(ev.type || '').toLowerCase() === 'goal';
                    const kind = isGoal ? 'Goal' : 'Red Card';
                    const player = ev.detail || '—';
                    const assistPart = ev.assist ? ` · Assist: ${ev.assist}` : '';
                    const side = ev.side;
                    const body = (
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: isGoal ? colors.brandBlack : '#C62828',
                          lineHeight: 1.5,
                        }}
                      >
                        {min} {kind} — {player}
                        {assistPart}
                      </Typography>
                    );
                    return (
                      <Box
                        key={`ev-${i}-${min}-${kind}`}
                        sx={{
                          py: 0.85,
                          borderBottom: `1px solid ${colors.divider}`,
                          minHeight: 36,
                        }}
                      >
                        {side === 'home' && <Box sx={{ textAlign: 'left' }}>{body}</Box>}
                        {side === 'away' && <Box sx={{ textAlign: 'right' }}>{body}</Box>}
                        {(side !== 'home' && side !== 'away') && (
                          <Box sx={{ textAlign: 'center' }}>{body}</Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Match-wide analytics — collapsible; same stat pills when expanded */}
      <Card
        sx={{
          mb: 3,
          borderRadius: '16px',
          border: `1.5px solid ${colors.divider}26`,
          boxShadow: `0 4px 12px ${colors.shadow}14`,
          overflow: 'hidden',
        }}
      >
        <Box
          onClick={() => setMatchSummaryExpanded((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setMatchSummaryExpanded((o) => !o);
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={matchSummaryExpanded}
          aria-controls="prediction-match-summary-panel"
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: matchSummaryExpanded ? `1px solid ${colors.divider}` : 'none',
            background: `linear-gradient(135deg, ${colors.brandRed}08 0%, transparent 100%)`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
            '&:hover': { backgroundColor: `${colors.brandRed}0A` },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: colors.brandBlack }}>
              Match summary
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
              All predictors on this fixture — same metric style as predictions overview
            </Typography>
            {(leagueDisplay || roundLabel) && (
              <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5, fontWeight: 600 }}>
                {leagueDisplay}
                {roundLabel ? ` · ${roundLabel}` : ''}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mt: 0.75 }}>
              {matchSummaryExpanded ? 'Click to collapse' : 'Click to expand match-wide stats'}
            </Typography>
          </Box>
          <IconButton
            size="small"
            aria-label={matchSummaryExpanded ? 'Collapse match summary' : 'Expand match summary'}
            onClick={(e) => {
              e.stopPropagation();
              setMatchSummaryExpanded((o) => !o);
            }}
            sx={{
              color: colors.brandBlack,
              transform: matchSummaryExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <ExpandMore />
          </IconButton>
        </Box>
        <Collapse in={matchSummaryExpanded} id="prediction-match-summary-panel">
          <CardContent sx={{ pt: 2.5, pb: 2, px: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: 'grid',
                width: '100%',
                gap: { xs: 2, sm: 2.5 },
                rowGap: { xs: 2.25, sm: 2.5 },
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  sm: 'repeat(3, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                  lg: 'repeat(6, minmax(0, 1fr))',
                },
                alignItems: 'start',
              }}
            >
              {statMini('Unique users', ms.uniqueUsers ?? '—', 'predictors on this match')}
              {statMini(
                'Participation rate',
                ms.participationRate != null ? `${ms.participationRate}%` : '—',
                ms.totalAppUsers != null ? `of ${ms.totalAppUsers} app users` : null,
              )}
              {statMini('Total predictions', ms.totalPredictions ?? '—', 'prediction rows on fixture')}
              {statMini(
                'Doc. correct %',
                ms.docAccuracyPct != null ? `${ms.docAccuracyPct}%` : '—',
                'correct / all rows',
              )}
              {statMini('Avg pred. / user', avgPredPerUser || 0, 'rows per predictor')}
              {statMini('Total SP won', ms.totalSPWon ?? totalSP, 'all users combined')}
              {statMini('Correct rows', ms.correctPredictions ?? '—', 'status correct')}
              {statMini('Incorrect rows', ms.incorrectPredictions ?? '—', 'status incorrect')}
              {statMini('Partial rows', ms.partialPredictions ?? '—', 'status partial')}
              {statMini('Avg SP / user', ms.avgSpPerPredictor ?? '—', 'mean over predictors')}
              {statTopUserMatch(ms)}
            </Box>
          </CardContent>
        </Collapse>
        <CardContent sx={{ pt: 2.5, pb: 3, px: { xs: 2, sm: 3 } }}>
          <Divider sx={{ mb: 2.5 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.brandRed, mb: 1.5 }}>
            This prediction (viewed user)
          </Typography>
          <Box
            sx={{
              display: 'grid',
              width: '100%',
              gap: { xs: 2, sm: 2.5 },
              rowGap: { xs: 2.25, sm: 2.5 },
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
              alignItems: 'start',
            }}
          >
            {statMini('Slots submitted', groupData.userTotalPredictions ?? '—', 'this user × match')}
            {statMini(
              'Accuracy %',
              groupData.userAccuracy != null && groupData.userAccuracy !== '' ? `${groupData.userAccuracy}%` : '—',
              'evaluated slots',
            )}
            {statMini('SP won', predictions[0]?.spAwarded ?? 0, 'this user on match')}
            {statMini(
              'Match status',
              groupData.userMatchStatusLabel || '—',
              'user × match rollup',
            )}
          </Box>
        </CardContent>
      </Card>

      {/* 2. User / Predictor – clean card with border, shadow, hierarchy */}
      <Card sx={{ mb: 3, borderRadius: '16px', border: `1px solid ${colors.divider}`, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <CardContent sx={{ p: 3.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 14px ${colors.brandRed}50`,
                border: `2px solid ${colors.brandWhite}`,
              }}
            >
              <Person sx={{ fontSize: 32, color: colors.brandWhite }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack }}>
                {groupData.username}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                {groupData.userEmail}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {groupData.userCountry && (
                  <Chip label={groupData.userCountry} size="small" sx={{ borderRadius: '10px', bgcolor: '#F0F4F8', color: '#475569', fontWeight: 600, border: '1px solid #E2E8F0' }} />
                )}
                <Chip label={`${groupData.userTotalPredictions} Total Predictions`} size="small" sx={{ borderRadius: '10px', bgcolor: `${colors.brandRed}12`, color: colors.brandRed, fontWeight: 600, border: `1px solid ${colors.brandRed}30` }} />
                <Chip label={`${groupData.userAccuracy}% Accuracy`} size="small" sx={{ borderRadius: '10px', bgcolor: `${colors.success}12`, color: colors.success, fontWeight: 600, border: `1px solid ${colors.success}30` }} />
                {groupData.userMatchStatusLabel && (
                  <Chip label={`Status: ${groupData.userMatchStatusLabel}`} size="small" sx={{ borderRadius: '10px', fontWeight: 700 }} />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 3. Prediction breakdown — per CS / GR / FPS / FGM when API provides lines */}
      <Box sx={{ pl: 2, borderLeft: `4px solid ${colors.brandRed}`, mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: colors.brandBlack }}>
          Prediction breakdown
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.25 }}>
          {breakdownLines.length > 0
            ? `${breakdownLines.length} line(s) — CS, GR, FPS, FGM`
            : `${predictions.length} record(s) for this match`}
        </Typography>
      </Box>

      {breakdownLines.length > 0
        ? breakdownLines.map((line, index) => {
            const fmt = (x) => {
              try {
                return x ? format(new Date(x), 'MMM dd, yyyy HH:mm') : '—';
              } catch {
                return '—';
              }
            };
            const slotSp = line.slotSp != null ? line.slotSp : 0;
            const corr = String(line.correctness || '').toLowerCase();
            const correctnessChip =
              corr === 'won' ? (
                <Chip
                  icon={<CheckCircle sx={{ fontSize: 14 }} />}
                  label="Won"
                  size="small"
                  sx={{ borderRadius: '8px', bgcolor: colors.success, color: colors.brandWhite, fontWeight: 700, height: 26 }}
                />
              ) : corr === 'lost' ? (
                <Chip
                  icon={<Cancel sx={{ fontSize: 14 }} />}
                  label="Lost"
                  size="small"
                  sx={{ borderRadius: '8px', bgcolor: colors.error, color: colors.brandWhite, fontWeight: 700, height: 26 }}
                />
              ) : corr === 'void' ? (
                <Chip
                  label="Void"
                  size="small"
                  sx={{ borderRadius: '8px', bgcolor: '#64748B', color: colors.brandWhite, fontWeight: 700, height: 26 }}
                />
              ) : (
                <Chip
                  label="Pending"
                  size="small"
                  sx={{ borderRadius: '8px', bgcolor: colors.warning, color: colors.brandWhite, fontWeight: 700, height: 26 }}
                />
              );
            const lineSp = Number(line.lineSP) || 0;
            return (
              <Card key={`${line.type}-${index}`} sx={{ mb: 2.5, borderRadius: '16px', border: `1px solid ${colors.divider}`, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${colors.divider}` }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: colors.brandBlack }}>
                      {line.label} ({line.type} · {slotSp} SP)
                    </Typography>
                    {line.adminSubtext ? (
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.75, lineHeight: 1.45, maxWidth: 720 }}>
                        {line.adminSubtext}
                      </Typography>
                    ) : null}
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                      <DetailRow label="Prediction ID" value={line.predictionId || predictions[0]?.id || '—'} />
                      <DetailRow label="User prediction" value={line.userPrediction ?? '—'} valueHighlight />
                      <DetailRow label="Actual result" value={line.actualResult ?? '—'} />
                      <DetailRow label="Prediction status" value={line.awarded ?? '—'} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                          Correctness
                        </Typography>
                        {correctnessChip}
                      </Box>
                      <DetailRow label="Prediction created" value={fmt(line.createdAt)} />
                      <DetailRow label="Last updated" value={fmt(line.updatedAt)} />
                    </Box>
                    <Box
                      sx={{
                        mt: 2,
                        px: 2,
                        py: 1.5,
                        borderRadius: '12px',
                        bgcolor: `${colors.brandRed}0C`,
                        border: `1px solid ${colors.brandRed}25`,
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 800, color: colors.brandRed, textAlign: 'right' }}>
                        SP: +{lineSp}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })
        : predictions.map((pred, index) => (
        <Card key={pred.id} sx={{ mb: 2.5, borderRadius: '16px', border: `1px solid ${colors.divider}`, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <CardContent sx={{ p: 0 }}>
            {/* Card header */}
            <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${colors.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack }}>
                  Prediction #{index + 1}
                </Typography>
                <Chip
                  label={`ID: ${pred.id || 'N/A'}`}
                  size="small"
                  sx={{ borderRadius: '8px', bgcolor: `${colors.brandRed}12`, color: colors.brandRed, fontWeight: 600, fontSize: 11, height: 26, border: `1px solid ${colors.brandRed}30` }}
                />
              </Box>
              {getTypeChip(pred.predictionType)}
            </Box>

            {/* Details in rounded panel (like fixture kickoff/venue panel) */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <DetailRow label="Match" value={pred.matchName || groupData.matchName} />
                <DetailRow label="Match ID" value={pred.fixtureId || pred.matchId || groupData.fixtureId || groupData.matchId} />
                <DetailRow label="Prediction ID" value={pred.id || 'N/A'} />
                <DetailRow label="Prediction Type" value={pred.predictionType.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} />
                <DetailRow label="Prediction" value={pred.prediction} valueHighlight />
                <DetailRow label="Prediction Time" value={format(pred.predictionTime, 'MMM dd, yyyy HH:mm')} />
                <DetailRow label="Actual Result" value={pred.actualResult || 'Pending'} />
                <Box sx={{ gridColumn: { xs: 1, sm: 2 }, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', pt: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600 }}>SP Status</Typography>
                    <Chip
                      label={pred.spStatus === 'awarded' ? 'AWARDED' : pred.spStatus === 'not_awarded' ? 'NOT AWARDED' : 'PENDING'}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        height: 26,
                        borderRadius: '8px',
                        ...(pred.spStatus === 'awarded' ? { bgcolor: `${colors.success}18`, color: colors.success, border: `1px solid ${colors.success}40` } : pred.spStatus === 'not_awarded' ? { bgcolor: `${colors.error}18`, color: colors.error, border: `1px solid ${colors.error}40` } : { bgcolor: '#F0F4F8', color: '#64748B', border: '1px solid #E2E8F0' }),
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600 }}>Correctness</Typography>
                    {pred.correctness === 'won' ? (
                      <Chip icon={<CheckCircle sx={{ fontSize: 14 }} />} label="WON" size="small" sx={{ borderRadius: '8px', bgcolor: colors.success, color: colors.brandWhite, fontWeight: 700, height: 26 }} />
                    ) : pred.correctness === 'lost' ? (
                      <Chip icon={<Cancel sx={{ fontSize: 14 }} />} label="LOST" size="small" sx={{ borderRadius: '8px', bgcolor: colors.error, color: colors.brandWhite, fontWeight: 700, height: 26 }} />
                    ) : (
                      <Chip label="PENDING" size="small" sx={{ borderRadius: '8px', bgcolor: colors.warning, color: colors.brandWhite, fontWeight: 700, height: 26 }} />
                    )}
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  px: 2,
                  py: 1.5,
                  borderRadius: '12px',
                  bgcolor: `${colors.brandRed}0C`,
                  border: `1px solid ${colors.brandRed}25`,
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 800, color: colors.brandRed, textAlign: 'right' }}>
                  SP: +{pred.spAwarded || 0}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {breakdownLines.length > 0 && (
        <Box
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: '14px',
            border: `1px solid ${colors.divider}`,
            bgcolor: '#F8FAFC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: colors.brandBlack }}>
            Total SP (Match)
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: colors.brandRed }}>
            +{totalSPMatch}
          </Typography>
        </Box>
      )}

      {/* Immutable Record Notice */}
      <Alert
        icon={<Shield sx={{ fontSize: 20 }} />}
        sx={{
          borderRadius: '12px',
          backgroundColor: `${colors.info}20`,
          border: `1.5px solid ${colors.info}40`,
          '& .MuiAlert-icon': {
            color: colors.info,
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, color: colors.info, fontSize: 14, mb: 0.5 }}>
          Immutable Record
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
          All predictions are permanent audit records and cannot be modified or deleted.
        </Typography>
      </Alert>
    </Box>
  );
};

export default PredictionDetailsPage;
