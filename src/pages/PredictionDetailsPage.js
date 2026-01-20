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
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  SportsSoccer,
  AccessTime,
  CheckCircle,
  Cancel,
  Star,
  CalendarToday,
  Lock,
  Shield,
  Diamond,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';

const PredictionDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  useEffect(() => {
    if (id) {
      loadPredictionGroup();
    }
  }, [id]);

  const loadPredictionGroup = async () => {
    try {
      setLoading(true);
      const decodedId = decodeURIComponent(id);
      const [userId, matchId] = decodedId.split('_');

      // Load all predictions for this user-match combination
      const predictionsRef = collection(db, 'predictions');
      const q = query(
        predictionsRef,
        where('userId', '==', userId),
        where('fixtureId', '==', matchId)
      );
      const snapshot = await getDocs(q);
      const predictionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (predictionsData.length > 0) {
        const firstPred = predictionsData[0];
        setGroupData({
          userId: userId,
          username: firstPred.username || 'Unknown User',
          userEmail: firstPred.userEmail || '',
          matchId: matchId,
          matchName: firstPred.matchName || `${firstPred.homeTeam || 'TBD'} vs ${firstPred.awayTeam || 'TBD'}`,
          homeTeam: firstPred.homeTeam || 'TBD',
          awayTeam: firstPred.awayTeam || 'TBD',
          fixtureId: firstPred.fixtureId || matchId,
        });
        setPredictions(predictionsData);
        // Show the first prediction by default
        setSelectedPrediction(predictionsData[0]);
      }
    } catch (error) {
      console.error('Error loading prediction group:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeChip = (type) => {
    const typeMap = {
      'correct_score': { label: 'Correct Score', icon: Diamond },
      'goal_range': { label: 'Goal Range', icon: Star },
      'match_result': { label: 'Match Result', icon: CheckCircle },
      'both_teams_score': { label: 'Both Teams Score', icon: Star },
    };
    
    const config = typeMap[type] || typeMap['correct_score'];
    const Icon = config.icon;

    return (
      <Chip
        icon={<Icon sx={{ fontSize: 14 }} />}
        label={config.label}
        sx={{
          backgroundColor: colors.brandWhite,
          color: colors.brandBlack,
          border: `1.5px solid ${colors.brandWhite}`,
          fontWeight: 600,
          fontSize: 11,
          height: 28,
          borderRadius: '8px',
        }}
      />
    );
  };

  const getStatusChip = (status) => {
    if (status === 'ongoing') {
      return (
        <Chip
          label="ONGOING"
          sx={{
            backgroundColor: colors.brandWhite,
            color: colors.brandBlack,
            border: `1.5px solid ${colors.brandWhite}`,
            fontWeight: 700,
            fontSize: 11,
            height: 28,
            borderRadius: '8px',
          }}
        />
      );
    }
    
    return (
      <Chip
        label="COMPLETED"
        sx={{
          backgroundColor: colors.brandWhite,
          color: colors.brandBlack,
          border: `1.5px solid ${colors.brandWhite}`,
          fontWeight: 700,
          fontSize: 11,
          height: 28,
          borderRadius: '8px',
        }}
      />
    );
  };

  const getCorrectnessChip = (status) => {
    if (status === 'correct') {
      return (
        <Chip
          icon={<CheckCircle sx={{ fontSize: 14 }} />}
          label="Correct"
          sx={{
            backgroundColor: colors.success,
            color: colors.brandWhite,
            border: `1.5px solid ${colors.success}`,
            fontWeight: 600,
            fontSize: 11,
            height: 32,
            borderRadius: '8px',
            '& .MuiChip-icon': {
              color: colors.brandWhite,
            },
          }}
        />
      );
    }
    
    return (
      <Chip
        icon={<Cancel sx={{ fontSize: 14 }} />}
        label="Incorrect"
        sx={{
          backgroundColor: colors.error,
          color: colors.brandWhite,
          border: `1.5px solid ${colors.error}`,
          fontWeight: 600,
          fontSize: 11,
          height: 32,
          borderRadius: '8px',
          '& .MuiChip-icon': {
            color: colors.brandWhite,
          },
        }}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!groupData || !selectedPrediction) {
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

  const predStatus = selectedPrediction.status || selectedPrediction.predictionStatus || 'ongoing';
  const isCompleted = predStatus === 'correct' || predStatus === 'incorrect';

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', pb: 4 }}>
      {/* Immutable Record Banner */}
      <Alert
        icon={<Shield sx={{ fontSize: 20 }} />}
        sx={{
          mb: 3,
          borderRadius: '12px',
          backgroundColor: `${colors.info}26`,
          border: `1.5px solid ${colors.info}4D`,
          py: 1.5,
          '& .MuiAlert-icon': {
            color: colors.info,
          },
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, color: colors.info, fontSize: 14, mb: 0.5 }}>
          Immutable Record
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
          This prediction is a permanent audit record and cannot be modified or deleted.
        </Typography>
      </Alert>

      {/* Main Prediction Card - Red */}
      <Card
        sx={{
          padding: 4,
          mb: 3,
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
          boxShadow: `0 6px 18px ${colors.brandRed}40`,
          position: 'relative',
        }}
      >
        <CardContent sx={{ padding: 0, '&:last-child': { paddingBottom: 0 } }}>
          {/* Top Row - Prediction ID and Status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Chip
              label={selectedPrediction.id?.substring(0, 8).toUpperCase() || 'PRED016'}
              sx={{
                backgroundColor: colors.brandWhite,
                color: colors.brandBlack,
                border: `1.5px solid ${colors.brandWhite}`,
                fontWeight: 700,
                fontSize: 11,
                height: 28,
                borderRadius: '8px',
              }}
            />
            {getStatusChip(predStatus)}
          </Box>

          {/* Prediction Type */}
          <Box sx={{ mb: 2 }}>
            {getTypeChip(selectedPrediction.predictionType || selectedPrediction.type || 'correct_score')}
          </Box>

          {/* Match Title */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: colors.brandWhite,
              mb: 4,
              fontSize: { xs: 28, md: 36 },
            }}
          >
            {groupData.matchName}
          </Typography>

          {/* Prediction Section */}
          <Box
            sx={{
              padding: 2.5,
              mb: 3,
              borderRadius: '16px',
              backgroundColor: `${colors.brandDarkRed}80`,
              border: `1px solid ${colors.brandWhite}33`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Star sx={{ fontSize: 24, color: colors.brandWhite }} />
              <Box>
                <Typography variant="body2" sx={{ color: `${colors.brandWhite}DD`, mb: 0.5 }}>
                  Prediction
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.brandWhite }}>
                  {selectedPrediction.prediction || selectedPrediction.selectedTeam || selectedPrediction.predictionText || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Bottom Row - Prediction Time, SP Awarded, Actual Result, Prediction Status */}
          <Grid container spacing={3}>
            {/* Prediction Time */}
            <Grid item xs={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <CalendarToday sx={{ fontSize: 20, color: colors.brandWhite }} />
                <Typography variant="body2" sx={{ color: `${colors.brandWhite}DD`, fontWeight: 600 }}>
                  Prediction Time
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: colors.brandWhite }}>
                {selectedPrediction.predictionTime
                  ? format(
                      selectedPrediction.predictionTime?.toDate
                        ? selectedPrediction.predictionTime.toDate()
                        : new Date(selectedPrediction.predictionTime),
                      'MMM dd, yyyy HH:mm'
                    )
                  : 'N/A'}
              </Typography>
            </Grid>

            {/* SP Awarded */}
            <Grid item xs={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Star sx={{ fontSize: 20, color: colors.brandWhite }} />
                <Typography variant="body2" sx={{ color: `${colors.brandWhite}DD`, fontWeight: 600 }}>
                  SP Awarded
                </Typography>
              </Box>
              {isCompleted ? (
                <Chip
                  icon={<CheckCircle sx={{ fontSize: 14 }} />}
                  label={`${selectedPrediction.spAwarded || 0} SP`}
                  sx={{
                    backgroundColor: colors.brandWhite,
                    color: colors.brandRed,
                    border: `1.5px solid ${colors.brandWhite}`,
                    fontWeight: 600,
                    fontSize: 11,
                    height: 32,
                    borderRadius: '8px',
                    '& .MuiChip-icon': {
                      color: colors.brandRed,
                    },
                  }}
                />
              ) : (
                <Chip
                  icon={<AccessTime sx={{ fontSize: 14 }} />}
                  label="Pending"
                  sx={{
                    backgroundColor: colors.brandWhite,
                    color: colors.textSecondary,
                    border: `1.5px solid ${colors.brandWhite}`,
                    fontWeight: 600,
                    fontSize: 11,
                    height: 32,
                    borderRadius: '8px',
                    '& .MuiChip-icon': {
                      color: colors.textSecondary,
                    },
                  }}
                />
              )}
            </Grid>

            {/* Actual Result */}
            <Grid item xs={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <CheckCircle sx={{ fontSize: 20, color: colors.brandWhite }} />
                <Typography variant="body2" sx={{ color: `${colors.brandWhite}DD`, fontWeight: 600 }}>
                  Actual Result
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandWhite }}>
                {selectedPrediction.actualResult || 'N/A'}
              </Typography>
            </Grid>

            {/* Prediction Status */}
            <Grid item xs={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <CheckCircle sx={{ fontSize: 20, color: colors.brandWhite }} />
                <Typography variant="body2" sx={{ color: `${colors.brandWhite}DD`, fontWeight: 600 }}>
                  Prediction Status
                </Typography>
              </Box>
              {getCorrectnessChip(predStatus)}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* User Details and Match Details Cards */}
      <Grid container spacing={3}>
        {/* User Details Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '20px',
              background: colors.brandWhite,
              border: `1.5px solid ${colors.info}26`,
              boxShadow: `0 6px 14px ${colors.info}1F`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  padding: 1.5,
                  background: `linear-gradient(135deg, ${colors.info} 0%, ${colors.info}80 100%)`,
                  borderRadius: '16px',
                  boxShadow: `0 4px 12px ${colors.info}40`,
                }}
              >
                <Person sx={{ fontSize: 28, color: colors.brandWhite }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                User Details
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                  Username
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: colors.brandBlack }}>
                  {groupData.username}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: colors.brandBlack }}>
                  {groupData.userEmail || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Match Details Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '20px',
              background: colors.brandWhite,
              border: `1.5px solid ${colors.success}26`,
              boxShadow: `0 6px 14px ${colors.success}1F`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  padding: 1.5,
                  background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.success}80 100%)`,
                  borderRadius: '16px',
                  boxShadow: `0 4px 12px ${colors.success}40`,
                }}
              >
                <SportsSoccer sx={{ fontSize: 28, color: colors.brandWhite }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Match Details
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                  Match
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: colors.brandBlack }}>
                  {groupData.matchName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                  Fixture ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: colors.brandBlack }}>
                  {String(groupData.fixtureId).substring(0, 8)}...
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PredictionDetailsPage;
