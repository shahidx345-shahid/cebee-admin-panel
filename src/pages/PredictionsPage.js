import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  Select,
  MenuItem,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Menu,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  TrendingUp,
  Schedule,
  CheckCircle,
  Close,
  BarChart,
  Star,
  PlayArrow,
  ArrowUpward,
  ArrowDropDown,
  Person,
  Numbers,
  ArrowUpward as ArrowUp,
  ArrowDownward as ArrowDown,
  MoreVert,
  AccessTime,
  List as ListIcon,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';

const PredictionsPage = () => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ongoing');
  const [selectedSort, setSelectedSort] = useState('dateNewest');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortAnchor, setSortAnchor] = useState(null);
  const [paginationAnchor, setPaginationAnchor] = useState(null);

  const totalPredictions = predictions.length;
  const ongoingCount = predictions.filter((p) => (p.status || p.predictionStatus) === 'ongoing').length;
  const completedCount = predictions.filter((p) => 
    (p.status || p.predictionStatus) === 'correct' || (p.status || p.predictionStatus) === 'incorrect'
  ).length;
  const correctCount = predictions.filter((p) => (p.status || p.predictionStatus) === 'correct').length;
  const accuracyRate = totalPredictions > 0 ? ((correctCount / totalPredictions) * 100).toFixed(1) : '0.0';

  useEffect(() => {
    loadPredictions();
  }, []);

  useEffect(() => {
    filterAndSortPredictions();
  }, [predictions, searchQuery, selectedStatus, selectedSort]);

  const generateDummyPredictions = () => {
    const users = ['john_doe', 'jane_smith', 'mike_wilson', 'sarah_jones', 'david_brown'];
    const usernames = ['John Doe', 'Jane Smith', 'Mike Wilson', 'Sarah Jones', 'David Brown'];
    const emails = ['john@example.com', 'jane@example.com', 'mike@example.com', 'sarah@example.com', 'david@example.com'];
    const matches = [
      { homeTeam: 'Arsenal', awayTeam: 'Chelsea', fixtureId: 'FIX_001' },
      { homeTeam: 'Liverpool', awayTeam: 'Manchester United', fixtureId: 'FIX_002' },
      { homeTeam: 'Manchester City', awayTeam: 'Tottenham', fixtureId: 'FIX_003' },
      { homeTeam: 'Newcastle', awayTeam: 'Brighton', fixtureId: 'FIX_004' },
    ];
    const predictionTypes = ['correct_score', 'match_result', 'both_teams_score', 'goal_range'];
    const predictions = [];

    // Generate Ongoing predictions
    users.forEach((userId, userIdx) => {
      matches.forEach((match, matchIdx) => {
        const numPredictions = Math.floor(Math.random() * 3) + 1; // 1-3 predictions per user-match
        for (let i = 0; i < numPredictions; i++) {
          predictions.push({
            id: `PRED_${userId}_${match.fixtureId}_${i}`,
            userId: userId,
            username: usernames[userIdx],
            userEmail: emails[userIdx],
            fixtureId: match.fixtureId,
            matchId: match.fixtureId,
            matchName: `${match.homeTeam} vs ${match.awayTeam}`,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            predictionType: predictionTypes[Math.floor(Math.random() * predictionTypes.length)],
            prediction: match.homeTeam, // Simplified
            predictionTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
            status: 'ongoing',
            predictionStatus: 'ongoing',
          });
        }
      });
    });

    // Generate Completed predictions
    users.slice(0, 3).forEach((userId, userIdx) => {
      matches.slice(0, 2).forEach((match, matchIdx) => {
        const numPredictions = Math.floor(Math.random() * 2) + 1; // 1-2 predictions per user-match
        for (let i = 0; i < numPredictions; i++) {
          const isCorrect = Math.random() > 0.5;
          predictions.push({
            id: `PRED_COMP_${userId}_${match.fixtureId}_${i}`,
            userId: userId,
            username: usernames[userIdx],
            userEmail: emails[userIdx],
            fixtureId: match.fixtureId,
            matchId: match.fixtureId,
            matchName: `${match.homeTeam} vs ${match.awayTeam}`,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            predictionType: predictionTypes[Math.floor(Math.random() * predictionTypes.length)],
            prediction: match.homeTeam,
            predictionTime: new Date(Date.now() - (14 + Math.random() * 7) * 24 * 60 * 60 * 1000), // 14-21 days ago
            status: isCorrect ? 'correct' : 'incorrect',
            predictionStatus: isCorrect ? 'correct' : 'incorrect',
            actualResult: `${Math.floor(Math.random() * 3)} - ${Math.floor(Math.random() * 3)}`,
            spAwarded: isCorrect ? Math.floor(Math.random() * 100) + 10 : 0,
          });
        }
      });
    });

    return predictions;
  };

  const loadPredictions = async () => {
    try {
      setLoading(true);
      // Add dummy data for demonstration
      const dummyData = generateDummyPredictions();
      
      // Try to load from Firebase, but use dummy data if empty
      let predictionsData = [];
      try {
        const predictionsRef = collection(db, 'predictions');
        const q = query(predictionsRef, orderBy('predictionTime', 'desc'));
        const snapshot = await getDocs(q);
        predictionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.log('Using dummy data:', error);
      }
      
      // Use dummy data if no real data exists
      if (predictionsData.length === 0) {
        predictionsData = dummyData;
      }
      
      setPredictions(predictionsData);
      
      // Group predictions by user + match combination
      const grouped = groupPredictionsByUserMatch(predictionsData);
      setFilteredPredictions(grouped);
    } catch (error) {
      console.error('Error loading predictions:', error);
      // Fallback to dummy data
      const dummyData = generateDummyPredictions();
      setPredictions(dummyData);
      const grouped = groupPredictionsByUserMatch(dummyData);
      setFilteredPredictions(grouped);
    } finally {
      setLoading(false);
    }
  };

  // Group predictions by user + match combination
  const groupPredictionsByUserMatch = (predictions) => {
    const groupedMap = new Map();
    
    predictions.forEach((pred) => {
      const userId = pred.userId || pred.userEmail || 'unknown';
      const matchId = pred.fixtureId || pred.matchId || 'unknown';
      const key = `${userId}_${matchId}`;
      
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          id: key,
          userId: userId,
          username: pred.username || 'Unknown User',
          userEmail: pred.userEmail || '',
          matchId: matchId,
          matchName: pred.matchName || `${pred.homeTeam || 'TBD'} vs ${pred.awayTeam || 'TBD'}`,
          homeTeam: pred.homeTeam || 'TBD',
          awayTeam: pred.awayTeam || 'TBD',
          fixtureId: pred.fixtureId || pred.matchId,
          predictions: [],
          totalPredictions: 0,
          status: 'mixed', // Will be calculated based on individual predictions
        });
      }
      
      const group = groupedMap.get(key);
      group.predictions.push(pred);
      group.totalPredictions = group.predictions.length;
      
      // Determine overall status
      const statuses = group.predictions.map(p => p.status || p.predictionStatus || 'ongoing');
      if (statuses.every(s => s === 'ongoing')) {
        group.status = 'ongoing';
      } else if (statuses.every(s => s === 'correct')) {
        group.status = 'all_correct';
      } else if (statuses.every(s => s === 'incorrect')) {
        group.status = 'all_incorrect';
      } else {
        group.status = 'mixed';
      }
    });
    
    return Array.from(groupedMap.values());
  };

  const filterAndSortPredictions = () => {
    // Group predictions first
    const grouped = groupPredictionsByUserMatch(predictions);
    let filtered = [...grouped];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (group) =>
          group.username?.toLowerCase().includes(query) ||
          group.userEmail?.toLowerCase().includes(query) ||
          group.matchName?.toLowerCase().includes(query) ||
          group.homeTeam?.toLowerCase().includes(query) ||
          group.awayTeam?.toLowerCase().includes(query)
      );
    }

    if (selectedStatus === 'ongoing') {
      filtered = filtered.filter((group) => group.status === 'ongoing');
    } else if (selectedStatus === 'completed') {
      filtered = filtered.filter((group) => 
        group.status === 'all_correct' || group.status === 'all_incorrect' || group.status === 'mixed'
      );
    }

    switch (selectedSort) {
      case 'dateNewest':
        filtered.sort((a, b) => {
          const dateA = a.predictions[0]?.predictionTime?.toDate ? a.predictions[0].predictionTime.toDate() : new Date(a.predictions[0]?.predictionTime || 0);
          const dateB = b.predictions[0]?.predictionTime?.toDate ? b.predictions[0].predictionTime.toDate() : new Date(b.predictions[0]?.predictionTime || 0);
          return dateB - dateA;
        });
        break;
      case 'dateOldest':
        filtered.sort((a, b) => {
          const dateA = a.predictions[0]?.predictionTime?.toDate ? a.predictions[0].predictionTime.toDate() : new Date(a.predictions[0]?.predictionTime || 0);
          const dateB = b.predictions[0]?.predictionTime?.toDate ? b.predictions[0].predictionTime.toDate() : new Date(b.predictions[0]?.predictionTime || 0);
          return dateA - dateB;
        });
        break;
      case 'usernameAZ':
        filtered.sort((a, b) => (a.username || '').localeCompare(b.username || ''));
        break;
      case 'usernameZA':
        filtered.sort((a, b) => (b.username || '').localeCompare(a.username || ''));
        break;
      case 'spHighest':
        filtered.sort((a, b) => {
          const spA = a.predictions.reduce((sum, p) => sum + (p.spAwarded || 0), 0);
          const spB = b.predictions.reduce((sum, p) => sum + (p.spAwarded || 0), 0);
          return spB - spA;
        });
        break;
      case 'spLowest':
        filtered.sort((a, b) => {
          const spA = a.predictions.reduce((sum, p) => sum + (p.spAwarded || 0), 0);
          const spB = b.predictions.reduce((sum, p) => sum + (p.spAwarded || 0), 0);
          return spA - spB;
        });
        break;
      default:
        break;
    }

    setFilteredPredictions(filtered);
  };

  const getStatusChip = (status) => {
    const statusMap = {
      ongoing: 'ONGOING',
      correct: 'CORRECT',
      incorrect: 'INCORRECT',
      pending: 'PENDING',
    };
    const label = statusMap[status] || 'ONGOING';
    
    return (
      <Chip
        label={label}
        size="small"
        sx={{
          backgroundColor: colors.brandWhite,
          color: colors.brandRed,
          border: `1.5px solid ${colors.brandRed}`,
          fontWeight: 600,
          fontSize: 11,
          height: 28,
          borderRadius: '6px',
        }}
      />
    );
  };

  const getTypeChip = (type) => {
    const typeMap = {
      'correct_score': { label: 'Correct Score', icon: Numbers },
      'goal_range': { label: 'Goal Range', icon: 'arrows' },
      'match_result': { label: 'Match Result', icon: TrendingUp },
      'both_teams_score': { label: 'Both Teams Score', icon: CheckCircle },
    };
    
    const config = typeMap[type] || typeMap['correct_score'];
    const Icon = config.icon === 'arrows' ? null : config.icon;

    return (
      <Chip
        icon={Icon ? <Icon sx={{ fontSize: 14 }} /> : (
          <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 0.8 }}>
            <ArrowUp sx={{ fontSize: 10 }} />
            <ArrowDown sx={{ fontSize: 10 }} />
          </Box>
        )}
        label={config.label}
        size="small"
        sx={{
          backgroundColor: colors.brandWhite,
          color: colors.warning,
          border: `1.5px solid ${colors.warning}`,
          fontWeight: 600,
          fontSize: 11,
          height: 28,
          borderRadius: '6px',
          '& .MuiChip-icon': {
            color: colors.warning,
          },
        }}
      />
    );
  };

  const getGroupStatusChip = (status) => {
    const statusConfig = {
      ongoing: { label: 'Ongoing', color: colors.info },
      all_correct: { label: 'All Correct', color: colors.success },
      all_incorrect: { label: 'All Incorrect', color: colors.error },
      mixed: { label: 'Mixed', color: colors.warning },
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
          height: 28,
          borderRadius: '6px',
        }}
      />
    );
  };

  const columns = [
    {
      id: 'username',
      label: 'User',
      render: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person sx={{ fontSize: 18, color: colors.info }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
              {row.username || 'Unknown User'}
            </Typography>
            {row.userEmail && (
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 10 }}>
                {row.userEmail}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'match',
      label: 'Match',
      render: (_, row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
            {row.matchName || `${row.homeTeam || 'TBD'} vs ${row.awayTeam || 'TBD'}`}
          </Typography>
          {row.fixtureId && (
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 10 }}>
              ID: {String(row.fixtureId).substring(0, 8)}...
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'totalPredictions',
      label: 'Total Predictions',
      render: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Numbers sx={{ fontSize: 18, color: colors.brandRed }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandBlack }}>
            {row.totalPredictions || 0}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => getGroupStatusChip(row.status || 'ongoing'),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate(`/predictions/details/${encodeURIComponent(row.id)}`)}
          sx={{
            minWidth: 'auto',
            padding: '6px 12px',
            borderRadius: '8px',
            background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
          View Details
        </Button>
      ),
    },
  ];

  const paginatedPredictions = filteredPredictions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );


  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* View Only Notice */}
      <Alert
        severity="info"
        icon={<Visibility sx={{ fontSize: 20 }} />}
        sx={{
          mb: 3,
          borderRadius: '12px',
          backgroundColor: `${colors.info}26`,
          border: `1.5px solid ${colors.info}4D`,
          py: 1,
          '& .MuiAlert-icon': {
            color: colors.info,
          },
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, color: colors.info, fontSize: 14, mb: 0.5 }}>
          View Only Mode
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
          Predictions are immutable audit records. No edit or delete actions available.
        </Typography>
      </Alert>

      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: colors.brandBlack,
          fontSize: { xs: 24, md: 28 },
          mb: 3,
        }}
      >
        Predictions Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '20px',
              boxShadow: `0 6px 18px ${colors.brandRed}40`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box
                sx={{
                  padding: 1.25,
                  backgroundColor: `${colors.brandWhite}33`,
                  borderRadius: '12px',
                }}
              >
                <BarChart sx={{ fontSize: 24, color: colors.brandWhite }} />
              </Box>
              <Chip
                label="+12.5%"
                size="small"
                icon={<ArrowUpward sx={{ fontSize: 14 }} />}
                sx={{
                  backgroundColor: `${colors.brandRed}DD`,
                  color: colors.brandWhite,
                  height: 24,
                  fontSize: 11,
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: colors.brandWhite,
                  },
                }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandWhite, mb: 0.5 }}>
              {totalPredictions}
            </Typography>
            <Typography variant="body2" sx={{ color: `${colors.brandWhite}DD`, fontSize: 13 }}>
              Total Predictions
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: colors.brandWhite,
              border: `1.5px solid ${colors.info}26`,
              borderRadius: '20px',
              boxShadow: `0 6px 14px ${colors.info}1F`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box
                sx={{
                  padding: 1.25,
                  backgroundColor: `${colors.info}1F`,
                  borderRadius: '12px',
                }}
              >
                <Star sx={{ fontSize: 24, color: colors.info }} />
              </Box>
              <Chip
                label="+8.2%"
                size="small"
                icon={<ArrowUpward sx={{ fontSize: 14 }} />}
                sx={{
                  backgroundColor: `${colors.success}1A`,
                  color: colors.success,
                  height: 24,
                  fontSize: 11,
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: colors.success,
                  },
                }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {accuracyRate}%
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Accuracy Rate
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: colors.brandWhite,
              border: `1.5px solid ${colors.warning}26`,
              borderRadius: '20px',
              boxShadow: `0 6px 14px ${colors.warning}1F`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box
                sx={{
                  padding: 1.25,
                  backgroundColor: `${colors.warning}1F`,
                  borderRadius: '12px',
                }}
              >
                <PlayArrow sx={{ fontSize: 24, color: colors.warning }} />
              </Box>
              <Chip
                label="+15.3%"
                size="small"
                icon={<ArrowUpward sx={{ fontSize: 14 }} />}
                sx={{
                  backgroundColor: `${colors.success}1A`,
                  color: colors.success,
                  height: 24,
                  fontSize: 11,
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: colors.success,
                  },
                }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {ongoingCount}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Ongoing Predictions
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: colors.brandWhite,
              border: `1.5px solid ${colors.success}26`,
              borderRadius: '20px',
              boxShadow: `0 6px 14px ${colors.success}1F`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box
                sx={{
                  padding: 1.25,
                  backgroundColor: `${colors.success}1F`,
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle sx={{ fontSize: 24, color: colors.success }} />
              </Box>
              <Chip
                label="+5.1%"
                size="small"
                icon={<ArrowUpward sx={{ fontSize: 14 }} />}
                sx={{
                  backgroundColor: `${colors.success}1A`,
                  color: colors.success,
                  height: 24,
                  fontSize: 11,
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: colors.success,
                  },
                }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {completedCount}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Completed Predictions
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Status Toggle Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1.5 }}>
        <Button
          variant={selectedStatus === 'ongoing' ? 'contained' : 'outlined'}
          onClick={() => setSelectedStatus('ongoing')}
          startIcon={
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: selectedStatus === 'ongoing' ? colors.brandWhite : colors.brandRed,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlayArrow 
                sx={{ 
                  fontSize: 14, 
                  color: selectedStatus === 'ongoing' ? colors.brandRed : colors.brandWhite 
                }} 
              />
            </Box>
          }
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            backgroundColor: selectedStatus === 'ongoing' ? colors.brandRed : colors.brandWhite,
            color: selectedStatus === 'ongoing' ? colors.brandWhite : colors.textSecondary,
            border: `1.5px solid ${selectedStatus === 'ongoing' ? colors.brandRed : colors.divider}66`,
            '&:hover': {
              backgroundColor: selectedStatus === 'ongoing' ? colors.brandRed : `${colors.divider}0D`,
            },
          }}
        >
          Ongoing Predictions
        </Button>
        <Button
          variant={selectedStatus === 'completed' ? 'contained' : 'outlined'}
          onClick={() => setSelectedStatus('completed')}
          startIcon={
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: selectedStatus === 'completed' ? colors.brandWhite : colors.success,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle 
                sx={{ 
                  fontSize: 14, 
                  color: selectedStatus === 'completed' ? colors.success : colors.brandWhite 
                }} 
              />
            </Box>
          }
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            backgroundColor: selectedStatus === 'completed' ? colors.brandRed : colors.brandWhite,
            color: selectedStatus === 'completed' ? colors.brandWhite : colors.textSecondary,
            border: `1.5px solid ${selectedStatus === 'completed' ? colors.brandRed : colors.divider}66`,
            '&:hover': {
              backgroundColor: selectedStatus === 'completed' ? colors.brandRed : `${colors.divider}0D`,
            },
          }}
        >
          Completed Predictions
        </Button>
      </Box>

      {/* Search and Sort Bar */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by username, email, prediction ID, fixture ID, match name..."
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowDropDown sx={{ fontSize: 18, color: colors.brandRed }} />}
          endIcon={<ArrowDropDown sx={{ fontSize: 14, color: colors.brandRed }} />}
          onClick={(e) => setSortAnchor(e.currentTarget)}
          sx={{
            borderColor: `${colors.brandRed}33`,
            color: colors.brandBlack,
            backgroundColor: colors.brandWhite,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2.5,
            py: 1.5,
            minWidth: 180,
            '&:hover': {
              borderColor: colors.brandRed,
              backgroundColor: `${colors.brandRed}0A`,
            },
          }}
        >
          Date: {selectedSort === 'dateNewest' ? 'Newest First' : 'Oldest First'}
        </Button>
        <Menu
          anchorEl={sortAnchor}
          open={Boolean(sortAnchor)}
          onClose={() => setSortAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 200,
              boxShadow: `0 4px 12px ${colors.shadow}33`,
            },
          }}
        >
          <MenuItem onClick={() => { setSelectedSort('dateNewest'); setSortAnchor(null); }}>
            Date: Newest First
          </MenuItem>
          <MenuItem onClick={() => { setSelectedSort('dateOldest'); setSortAnchor(null); }}>
            Date: Oldest First
          </MenuItem>
        </Menu>
      </Box>

      {/* Predictions List Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              padding: 0.75,
              backgroundColor: colors.brandRed,
              borderRadius: '8px',
            }}
          >
            <BarChart sx={{ fontSize: 18, color: colors.brandWhite }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: colors.brandBlack,
              fontSize: 18,
            }}
          >
            Predictions List
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.textSecondary,
              fontSize: 13,
              ml: 1,
            }}
          >
            {filteredPredictions.length} predictions found
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ListIcon sx={{ fontSize: 16 }} />}
          endIcon={<ArrowDropDown sx={{ fontSize: 16 }} />}
          onClick={(e) => setPaginationAnchor(e.currentTarget)}
          sx={{
            borderColor: colors.brandRed,
            color: colors.brandBlack,
            backgroundColor: colors.brandWhite,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 0.75,
            fontSize: 13,
          }}
        >
          {rowsPerPage} / page
        </Button>
        <Menu
          anchorEl={paginationAnchor}
          open={Boolean(paginationAnchor)}
          onClose={() => setPaginationAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 150,
              boxShadow: `0 4px 12px ${colors.shadow}33`,
            },
          }}
        >
          <MenuItem onClick={() => { setRowsPerPage(10); setPage(0); setPaginationAnchor(null); }}>
            10 / page
          </MenuItem>
          <MenuItem onClick={() => { setRowsPerPage(25); setPage(0); setPaginationAnchor(null); }}>
            25 / page
          </MenuItem>
          <MenuItem onClick={() => { setRowsPerPage(50); setPage(0); setPaginationAnchor(null); }}>
            50 / page
          </MenuItem>
          <MenuItem onClick={() => { setRowsPerPage(100); setPage(0); setPaginationAnchor(null); }}>
            100 / page
          </MenuItem>
        </Menu>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedPredictions}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredPredictions.length}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onRowClick={(row) => navigate(`/predictions/details/${row.id}`)}
        emptyMessage="No predictions found"
      />
    </Box>
  );
};

export default PredictionsPage;
