import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  SportsSoccer,
  AccessTime,
  CheckCircle,
  Cancel,
  Star,
  Shield,
  Diamond,
  EmojiEvents,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import { format } from 'date-fns';
import { getPredictionGroup, formatPredictions, getPredictionById } from '../services/predictionsService';

const PredictionDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [liveTick, setLiveTick] = useState(0);
  const [countdownTick, setCountdownTick] = useState(0);

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
            userTotalPredictions: matchSummary.totalPredictions || 0,
            userAccuracy: matchSummary.correctPredictions && matchSummary.totalPredictions
              ? ((matchSummary.correctPredictions / matchSummary.totalPredictions) * 100).toFixed(1)
              : 0,
            matchId: fixture.matchId || fixture._id || '',
            matchName: fixture.matchName || `${fixture.homeTeam || 'TBD'} vs ${fixture.awayTeam || 'TBD'}`,
            homeTeam: fixture.homeTeam || 'TBD',
            awayTeam: fixture.awayTeam || 'TBD',
            fixtureId: fixture._id || '',
            matchStatus: fixture.status || 'ongoing',
            actualResult: actualResult,
            totalPredictions: matchSummary.totalPredictions || 0,
            totalSPWon: matchSummary.totalSPWon || 0,
            isCommunityFeatured: fixture.isCommunityFeatured || false,
            hot: fixture.isFeatured || fixture.isCeBeFeatured || fixture.isCommunityFeatured || false,
            league: fixture.league || (fixture.cmdId?.name) || '',
            matchday: fixture.matchday || '',
            kickoffTime,
            venue: fixture.venue || '',
            homeTeamLogo: fixture.homeTeamLogo || fixture.home_team_logo || null,
            awayTeamLogo: fixture.awayTeamLogo || fixture.away_team_logo || null,
            homeTeamId: fixture.homeTeamId?._id ?? fixture.homeTeamId ?? null,
            awayTeamId: fixture.awayTeamId?._id ?? fixture.awayTeamId ?? null,
          });
          
          // Set as single prediction array for display
          setPredictions([formattedPrediction]);
        } else {
          // API call failed - show error state
          console.error('Failed to load prediction details from API:', result.error);
          setGroupData(null);
          setPredictions([]);
        }
      } catch (error) {
        console.error('Error loading prediction details:', error);
        setGroupData(null);
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPredictionDetails();
    }
  }, [id]);

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
          onClick={() => navigate(constants.routes.predictions)}
          sx={{
            mb: 3,
            color: colors.brandRed,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Back to Predictions
        </Button>
        <Typography variant="h6" sx={{ color: colors.textSecondary }}>
          Prediction not found
        </Typography>
      </Box>
    );
  }

  // Calculate total SP won across all predictions
  const totalSP = predictions.reduce((sum, pred) => sum + (pred.spAwarded || 0), 0);

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
  const statusChipColor = (() => {
    switch (matchStatusDisplay) {
      case 'Live': return { bgcolor: `${colors.brandRed}18`, color: colors.brandRed, border: `1px solid ${colors.brandRed}40` };
      case 'HT': return { bgcolor: `${colors.brandRed}12`, color: colors.brandDarkRed, border: `1px solid ${colors.brandRed}30` };
      case 'Full Time': return { bgcolor: `${colors.success}18`, color: colors.success, border: `1px solid ${colors.success}40` };
      case 'Result Pending': return { bgcolor: '#FFF3E0', color: '#E65100', border: '1px solid #FFE0B2' };
      case 'Results Processing': return { bgcolor: '#E3F2FD', color: '#1565C0', border: '1px solid #BBDEFB' };
      case 'Pending': return { bgcolor: '#F3E5F5', color: '#7B1FA2', border: '1px solid #E1BEE7' };
      case 'Scheduled': return { bgcolor: '#F0F4F8', color: '#475569', border: '1px solid #E2E8F0' };
      default: return { bgcolor: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' };
    }
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
  const kickoffFormatted = groupData.kickoffTime && !isNaN(new Date(groupData.kickoffTime).getTime())
    ? format(new Date(groupData.kickoffTime), 'EEE, d MMM yyyy • HH:mm')
    : null;
  const venueDisplay = groupData.venue && String(groupData.venue).trim() ? groupData.venue : 'Stadium TBD';
  const roundLabel = (groupData.round && String(groupData.round).trim()) || (groupData.matchday ? `Matchday ${groupData.matchday}` : null) || (groupData.cmdName && String(groupData.cmdName).trim()) || null;
  const leagueDisplay = (groupData.league || 'League').replace(/\s*\(API\s+\d+\)\s*$/i, '').trim() || groupData.league || 'League';

  const LOGO_SIZE = 64;
  const TeamBlock = ({ teamId, name, logoUrl, side }) => {
    const logoEl = (
      <Box
        sx={{
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          borderRadius: '50%',
          bgcolor: '#fff',
          border: '1px solid #eee',
          boxSizing: 'border-box',
          margin: '0 auto 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {logoUrl ? (
          <Box component="img" src={logoUrl} alt="" sx={{ width: LOGO_SIZE - 16, height: LOGO_SIZE - 16, objectFit: 'contain', display: 'block' }} />
        ) : (
          <SportsSoccer sx={{ fontSize: 28, color: colors.brandBlack }} />
        )}
      </Box>
    );
    const nameEl = <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.brandBlack }}>{name || 'TBD'}</Typography>;
    const sideEl = <Typography variant="caption" sx={{ color: 'text.secondary' }}>{side}</Typography>;
    const block = (
      <Box sx={{ textAlign: 'center', padding: '16px 8px' }}>
        {logoEl}
        {nameEl}
        {sideEl}
      </Box>
    );
    if (teamId) {
      return (
        <Link to={`${constants.routes.apiSync}/team/${teamId}`} style={{ textDecoration: 'none', color: 'inherit' }} title="View squad (API Data & Sync)">
          <Box sx={{ textAlign: 'center', padding: '16px 8px', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }, '&:hover img': { opacity: 0.9 } }}>
            {logoEl}
            {nameEl}
            {sideEl}
          </Box>
        </Link>
      );
    }
    return block;
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 900, pb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(constants.routes.predictions)}
        sx={{ mb: 2, color: colors.brandRed, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: `${colors.brandRed}0A` } }}
      >
        Back to Predictions
      </Button>

      {/* 1. Match Card - same layout as Fixture Details (league/round, team blocks, kickoff/venue panel) */}
      <Card sx={{ mb: 3, borderRadius: '16px', border: `1px solid ${colors.divider}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <CardContent sx={{ p: 3.5 }}>
          {/* MLS row: league + round on left, status on right */}
          <Box sx={{ pl: 2, borderLeft: `4px solid ${colors.brandRed}`, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="overline" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: '0.06em', fontSize: 12 }}>
                {leagueDisplay}{roundLabel ? ` · ${roundLabel}` : ''}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={matchStatusDisplay} size="small" sx={{ fontWeight: 600, ...statusChipColor }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                • {groupData.totalPredictions || predictions.length} Predictions
              </Typography>
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            {countdownToKickoffStr && (
              <Typography variant="body2" sx={{ color: colors.brandRed, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime sx={{ fontSize: 18 }} />
                {countdownToKickoffStr}
              </Typography>
            )}
            {kickoffFormatted && (
              <Typography variant="body2" sx={{ color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: 1, mt: countdownToKickoffStr ? 0.5 : 0 }}>
                <AccessTime sx={{ fontSize: 18, color: colors.brandRed }} />
                {kickoffFormatted}
              </Typography>
            )}
          </Box>

          {liveElapsedMins != null && (
            <Typography variant="h6" sx={{ textAlign: 'center', color: colors.brandRed, fontWeight: 700, mb: 1 }}>
              {liveElapsedMins}'
            </Typography>
          )}

          <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={5} sm={4} sx={{ textAlign: 'center' }}>
              <TeamBlock teamId={groupData.homeTeamId} name={groupData.homeTeam} logoUrl={groupData.homeTeamLogo} side="Home" />
            </Grid>
            <Grid item xs={2} sm={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack }}>
                {groupData.actualResult ? groupData.actualResult.replace('-', ' – ') : 'vs'}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5, fontWeight: 500 }}>
                {venueDisplay}
              </Typography>
            </Grid>
            <Grid item xs={5} sm={4} sx={{ textAlign: 'center' }}>
              <TeamBlock teamId={groupData.awayTeamId} name={groupData.awayTeam} logoUrl={groupData.awayTeamLogo} side="Away" />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />
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
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 3. Prediction Breakdown – section header + rounded detail cards */}
      <Box sx={{ pl: 2, borderLeft: `4px solid ${colors.brandRed}`, mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: colors.brandBlack }}>
          Prediction Breakdown
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.25 }}>
          {predictions.length} prediction{predictions.length !== 1 ? 's' : ''} for this match
        </Typography>
      </Box>

      {predictions.map((pred, index) => (
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

              {/* SP Value – rounded panel at bottom of card */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, p: 2, borderRadius: '12px', bgcolor: `${colors.brandRed}0C`, border: `1px solid ${colors.brandRed}25` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Star sx={{ fontSize: 22, color: colors.brandRed }} />
                  <Typography variant="body1" sx={{ color: colors.brandRed, fontWeight: 700 }}>SP Value</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandRed }}>
                  {pred.spAwarded || 0} SP
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* 4. Overall Match Total for SP - card with border/shadow and green accent */}
      <Card sx={{ mb: 3, borderRadius: '16px', border: `1px solid ${colors.divider}`, borderLeft: `4px solid ${colors.success}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', bgcolor: `${colors.success}08` }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmojiEvents sx={{ fontSize: 32, color: colors.success }} />
                <Box>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Total SP Won for This Match
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: colors.success }}>
                    {totalSP} SP
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                From {predictions.length} Predictions
              </Typography>
              <Chip
                icon={<Star sx={{ fontSize: 16 }} />}
                label={`${predictions.filter(p => p.correctness === 'won').length} Correct`}
                sx={{
                  bgcolor: colors.success,
                  color: colors.brandWhite,
                  fontWeight: 700,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
