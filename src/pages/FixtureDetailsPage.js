import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Chip,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
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

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(constants.routes.fixtures)}
        sx={{
          mb: 3,
          color: colors.brandRed,
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        Back to Fixtures
      </Button>

      {/* Match Flow Indicator */}
      <Card sx={{ padding: 3, mb: 3, borderRadius: '16px' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Match Flow Status
        </Typography>
        <Stepper activeStep={getActiveStep()} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Card>

      {/* Fixture Info */}
      <Card sx={{ padding: 3, mb: 3, borderRadius: '16px' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  padding: 2,
                  background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
                  borderRadius: '16px',
                }}
              >
                <SportsSoccer sx={{ fontSize: 32, color: colors.brandWhite }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {fixture.homeTeam || 'TBD'} vs {fixture.awayTeam || 'TBD'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {fixture.league || 'N/A'} • {fixture.venue || 'TBD'}
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Kickoff Time
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {fixture.kickoffTime
                    ? format(
                        fixture.kickoffTime?.toDate
                          ? fixture.kickoffTime.toDate()
                          : new Date(fixture.kickoffTime),
                        'MMM dd, yyyy • HH:mm'
                      )
                    : 'TBD'}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>{getStatusChip(fixture.matchStatus || fixture.status)}</Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Total Predictions
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {predictions.length}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Match ID
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {fixture.id}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          {fixture.homeScore !== undefined && fixture.awayScore !== undefined && (
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  padding: 3,
                  background: `linear-gradient(135deg, ${colors.success}1A 0%, ${colors.success}0D 100%)`,
                  borderRadius: '16px',
                  border: `1.5px solid ${colors.success}33`,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: colors.textSecondary, mb: 1 }}>
                  Final Score
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: colors.success }}>
                  {fixture.homeScore} - {fixture.awayScore}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Card>

      {/* Predictions */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        User Predictions ({predictions.length})
      </Typography>
      <Card sx={{ padding: 2.5, mb: 3, borderRadius: '16px' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by username or user ID..."
          sx={{ mb: 2 }}
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
