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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  SportsSoccer,
  AccessTime,
  CheckCircle,
  Cancel,
  Star,
  Numbers,
  TrendingUp,
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
      }
    } catch (error) {
      console.error('Error loading prediction group:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeChip = (type) => {
    const typeMap = {
      'correct_score': { label: 'Correct Score', color: colors.warning },
      'goal_range': { label: 'Goal Range', color: colors.info },
      'match_result': { label: 'Match Result', color: colors.success },
      'both_teams_score': { label: 'Both Teams Score', color: colors.brandRed },
    };
    
    const config = typeMap[type] || typeMap['correct_score'];

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: `${config.color}1A`,
          color: config.color,
          fontWeight: 600,
          fontSize: 11,
        }}
      />
    );
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      ongoing: { label: 'Ongoing', color: colors.info },
      correct: { label: 'Won', color: colors.success },
      incorrect: { label: 'Lost', color: colors.error },
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
          fontSize: 11,
        }}
      />
    );
  };

  const getSPStatusChip = (status, spAwarded) => {
    if (status === 'ongoing') {
      return (
        <Chip
          icon={<AccessTime sx={{ fontSize: 14 }} />}
          label="Pending"
          size="small"
          sx={{
            backgroundColor: `${colors.warning}1A`,
            color: colors.warning,
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      );
    }

    return (
      <Chip
        icon={<Star sx={{ fontSize: 14 }} />}
        label={`${spAwarded || 0} SP Awarded`}
        size="small"
        sx={{
          backgroundColor: `${colors.success}1A`,
          color: colors.success,
          fontWeight: 600,
          fontSize: 11,
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
          Prediction group not found
        </Typography>
      </Box>
    );
  }

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
            backgroundColor: `${colors.brandRed}0A`,
          },
        }}
      >
        Back to Predictions
      </Button>

      {/* User & Match Info Card */}
      <Card
        sx={{
          padding: 3,
          mb: 3,
          borderRadius: '20px',
          background: colors.brandWhite,
          border: `1.5px solid ${colors.divider}26`,
          boxShadow: `0 6px 14px ${colors.shadow}1F`,
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  padding: 2,
                  background: `linear-gradient(135deg, ${colors.info} 0%, ${colors.info}80 100%)`,
                  borderRadius: '16px',
                  boxShadow: `0 4px 12px ${colors.info}40`,
                }}
              >
                <Person sx={{ fontSize: 36, color: colors.brandWhite }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {groupData.username}
                </Typography>
                {groupData.userEmail && (
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {groupData.userEmail}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {groupData.matchName}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Match ID: {String(groupData.fixtureId).substring(0, 8)}...
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Numbers sx={{ fontSize: 20, color: colors.brandRed }} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Total Predictions: <strong>{predictions.length}</strong>
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Predictions Table */}
      <Card
        sx={{
          padding: 3,
          borderRadius: '20px',
          background: colors.brandWhite,
          border: `1.5px solid ${colors.divider}26`,
          boxShadow: `0 6px 14px ${colors.shadow}1F`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          All Predictions
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Prediction Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Prediction</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Prediction Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actual Result</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>SP Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Correctness</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {predictions.map((pred) => (
                <TableRow key={pred.id}>
                  <TableCell>{getTypeChip(pred.predictionType || pred.type || 'correct_score')}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {pred.prediction || pred.selectedTeam || pred.predictionText || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {pred.predictionTime ? (
                      <Typography variant="body2">
                        {format(
                          pred.predictionTime?.toDate ? pred.predictionTime.toDate() : new Date(pred.predictionTime),
                          'MMM dd, yyyy HH:mm'
                        )}
                      </Typography>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {pred.actualResult ? (
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {pred.actualResult}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>
                        Not available
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {getSPStatusChip(pred.status || pred.predictionStatus || 'ongoing', pred.spAwarded || 0)}
                  </TableCell>
                  <TableCell>
                    {getStatusChip(pred.status || pred.predictionStatus || 'ongoing')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default PredictionDetailsPage;
