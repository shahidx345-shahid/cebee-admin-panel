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
    loadFixtureData();
  }, [id]);

  useEffect(() => {
    filterPredictions();
  }, [predictions, searchQuery]);

  const loadFixtureData = async () => {
    try {
      setLoading(true);
      const fixtureRef = doc(db, 'fixtures', id);
      const fixtureDoc = await getDoc(fixtureRef);
      if (fixtureDoc.exists()) {
        const fixtureData = { id: fixtureDoc.id, ...fixtureDoc.data() };
        setFixture(fixtureData);

        // Load predictions for this fixture
        const predictionsRef = collection(db, 'predictions');
        const q = query(predictionsRef, where('fixtureId', '==', id));
        const snapshot = await getDocs(q);
        const predictionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPredictions(predictionsData);
        setFilteredPredictions(predictionsData);
      }
    } catch (error) {
      console.error('Error loading fixture:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPredictions = () => {
    if (!searchQuery) {
      setFilteredPredictions(predictions);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = predictions.filter(
      (pred) =>
        pred.username?.toLowerCase().includes(query) ||
        pred.userId?.toLowerCase().includes(query)
    );
    setFilteredPredictions(filtered);
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
      id: 'username',
      label: 'User',
      render: (value) => value || 'N/A',
    },
    {
      id: 'prediction',
      label: 'Prediction',
      render: (value, row) => row.selectedTeam || row.prediction || 'N/A',
    },
    {
      id: 'spAwarded',
      label: 'SP Awarded',
      render: (value) => value || 0,
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => {
        const status = row.status || row.predictionStatus;
        const statusConfig = {
          correct: { label: 'Correct', color: colors.success },
          incorrect: { label: 'Incorrect', color: colors.error },
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
              fontWeight: 600,
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

      {/* Predictions Section */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          User Predictions
      </Typography>
        <Chip
          label={`${predictions.length} Total`}
          sx={{
            backgroundColor: `${colors.info}1A`,
            color: colors.info,
            fontWeight: 600,
          }}
        />
      </Box>
      <Card
        sx={{
          padding: { xs: 2, md: 2.5 },
          borderRadius: '20px',
          background: colors.brandWhite,
          border: `1.5px solid ${colors.divider}26`,
          boxShadow: `0 6px 14px ${colors.shadow}1F`,
        }}
      >
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
      </Card>
    </Box>
  );
};

export default FixtureDetailsPage;
