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
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';

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
        let fixtureData = null;

        // Try to load from Firebase
        try {
          const fixtureRef = doc(db, 'fixtures', id);
          const fixtureDoc = await getDoc(fixtureRef);
          if (fixtureDoc.exists()) {
            fixtureData = { id: fixtureDoc.id, ...fixtureDoc.data() };
          }
        } catch (error) {
          console.log('Firebase load failed, using sample data:', error);
        }

        // If not found in Firebase, use sample data
        if (!fixtureData) {
          const sampleFixtures = getSampleFixtures();
          fixtureData = sampleFixtures.find(f => f.id === id);
        }

        if (fixtureData) {
          setFixture(fixtureData);

          // Load predictions for this fixture (or use sample data for demo)
          try {
            const predictionsRef = collection(db, 'predictions');
            const q = query(predictionsRef, where('fixtureId', '==', id));
            const snapshot = await getDocs(q);
            const predictionsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // If no predictions found, use sample data
            if (predictionsData.length === 0) {
              const samplePredictions = getSamplePredictions(id);
              setPredictions(samplePredictions);
              setFilteredPredictions(samplePredictions);
            } else {
              setPredictions(predictionsData);
              setFilteredPredictions(predictionsData);
            }
          } catch (error) {
            // If error, use sample data
            const samplePredictions = getSamplePredictions(id);
            setPredictions(samplePredictions);
            setFilteredPredictions(samplePredictions);
          }
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

      {/* Match Flow Status Card - Dashboard Style */}
      <Card
        sx={{
          padding: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: '20px',
          background: statusConfig.isPrimary
            ? `linear-gradient(135deg, ${statusConfig.color} 0%, ${colors.brandDarkRed} 100%)`
            : colors.brandWhite,
          border: statusConfig.isPrimary
            ? 'none'
            : `1.5px solid ${statusConfig.color}26`,
          boxShadow: statusConfig.isPrimary
            ? `0 6px 18px ${statusConfig.color}40`
            : `0 6px 14px ${statusConfig.color}1F`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <CardContent sx={{ padding: 0, '&:last-child': { paddingBottom: 0 }, position: 'relative' }}>
          {/* Status Tag at Top Right */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Chip
              label={statusConfig.subtitle}
              icon={<ArrowUpward sx={{ fontSize: 12 }} />}
              size="small"
              sx={{
                backgroundColor: `${colors.success}1A`,
                color: colors.success,
                fontWeight: 500,
                fontSize: { xs: 10.5, md: 11.5 },
                height: 24,
                '& .MuiChip-icon': {
                  color: colors.success,
                  fontSize: 12,
                },
              }}
            />
          </Box>

          {/* Icon at Top Left */}
          <Box
            sx={{
              padding: { xs: 1.25, md: 1.5 },
              width: 'fit-content',
              background: statusConfig.isPrimary
                ? `${colors.brandWhite}33`
                : `${statusConfig.color}1F`,
              borderRadius: '14px',
              boxShadow: statusConfig.isPrimary
                ? '0 3px 8px rgba(0, 0, 0, 0.12)'
                : 'none',
              mb: 2,
            }}
          >
            <StatusIcon
              sx={{
                fontSize: { xs: 24, md: 28 },
                color: statusConfig.isPrimary ? colors.brandWhite : statusConfig.color,
              }}
            />
          </Box>

          {/* Large Status Display */}
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: statusConfig.isPrimary ? colors.brandWhite : colors.brandBlack,
                letterSpacing: -0.8,
                fontSize: { xs: 24, md: 30 },
                mb: 0.75,
              }}
            >
              {getActiveStep() + 1}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: statusConfig.isPrimary ? `${colors.brandWhite}F0` : colors.brandBlack,
                fontSize: { xs: 13, md: 14 },
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {statusConfig.title}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Match Flow Stepper */}
      <Card
        sx={{
          padding: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: '20px',
          background: colors.brandWhite,
          border: `1.5px solid ${colors.divider}26`,
          boxShadow: `0 6px 14px ${colors.shadow}1F`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Match Flow Progress
        </Typography>
        <Stepper activeStep={getActiveStep()} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} completed={index < getActiveStep()}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: 12,
                    fontWeight: index === getActiveStep() ? 600 : 400,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Card>

      {/* Match Information Card */}
      <Card
        sx={{
          padding: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: '20px',
          background: colors.brandWhite,
          border: `1.5px solid ${colors.divider}26`,
          boxShadow: `0 6px 14px ${colors.shadow}1F`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              padding: 2,
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '16px',
              boxShadow: `0 4px 12px ${colors.brandRed}40`,
            }}
          >
            <SportsSoccer sx={{ fontSize: 36, color: colors.brandWhite }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {fixture.homeTeam || 'TBD'} vs {fixture.awayTeam || 'TBD'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<SportsSoccer sx={{ fontSize: 16 }} />}
                label={fixture.league || 'N/A'}
                size="small"
                sx={{
                  backgroundColor: `${colors.info}1A`,
                  color: colors.info,
                  fontWeight: 600,
                  height: 24,
                }}
              />
              <Chip
                icon={<LocationOn sx={{ fontSize: 16 }} />}
                label={fixture.venue || 'TBD'}
                size="small"
                sx={{
                  backgroundColor: `${colors.textSecondary}1A`,
                  color: colors.textSecondary,
                  fontWeight: 500,
                  height: 24,
                }}
              />
            </Box>
          </Box>
          {fixture.homeScore !== undefined && fixture.awayScore !== undefined && (
            <Box
              sx={{
                padding: 2.5,
                background: `linear-gradient(135deg, ${colors.success}1A 0%, ${colors.success}0D 100%)`,
                borderRadius: '16px',
                border: `1.5px solid ${colors.success}33`,
                textAlign: 'center',
                minWidth: 120,
              }}
            >
              <Typography variant="caption" sx={{ color: colors.textSecondary, mb: 0.5, display: 'block' }}>
                Final Score
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: colors.success }}>
                {fixture.homeScore} - {fixture.awayScore}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <Box
              sx={{
                padding: 1.5,
                background: `${colors.info}0D`,
                borderRadius: '12px',
                border: `1px solid ${colors.info}26`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarToday sx={{ fontSize: 18, color: colors.info }} />
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                  Kickoff Time
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: colors.brandBlack }}>
                {fixture.kickoffTime
                  ? format(
                    fixture.kickoffTime?.toDate
                      ? fixture.kickoffTime.toDate()
                      : new Date(fixture.kickoffTime),
                    'MMM dd, yyyy'
                  )
                  : 'TBD'}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
                {fixture.kickoffTime
                  ? format(
                    fixture.kickoffTime?.toDate
                      ? fixture.kickoffTime.toDate()
                      : new Date(fixture.kickoffTime),
                    'HH:mm'
                  )
                  : ''}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box
              sx={{
                padding: 1.5,
                background: `${statusConfig.color}0D`,
                borderRadius: '12px',
                border: `1px solid ${statusConfig.color}26`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StatusIcon sx={{ fontSize: 18, color: statusConfig.color }} />
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                  Match Status
                </Typography>
              </Box>
              <Box sx={{ mt: 0.5 }}>{getStatusChip(fixture.matchStatus || fixture.status)}</Box>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box
              sx={{
                padding: 1.5,
                background: `${colors.success}0D`,
                borderRadius: '12px',
                border: `1px solid ${colors.success}26`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <People sx={{ fontSize: 18, color: colors.success }} />
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                  Predictions
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: colors.success }}>
                {predictions.length}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary, mt: 0.5, display: 'block' }}>
                Total predictions
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box
              sx={{
                padding: 1.5,
                background: `${colors.textSecondary}0D`,
                borderRadius: '12px',
                border: `1px solid ${colors.textSecondary}26`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Schedule sx={{ fontSize: 18, color: colors.textSecondary }} />
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                  Match ID
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontFamily: 'monospace' }}>
                {fixture.id?.substring(0, 8)}...
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* User Predictions Section */}
      <Card
        sx={{
          borderRadius: '20px',
          background: colors.brandWhite,
          border: `1.5px solid ${colors.divider}26`,
          boxShadow: `0 6px 14px ${colors.shadow}1F`,
          overflow: 'hidden',
        }}
      >
        {/* Header with light pink background */}
        <Box
          sx={{
            backgroundColor: '#FFF5F5',
            padding: { xs: 2, md: 2.5 },
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              padding: 1,
              backgroundColor: colors.brandRed,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <People sx={{ fontSize: 20, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.25 }}>
              User Predictions
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              {filteredPredictions.length} {filteredPredictions.length === 1 ? 'prediction' : 'predictions'} found
            </Typography>
          </Box>
        </Box>

        {/* Table Section */}
        <Box sx={{ padding: { xs: 2, md: 2.5 } }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by username or user ID..."
            sx={{ mb: 2.5 }}
          />
          <DataTable
            columns={columns}
            data={paginatedPredictions}
            loading={false}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredPredictions.length}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            emptyMessage="No predictions found"
          />
        </Box>
      </Card>
    </Box>
  );
};

export default FixtureDetailsPage;
