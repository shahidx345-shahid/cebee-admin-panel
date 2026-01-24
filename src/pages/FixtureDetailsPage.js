import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Schedule,
  Lock,
  PlayCircle,
  CheckCircle,
  SportsSoccer,
  AccessTime,
  HourglassEmpty,
  LocationOn,
  CalendarToday,
  People,
  ArrowUpward,
  Person,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';

const FixtureDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fixture, setFixture] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const loadFixtureData = async () => {
      try {
        setLoading(true);
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 600));

        let fixtureData = null;

        // Use sample data directly
        const sampleFixtures = getSampleFixtures();
        fixtureData = sampleFixtures.find(f => f.id === id);

        if (fixtureData) {
          setFixture(fixtureData);

          // Return sample predictions 
          const samplePredictions = getSamplePredictions(id);
          setPredictions(samplePredictions);
          setFilteredPredictions(samplePredictions);
        }
      } catch (error) {
        console.error('Error loading fixture:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFixtureData();
  }, [id]);

  useEffect(() => {
    const filterPredictions = () => {
      if (!searchQuery) {
        setFilteredPredictions(predictions);
        return;
      }
      const query = searchQuery.toLowerCase();
      const filtered = predictions.filter(
        (pred) =>
          pred.username?.toLowerCase().includes(query) ||
          pred.userId?.toLowerCase().includes(query) ||
          pred.email?.toLowerCase().includes(query) ||
          pred.fullName?.toLowerCase().includes(query)
      );
      setFilteredPredictions(filtered);
    };
    filterPredictions();
  }, [predictions, searchQuery]);

  const getSampleFixtures = () => {
    const now = new Date();
    return [
      // Scheduled fixtures
      {
        id: 'MATCH_001',
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        league: 'Premier League',
        kickoffTime: new Date('2026-01-22T20:15:00'),
        matchStatus: 'scheduled',
        status: 'scheduled',
        homeScore: undefined,
        awayScore: undefined,
        predictions: 0,
      },
      {
        id: 'MATCH_006',
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        league: 'La Liga',
        kickoffTime: new Date('2026-01-25T20:15:00'),
        matchStatus: 'scheduled',
        status: 'scheduled',
        homeScore: undefined,
        awayScore: undefined,
        predictions: 0,
      },
      {
        id: 'MATCH_007',
        homeTeam: 'Bayern Munich',
        awayTeam: 'Borussia Dortmund',
        league: 'Bundesliga',
        kickoffTime: new Date('2026-01-27T20:15:00'),
        matchStatus: 'scheduled',
        status: 'scheduled',
        homeScore: undefined,
        awayScore: undefined,
        predictions: 0,
      },
      {
        id: 'MATCH_012',
        homeTeam: 'PSG',
        awayTeam: 'Marseille',
        league: 'Ligue 1',
        kickoffTime: new Date('2026-01-23T21:00:00'),
        matchStatus: 'scheduled',
        status: 'scheduled',
        homeScore: undefined,
        awayScore: undefined,
        predictions: 0,
      },
      // Published fixtures
      {
        id: 'MATCH_014',
        homeTeam: 'Manchester City',
        awayTeam: 'Tottenham',
        league: 'Premier League',
        kickoffTime: new Date('2026-01-21T15:00:00'),
        matchStatus: 'published',
        status: 'published',
        homeScore: undefined,
        awayScore: undefined,
        predictions: 25,
      },
      {
        id: 'MATCH_015',
        homeTeam: 'AC Milan',
        awayTeam: 'Inter Milan',
        league: 'Serie A',
        kickoffTime: new Date('2026-01-21T20:00:00'),
        matchStatus: 'published',
        status: 'published',
        homeScore: undefined,
        awayScore: undefined,
        predictions: 18,
      },
      // Live fixtures
      {
        id: 'MATCH_003',
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea',
        league: 'Premier League',
        kickoffTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        matchStatus: 'live',
        status: 'live',
        homeScore: 1,
        awayScore: 1,
        predictions: 52,
      },
      {
        id: 'MATCH_016',
        homeTeam: 'Leicester City',
        awayTeam: 'Southampton',
        league: 'Premier League',
        kickoffTime: new Date(now.getTime() - 0.5 * 60 * 60 * 1000),
        matchStatus: 'live',
        status: 'live',
        homeScore: 2,
        awayScore: 0,
        predictions: 31,
      },
      // Result Pending fixtures
      {
        id: 'MATCH_009',
        homeTeam: 'Everton',
        awayTeam: 'Fulham',
        league: 'Premier League',
        kickoffTime: new Date('2026-01-20T18:15:00'),
        matchStatus: 'resultsProcessing',
        status: 'resultsProcessing',
        homeScore: 1,
        awayScore: 2,
        firstGoalScorer: '',
        firstGoalMinute: '',
        predictions: 45,
      },
      {
        id: 'MATCH_010',
        homeTeam: 'Tottenham',
        awayTeam: 'Newcastle',
        league: 'Premier League',
        kickoffTime: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        matchStatus: 'resultsProcessing',
        status: 'resultsProcessing',
        homeScore: 2,
        awayScore: 1,
        firstGoalScorer: '',
        firstGoalMinute: '',
        predictions: 38,
      },
      {
        id: 'MATCH_011',
        homeTeam: 'Brighton',
        awayTeam: 'Crystal Palace',
        league: 'Premier League',
        kickoffTime: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        matchStatus: 'pending',
        status: 'pending',
        homeScore: 0,
        awayScore: 1,
        firstGoalScorer: '',
        firstGoalMinute: '',
        predictions: 22,
      },
      // Completed fixtures
      {
        id: 'MATCH_004',
        homeTeam: 'Newcastle',
        awayTeam: 'Brighton',
        league: 'Premier League',
        kickoffTime: new Date('2026-01-19T20:15:00'),
        matchStatus: 'completed',
        status: 'completed',
        homeScore: 2,
        awayScore: 1,
        firstGoalScorer: 'Wilson',
        firstGoalMinute: 23,
        predictions: 48,
      },
      {
        id: 'MATCH_005',
        homeTeam: 'West Ham',
        awayTeam: 'Aston Villa',
        league: 'Premier League',
        kickoffTime: new Date('2026-01-18T20:15:00'),
        matchStatus: 'completed',
        status: 'completed',
        homeScore: 1,
        awayScore: 1,
        firstGoalScorer: 'Watkins',
        firstGoalMinute: 15,
        predictions: 42,
      },
      {
        id: 'MATCH_008',
        homeTeam: 'Wolves',
        awayTeam: 'Crystal Palace',
        league: 'Premier League',
        kickoffTime: new Date('2026-01-17T20:15:00'),
        matchStatus: 'completed',
        status: 'completed',
        homeScore: 3,
        awayScore: 0,
        firstGoalScorer: 'Neto',
        firstGoalMinute: 8,
        predictions: 35,
      },
      {
        id: 'MATCH_017',
        homeTeam: 'Burnley',
        awayTeam: 'Sheffield United',
        league: 'Premier League',
        kickoffTime: new Date('2026-01-16T15:00:00'),
        matchStatus: 'completed',
        status: 'completed',
        homeScore: 2,
        awayScore: 2,
        firstGoalScorer: 'Brownhill',
        firstGoalMinute: 12,
        predictions: 28,
      },
      {
        id: 'MATCH_018',
        homeTeam: 'Brentford',
        awayTeam: 'Nottingham Forest',
        league: 'Premier League',
        kickoffTime: new Date('2026-01-15T17:30:00'),
        matchStatus: 'completed',
        status: 'completed',
        homeScore: 1,
        awayScore: 0,
        firstGoalScorer: 'Toney',
        firstGoalMinute: 34,
        predictions: 39,
      },
    ];
  };

  const getSamplePredictions = (fixtureId) => {
    // Sample predictions data matching the design
    return [
      {
        id: 'PRED_001',
        userId: 'USER001',
        username: 'john_doe',
        email: 'john@example.com',
        fullName: 'John Doe',
        prediction: 'Newcastle Win',
        predictionTime: new Date('2026-01-18T20:17:00'),
        status: 'won',
      },
      {
        id: 'PRED_002',
        userId: 'USER006',
        username: 'emma_davis',
        email: 'emma@example.com',
        fullName: 'Emma Davis',
        prediction: 'Brighton Win',
        predictionTime: new Date('2026-01-18T20:17:00'),
        status: 'lost',
      },
      {
        id: 'PRED_003',
        userId: 'USER007',
        username: 'alex_miller',
        email: 'alex@example.com',
        fullName: 'Alex Miller',
        prediction: 'Newcastle Win',
        predictionTime: new Date('2026-01-18T20:17:00'),
        status: 'won',
      },
    ];
  };



  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: colors.brandRed }} />
      </Box>
    );
  }

  if (!fixture) {
    return (
      <Box sx={{ textAlign: 'center', padding: 6 }}>
        <Typography variant="h6" sx={{ color: colors.error, mb: 2 }}>
          Fixture not found
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(constants.routes.fixtures)}
          sx={{
            background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Back to Fixtures
        </Button>
      </Box>
    );
  }

  const getStatusChip = (status) => {
    // Map old statuses to new match flow states for backward compatibility
    const statusMap = {
      scheduled: 'predictionOpen',
      published: 'predictionOpen',
      predictionOpen: 'predictionOpen',
      predictionLocked: 'predictionLocked',
      locked: 'predictionLocked',
      live: 'live',
      fullTime: 'fullTime',
      resultsProcessing: 'fullTimeProcessing',
      fullTimeProcessing: 'fullTimeProcessing',
      completed: 'fullTimeCompleted',
      fullTimeCompleted: 'fullTimeCompleted',
    };

    const mappedStatus = statusMap[status] || 'predictionOpen';

    const statusConfig = {
      predictionOpen: {
        label: 'Prediction Open',
        color: colors.info,
        icon: AccessTime
      },
      predictionLocked: {
        label: 'Prediction Locked',
        color: colors.warning,
        icon: Lock
      },
      live: {
        label: 'Live',
        color: colors.error,
        icon: PlayCircle
      },
      fullTimeProcessing: {
        label: 'Full Time (Results Processing)',
        color: colors.warning,
        icon: HourglassEmpty
      },
      fullTimeCompleted: {
        label: 'Full Time (Completed)',
        color: colors.success,
        icon: CheckCircle
      },
    };

    const config = statusConfig[mappedStatus] || statusConfig.predictionOpen;
    const Icon = config.icon;

    return (
      <Chip
        icon={<Icon />}
        label={config.label}
        sx={{
          backgroundColor: `${config.color}1A`,
          color: config.color,
          fontWeight: 600,
        }}
      />
    );
  };

  const steps = [
    'Prediction Open',
    'Prediction Locked',
    'Live',
    'Full Time (Results Processing)',
    'Full Time (Completed)'
  ];

  const getActiveStep = () => {
    const status = fixture.matchStatus || fixture.status;

    // Map old statuses to new match flow states
    const statusMap = {
      scheduled: 'predictionOpen',
      published: 'predictionOpen',
      predictionOpen: 'predictionOpen',
      predictionLocked: 'predictionLocked',
      locked: 'predictionLocked',
      live: 'live',
      fullTime: 'fullTimeProcessing',
      resultsProcessing: 'fullTimeProcessing',
      fullTimeProcessing: 'fullTimeProcessing',
      completed: 'fullTimeCompleted',
      fullTimeCompleted: 'fullTimeCompleted',
    };

    const mappedStatus = statusMap[status] || 'predictionOpen';

    // Return step index based on match flow state
    if (mappedStatus === 'predictionOpen') return 0;
    if (mappedStatus === 'predictionLocked') return 1;
    if (mappedStatus === 'live') return 2;
    if (mappedStatus === 'fullTimeProcessing') return 3;
    if (mappedStatus === 'fullTimeCompleted') return 4;

    return 0;
  };

  const columns = [
    {
      id: 'userId',
      label: 'User ID',
      render: (_, row) => (
        <Chip
          label={row.userId || 'N/A'}
          sx={{
            backgroundColor: '#FFE5E5',
            color: colors.brandRed,
            fontWeight: 600,
            fontSize: 11,
            height: 28,
            borderRadius: '20px',
            border: 'none',
          }}
        />
      ),
    },
    {
      id: 'username',
      label: 'Username',
      render: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: colors.brandRed,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Person sx={{ fontSize: 18, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
              {row.username || row.fullName || 'N/A'}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 11 }}>
              {row.email || ''}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'prediction',
      label: 'Prediction',
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
          {row.prediction || row.selectedTeam || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'predictionTime',
      label: 'Prediction Time',
      render: (_, row) => {
        const time = row.predictionTime?.toDate ? row.predictionTime.toDate() : new Date(row.predictionTime);
        return (
          <Typography variant="body2" sx={{ color: colors.brandBlack }}>
            {row.predictionTime ? format(time, 'MMM dd, yyyy HH:mm') : 'N/A'}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => {
        const status = row.status || row.predictionStatus;
        const statusConfig = {
          won: { label: 'WON', color: colors.success },
          lost: { label: 'LOST', color: colors.error },
          correct: { label: 'WON', color: colors.success },
          incorrect: { label: 'LOST', color: colors.error },
          ongoing: { label: 'Ongoing', color: colors.info },
          pending: { label: 'Pending', color: colors.warning },
        };
        const config = statusConfig[status] || statusConfig.ongoing;
        return (
          <Chip
            label={config.label}
            size="small"
            sx={{
              backgroundColor: `${config.color}1A`,
              color: config.color,
              fontWeight: 700,
              fontSize: 11,
              height: 28,
              borderRadius: '20px',
            }}
          />
        );
      },
    },
  ];

  const paginatedPredictions = filteredPredictions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusInfo = () => {
    const status = fixture.matchStatus || fixture.status;
    const statusMap = {
      scheduled: 'predictionOpen',
      published: 'predictionOpen',
      predictionOpen: 'predictionOpen',
      predictionLocked: 'predictionLocked',
      locked: 'predictionLocked',
      live: 'live',
      fullTime: 'fullTimeProcessing',
      resultsProcessing: 'fullTimeProcessing',
      fullTimeProcessing: 'fullTimeProcessing',
      completed: 'fullTimeCompleted',
      fullTimeCompleted: 'fullTimeCompleted',
    };
    return statusMap[status] || 'predictionOpen';
  };

  const getStatusCardConfig = () => {
    const status = getStatusInfo();
    const configs = {
      predictionOpen: {
        title: 'Prediction Open',
        subtitle: 'Users can predict',
        icon: AccessTime,
        color: colors.info,
        isPrimary: false,
      },
      predictionLocked: {
        title: 'Prediction Locked',
        subtitle: 'Predictions closed',
        icon: Lock,
        color: colors.warning,
        isPrimary: false,
      },
      live: {
        title: 'Live Match',
        subtitle: 'Match in progress',
        icon: PlayCircle,
        color: colors.brandRed,
        isPrimary: true,
      },
      fullTimeProcessing: {
        title: 'Full Time',
        subtitle: 'Results Processing',
        icon: HourglassEmpty,
        color: colors.warning,
        isPrimary: false,
      },
      fullTimeCompleted: {
        title: 'Full Time',
        subtitle: 'Match Completed',
        icon: CheckCircle,
        color: colors.success,
        isPrimary: false,
      },
    };
    return configs[status];
  };

  const statusConfig = getStatusCardConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', pb: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(constants.routes.fixtures)}
        sx={{
          mb: 3,
          color: colors.brandRed,
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: `${colors.brandRed}0A`,
          },
        }}
      >
        Back to Fixtures
      </Button>

      {/* Scorecard Header */}
      <Card
        sx={{
          mb: 3,
          borderRadius: '24px',
          background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
          boxShadow: `0 8px 32px ${colors.brandRed}40`,
          position: 'relative',
          overflow: 'hidden',
          color: colors.brandWhite
        }}
      >
        <Box sx={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.4) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.4) 0%, transparent 20%)'
        }} />

        <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Chip icon={<CalendarToday sx={{ fontSize: 14, color: '#fff !important' }} />} label={fixture.kickoffTime ? format(fixture.kickoffTime, 'EEE, MMM dd • HH:mm') : 'TBD'} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 600 }} />
            <Chip label={(fixture.status || 'scheduled').toUpperCase()} sx={{ fontWeight: 700, bgcolor: fixture.status === 'live' ? colors.brandBlack : 'rgba(255,255,255,0.2)', color: '#fff' }} />
          </Box>

          <Grid container alignItems="center" justifyContent="center" spacing={2}>
            {/* Home Team */}
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <SportsSoccer sx={{ fontSize: 40, color: colors.brandBlack }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{fixture.homeTeam}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Home</Typography>
            </Grid>

            {/* Score */}
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '16px', px: 4, py: 2, display: 'inline-block' }}>
                <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1 }}>
                  {fixture.homeScore !== undefined ? fixture.homeScore : '-'} : {fixture.awayScore !== undefined ? fixture.awayScore : '-'}
                </Typography>
                {(fixture.status === 'live' || fixture.status === 'fullTime') && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {fixture.status === 'live' ? 'Live' : 'Full Time'}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Away Team */}
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <SportsSoccer sx={{ fontSize: 40, color: colors.brandBlack }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{fixture.awayTeam}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Away</Typography>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 3, opacity: 0.8 }}>
            <LocationOn sx={{ fontSize: 16 }} />
            <Typography variant="body2">Emirates Stadium, London</Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Match Stats (Mock) */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: '20px', mb: 3, p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Match Statistics</Typography>

            {['Possession', 'Shots on Target', 'Corners'].map((stat, i) => (
              <Box key={stat} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{i === 0 ? '55%' : i === 1 ? '6' : '4'}</Typography>
                  <Typography variant="body2" color="text.secondary">{stat}</Typography>
                  <Typography variant="body2" fontWeight={600}>{i === 0 ? '45%' : i === 1 ? '3' : '2'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, height: 8, borderRadius: 4, overflow: 'hidden' }}>
                  <Box sx={{ flex: i === 0 ? 0.55 : i === 1 ? 0.6 : 0.65, bgcolor: colors.brandRed }} />
                  <Box sx={{ flex: i === 0 ? 0.45 : i === 1 ? 0.4 : 0.35, bgcolor: '#E5E7EB' }} />
                </Box>
              </Box>
            ))}
          </Card>

          {/* Predictions List */}
          <Card sx={{ borderRadius: '20px', p: 0 }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${colors.divider}` }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>User Predictions</Typography>
            </Box>
            <DataTable
              columns={[
                {
                  id: 'username',
                  label: 'User',
                  render: (_, row) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Person sx={{ fontSize: 16, color: '#9CA3AF' }} /></Box>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{row.username}</Typography>
                        <Typography variant="caption" color="text.secondary">ID: {row.userId}</Typography>
                      </Box>
                    </Box>
                  )
                },
                {
                  id: 'prediction',
                  label: 'Prediction',
                  render: (_, row) => <Typography variant="body2" fontWeight={600}>{row.prediction}</Typography>
                },
                {
                  id: 'status',
                  label: 'Fixture Flow Status',
                  render: (_, row) => {
                    const pStatus = row.status || 'ongoing';
                    let label = 'Unknown';
                    let color = 'default';
                    let icon = AccessTime;

                    if (pStatus === 'won') { label = 'WON'; color = 'success'; icon = CheckCircle; }
                    else if (pStatus === 'lost') { label = 'LOST'; color = 'error'; icon = CheckCircle; }
                    else {
                      const fStatus = fixture.status || 'scheduled';
                      if (fStatus === 'scheduled') { label = 'Open'; color = 'info'; }
                      else if (fStatus === 'live') { label = 'Locked / Live'; color = 'warning'; icon = Lock; }
                      else if (fStatus === 'completed' || fStatus === 'resultsProcessing') { label = 'Awaiting Settlement'; color = 'warning'; icon = HourglassEmpty; }
                      else { label = 'Open'; color = 'info'; }
                    }

                    return (
                      <Chip
                        icon={<Box component={icon} sx={{ fontSize: '14px !important' }} />}
                        label={label}
                        size="small"
                        color={color === 'default' ? 'default' : color}
                        variant={color === 'default' ? 'outlined' : 'filled'}
                        sx={{ fontWeight: 700, height: 24, fontSize: 11 }}
                      />
                    );
                  }
                }
              ]}
              data={filteredPredictions}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={filteredPredictions.length}
              onPageChange={(e, p) => setPage(p)}
              onRowsPerPageChange={(e) => setRowsPerPage(e.target.value)}
              emptyMessage="No predictions found"
            />
          </Card>
        </Grid>

        {/* Right Sidebar: Timeline & Actions */}
        <Grid item xs={12} md={4}>
          {/* Admin Actions */}
          <Card sx={{ borderRadius: '20px', p: 3, mb: 3, bgcolor: '#FFF8F6', border: `1px solid ${colors.brandRed}20` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: colors.brandRed }}>Admin Actions</Typography>
            <Button fullWidth variant="contained" sx={{ mb: 1, bgcolor: colors.brandRed, '&:hover': { bgcolor: colors.brandDarkRed } }}>
              Approve Match Details
            </Button>
            <Button fullWidth variant="outlined" color="error">
              Settle / Update Score
            </Button>
          </Card>

          {/* Timeline (Mock) */}
          <Card sx={{ borderRadius: '20px', p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Key Events</Typography>
            <Box sx={{ position: 'relative', pl: 2, borderLeft: `2px solid ${colors.divider}` }}>
              {[
                { min: '78', event: 'Goal - Away', detail: 'Salah' },
                { min: '45', event: 'Half Time', detail: '1-1' },
                { min: '23', event: 'Goal - Home', detail: 'Rashford' },
                { min: '0', event: 'Kickoff', detail: '' },
              ].map((ev, i) => (
                <Box key={i} sx={{ mb: 3, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', left: -21, top: 0, width: 10, height: 10, borderRadius: '50%', bgcolor: colors.brandRed }} />
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>{ev.min}'</Typography>
                  <Typography variant="body2" fontWeight={600}>{ev.event}</Typography>
                  <Typography variant="caption">{ev.detail}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FixtureDetailsPage;
