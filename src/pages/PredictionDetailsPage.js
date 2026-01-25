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
  CalendarToday,
  Shield,
  Diamond,
  EmojiEvents,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import { format } from 'date-fns';

const PredictionDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState(null);
  const [predictions, setPredictions] = useState([]);

  const generateDummyPredictionData = (userId, matchId) => {
    const users = {
      'john_doe': { username: 'John Doe', email: 'john@example.com', country: 'Nigeria', totalPredictions: 45, accuracy: 68.5 },
      'jane_smith': { username: 'Jane Smith', email: 'jane@example.com', country: 'Ghana', totalPredictions: 38, accuracy: 72.1 },
      'mike_wilson': { username: 'Mike Wilson', email: 'mike@example.com', country: 'Kenya', totalPredictions: 52, accuracy: 65.3 },
      'sarah_jones': { username: 'Sarah Jones', email: 'sarah@example.com', country: 'South Africa', totalPredictions: 41, accuracy: 70.2 },
      'david_brown': { username: 'David Brown', email: 'david@example.com', country: 'Egypt', totalPredictions: 47, accuracy: 66.8 },
    };

    const matches = {
      'FIX_001': { homeTeam: 'Arsenal', awayTeam: 'Chelsea', matchName: 'Arsenal vs Chelsea', actualResult: '2-1', status: 'completed' },
      'FIX_002': { homeTeam: 'Liverpool', awayTeam: 'Manchester United', matchName: 'Liverpool vs Manchester United', actualResult: '1-1', status: 'completed' },
      'FIX_003': { homeTeam: 'Manchester City', awayTeam: 'Tottenham', matchName: 'Manchester City vs Tottenham', actualResult: null, status: 'ongoing' },
      'FIX_004': { homeTeam: 'Newcastle', awayTeam: 'Brighton', matchName: 'Newcastle vs Brighton', actualResult: '3-0', status: 'completed' },
    };

    const user = users[userId] || { username: 'Unknown User', email: 'unknown@example.com', country: 'Unknown', totalPredictions: 0, accuracy: 0 };
    const match = matches[matchId] || { homeTeam: 'Team A', awayTeam: 'Team B', matchName: 'Team A vs Team B', actualResult: null, status: 'ongoing' };

    // Generate multiple predictions for this match
    const predictionTypes = [
      { type: 'correct_score', prediction: '2-1', spValue: 50 },
      { type: 'match_result', prediction: 'Arsenal Win', spValue: 30 },
      { type: 'both_teams_score', prediction: 'Yes', spValue: 20 },
    ];

    const predictions = predictionTypes.map((pred, idx) => {
      const isCompleted = match.status === 'completed';
      const isCorrect = isCompleted && (idx === 0 || idx === 1); // First two are correct

      return {
        id: `PRED_${userId}_${matchId}_00${idx + 1}`,
        userId: userId,
        username: user.username,
        userEmail: user.email,
        userCountry: user.country,
        userTotalPredictions: user.totalPredictions,
        userAccuracy: user.accuracy,
        fixtureId: matchId,
        matchId: matchId,
        matchName: match.matchName,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        predictionType: pred.type,
        prediction: pred.prediction,
        predictionTime: new Date(Date.now() - (idx + 1) * 2 * 60 * 60 * 1000),
        status: isCompleted ? (isCorrect ? 'correct' : 'incorrect') : 'pending',
        predictionStatus: isCompleted ? (isCorrect ? 'correct' : 'incorrect') : 'pending',
        actualResult: match.actualResult,
        matchStatus: match.status,
        spStatus: isCompleted ? (isCorrect ? 'awarded' : 'not_awarded') : 'pending',
        spValue: pred.spValue,
        spAwarded: isCompleted && isCorrect ? pred.spValue : 0,
        correctness: isCompleted ? (isCorrect ? 'won' : 'lost') : 'pending',
      };
    });

    return predictions;
  };

  useEffect(() => {
    const loadPredictionGroup = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const decodedId = decodeURIComponent(id);
        const [userId, matchId] = decodedId.split('_');

        const predictionsData = generateDummyPredictionData(userId, matchId);

        if (predictionsData.length > 0) {
          const firstPred = predictionsData[0];
          setGroupData({
            userId: userId,
            username: firstPred.username || 'Unknown User',
            userEmail: firstPred.userEmail || '',
            userCountry: firstPred.userCountry || '',
            userTotalPredictions: firstPred.userTotalPredictions || 0,
            userAccuracy: firstPred.userAccuracy || 0,
            matchId: matchId,
            matchName: firstPred.matchName || `${firstPred.homeTeam || 'TBD'} vs ${firstPred.awayTeam || 'TBD'}`,
            homeTeam: firstPred.homeTeam || 'TBD',
            awayTeam: firstPred.awayTeam || 'TBD',
            fixtureId: firstPred.fixtureId || matchId,
            matchStatus: firstPred.matchStatus || 'ongoing',
            actualResult: firstPred.actualResult || null,
          });
          setPredictions(predictionsData);
        }
      } catch (error) {
        console.error('Error loading prediction group:', error);
        const decodedId = decodeURIComponent(id);
        const [userId, matchId] = decodedId.split('_');
        const predictionsData = generateDummyPredictionData(userId, matchId);
        const firstPred = predictionsData[0];
        setGroupData({
          userId: userId,
          username: firstPred.username,
          userEmail: firstPred.userEmail,
          userCountry: firstPred.userCountry,
          userTotalPredictions: firstPred.userTotalPredictions,
          userAccuracy: firstPred.userAccuracy,
          matchId: matchId,
          matchName: firstPred.matchName,
          homeTeam: firstPred.homeTeam,
          awayTeam: firstPred.awayTeam,
          fixtureId: matchId,
          matchStatus: firstPred.matchStatus,
          actualResult: firstPred.actualResult,
        });
        setPredictions(predictionsData);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPredictionGroup();
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

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', pb: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(constants.routes.predictions)}
        sx={{
          mb: 3,
          color: colors.brandRed,
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: `${colors.brandRed}0D`,
          },
        }}
      >
        Back to Predictions
      </Button>

      {/* 1. Match Card */}
      <Card
        sx={{
          mb: 3,
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
          boxShadow: `0 6px 18px ${colors.brandRed}40`,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            {/* Match Info */}
            <Grid item xs={12} md={8}>
              <Chip
                label={`Fixture ID: ${groupData.fixtureId}`}
                sx={{
                  backgroundColor: colors.brandWhite,
                  color: colors.brandRed,
                  fontWeight: 700,
                  fontSize: 11,
                  height: 28,
                  borderRadius: '8px',
                  mb: 2,
                }}
              />
              <Typography variant="h3" sx={{ fontWeight: 700, color: colors.brandWhite, mb: 2, fontSize: { xs: 28, md: 36 } }}>
                {groupData.matchName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip
                  icon={<SportsSoccer sx={{ fontSize: 16 }} />}
                  label={`${predictions.length} Predictions Made`}
                  sx={{
                    backgroundColor: `${colors.brandWhite}20`,
                    color: colors.brandWhite,
                    fontWeight: 600,
                    border: `1px solid ${colors.brandWhite}40`,
                  }}
                />
                {groupData.actualResult && (
                  <Chip
                    label={`Final Score: ${groupData.actualResult}`}
                    sx={{
                      backgroundColor: colors.brandWhite,
                      color: colors.brandRed,
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>
            </Grid>
            {/* Match Status */}
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Chip
                label={groupData.matchStatus?.toUpperCase() || 'ONGOING'}
                sx={{
                  backgroundColor: groupData.matchStatus === 'completed' ? colors.success : colors.warning,
                  color: colors.brandWhite,
                  fontWeight: 700,
                  fontSize: 13,
                  height: 32,
                  px: 2,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 2. User Basic Profile */}
      <Card sx={{ mb: 3, borderRadius: '16px' }}>
        <CardContent sx={{ p: 3 }}>
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
                boxShadow: `0 4px 12px ${colors.brandRed}40`,
              }}
            >
              <Person sx={{ fontSize: 32, color: colors.brandWhite }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack }}>
                {groupData.username}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                {groupData.userEmail}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={groupData.userCountry}
                  size="small"
                  sx={{ bgcolor: `${colors.info}20`, color: colors.info, fontWeight: 600 }}
                />
                <Chip
                  label={`${groupData.userTotalPredictions} Total Predictions`}
                  size="small"
                  sx={{ bgcolor: `${colors.brandRed}20`, color: colors.brandRed, fontWeight: 600 }}
                />
                <Chip
                  label={`${groupData.userAccuracy}% Accuracy`}
                  size="small"
                  sx={{ bgcolor: `${colors.success}20`, color: colors.success, fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 3. Each Match Details for Each Prediction */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: colors.brandBlack }}>
        Prediction Breakdown
      </Typography>

      {predictions.map((pred, index) => (
        <Card key={pred.id} sx={{ mb: 2, borderRadius: '16px', border: `2px solid ${colors.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack }}>
                Prediction #{index + 1}
              </Typography>
              {getTypeChip(pred.predictionType)}
            </Box>
            <Grid container spacing={2.5}>
              {/* Match */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${colors.divider}` }}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600 }}>Match</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandBlack, textAlign: 'right' }}>{pred.matchName}</Typography>
                </Box>
              </Grid>
              {/* Fixture ID */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${colors.divider}` }}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600 }}>Fixture ID</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandBlack }}>{pred.fixtureId}</Typography>
                </Box>
              </Grid>
              {/* Prediction Type */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${colors.divider}` }}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600 }}>Prediction Type</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandBlack }}>
                    {pred.predictionType.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Typography>
                </Box>
              </Grid>
              {/* Prediction */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${colors.divider}` }}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600 }}>Prediction</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandRed }}>{pred.prediction}</Typography>
                </Box>
              </Grid>
              {/* Prediction Time */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${colors.divider}` }}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600 }}>Prediction Time</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandBlack }}>
                    {format(pred.predictionTime, 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>
              </Grid>
              {/* Actual Result */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${colors.divider}` }}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600 }}>Actual Result</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandBlack }}>
                    {pred.actualResult || 'Pending'}
                  </Typography>
                </Box>
              </Grid>
              {/* SP Status */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${colors.divider}` }}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600 }}>SP Status</Typography>
                  <Chip
                    label={pred.spStatus === 'awarded' ? 'AWARDED' : pred.spStatus === 'not_awarded' ? 'NOT AWARDED' : 'PENDING'}
                    size="small"
                    color={pred.spStatus === 'awarded' ? 'success' : pred.spStatus === 'not_awarded' ? 'error' : 'default'}
                    sx={{ fontWeight: 700, height: 24 }}
                  />
                </Box>
              </Grid>
              {/* Correctness */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${colors.divider}` }}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600 }}>Correctness</Typography>
                  {pred.correctness === 'won' ? (
                    <Chip
                      icon={<CheckCircle sx={{ fontSize: 14 }} />}
                      label="WON"
                      size="small"
                      sx={{ bgcolor: colors.success, color: colors.brandWhite, fontWeight: 700, height: 24 }}
                    />
                  ) : pred.correctness === 'lost' ? (
                    <Chip
                      icon={<Cancel sx={{ fontSize: 14 }} />}
                      label="LOST"
                      size="small"
                      sx={{ bgcolor: colors.error, color: colors.brandWhite, fontWeight: 700, height: 24 }}
                    />
                  ) : (
                    <Chip label="PENDING" size="small" sx={{ bgcolor: colors.warning, color: colors.brandWhite, fontWeight: 700, height: 24 }} />
                  )}
                </Box>
              </Grid>
              {/* SP Value */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, bgcolor: `${colors.brandRed}10`, px: 2, borderRadius: '8px', mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star sx={{ fontSize: 20, color: colors.brandRed }} />
                    <Typography variant="body1" sx={{ color: colors.brandRed, fontWeight: 700 }}>SP Value</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandRed }}>
                    {pred.spAwarded || 0} SP
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {/* 4. Overall Match Total for SP */}
      <Card sx={{ mb: 3, borderRadius: '16px', background: `linear-gradient(135deg, ${colors.success}20 0%, ${colors.success}10 100%)`, border: `2px solid ${colors.success}` }}>
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
