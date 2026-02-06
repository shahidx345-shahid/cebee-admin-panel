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
  Event as EventIcon,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import { format } from 'date-fns';
import { getCmds, getCurrentCmd } from '../services/cmdsService';
import { getPredictions, getGroupedPredictions, formatPredictions, getPredictionStatistics } from '../services/predictionsService';

const PredictionsPage = () => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ongoing');
  const [selectedSort, setSelectedSort] = useState('dateNewest');
  const [selectedCmd, setSelectedCmd] = useState('current'); // 'current', 'all', or specific cmd ID
  const [cmds, setCmds] = useState([]);
  const [currentCmd, setCurrentCmd] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortAnchor, setSortAnchor] = useState(null);
  const [paginationAnchor, setPaginationAnchor] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [statistics, setStatistics] = useState({
    totalPredictions: 0,
    accuracyRate: 0,
    ongoingPredictions: 0,
    completedPredictions: 0,
  });

  // Use statistics from API, fallback to calculated if API fails
  const totalPredictions = statistics.totalPredictions || predictions.length;
  const ongoingCount = statistics.ongoingPredictions || predictions.filter((p) => {
    const status = p.status || p.predictionStatus;
    return status === 'ongoing' || status === 'pending';
  }).length;
  const completedCount = statistics.completedPredictions || predictions.filter((p) => {
    const status = p.status || p.predictionStatus;
    return status === 'correct' || status === 'incorrect' || status === 'partial';
  }).length;
  const accuracyRate = statistics.accuracyRate || (completedCount > 0 ? ((predictions.filter((p) => {
    const status = p.status || p.predictionStatus;
    return status === 'correct';
  }).length / completedCount) * 100).toFixed(1) : '0.0');

  useEffect(() => {
    loadPredictions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, selectedStatus, selectedSort, selectedCmd, searchQuery]);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page: page + 1, // Backend uses 1-based pagination
        limit: rowsPerPage,
        sort: selectedSort === 'dateNewest' ? 'newest' : selectedSort === 'dateOldest' ? 'oldest' : 'newest',
      };

      // Add filters
      if (searchQuery) params.search = searchQuery;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedCmd && selectedCmd !== 'all' && selectedCmd !== 'current') {
        params.cmd = selectedCmd;
      } else if (selectedCmd === 'current' && currentCmd) {
        params.cmd = currentCmd.name;
      }

      // Remove undefined params
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      // Load statistics from API (only once, not on every filter change)
      if (page === 0 && !searchQuery && selectedStatus === 'ongoing' && selectedCmd === 'current') {
        const statsResult = await getPredictionStatistics();
        if (statsResult.success && statsResult.data) {
          setStatistics({
            totalPredictions: statsResult.data.totalPredictions || 0,
            accuracyRate: statsResult.data.accuracyRate || 0,
            ongoingPredictions: statsResult.data.ongoingPredictions || 0,
            completedPredictions: statsResult.data.completedPredictions || 0,
          });
        }
      }
      
      // Load CMds from API (only once)
      if (cmds.length === 0) {
        const cmdsResult = await getCmds();
        
        if (cmdsResult.success && cmdsResult.data) {
          const formattedCmds = cmdsResult.data.map(cmd => ({
            id: cmd.id || cmd._id,
            name: cmd.name,
            status: cmd.status,
            fixtureCount: cmd.fixtureCount || 0,
          }));
          setCmds(formattedCmds);
          
          // Set current CMd
          const current = formattedCmds.find(cmd => cmd.status === 'current');
          if (current) {
            setCurrentCmd(current);
          } else {
            const currentCmdResult = await getCurrentCmd();
            if (currentCmdResult.success && currentCmdResult.data) {
              const currentCmd = {
                id: currentCmdResult.data.id || currentCmdResult.data._id,
                name: currentCmdResult.data.name,
                status: currentCmdResult.data.status,
                fixtureCount: currentCmdResult.data.fixtureCount || 0,
              };
              setCurrentCmd(currentCmd);
            }
          }
        }
      }
      
      // Load predictions from API with proper pagination
      const predictionsResult = await getPredictions(params);
      
      if (predictionsResult.success && predictionsResult.data) {
        const predictionsArray = predictionsResult.data.predictions || [];
        
        if (predictionsArray.length > 0) {
          const formattedPredictions = formatPredictions(predictionsArray);
          
          if (formattedPredictions.length > 0) {
            setPredictions(formattedPredictions);
            
            // Group predictions by user + match combination
            const grouped = groupPredictionsByUserMatch(formattedPredictions);
            setFilteredPredictions(grouped);
            
            // Update pagination from API response
            if (predictionsResult.data.pagination) {
              setPagination({
                page: (predictionsResult.data.pagination.page || 1) - 1, // Convert to 0-based
                limit: predictionsResult.data.pagination.limit || rowsPerPage,
                total: predictionsResult.data.pagination.total || 0,
                pages: predictionsResult.data.pagination.pages || 0,
              });
            }
          } else {
            setPredictions([]);
            setFilteredPredictions([]);
            setPagination(prev => ({ ...prev, total: 0, pages: 0 }));
          }
        } else {
          setPredictions([]);
          setFilteredPredictions([]);
          setPagination(prev => ({ ...prev, total: 0, pages: 0 }));
        }
      } else {
        setPredictions([]);
        setFilteredPredictions([]);
        setPagination(prev => ({ ...prev, total: 0, pages: 0 }));
      }
    } catch (error) {
      console.error('Error loading predictions:', error);
      setPredictions([]);
      setFilteredPredictions([]);
      setPagination(prev => ({ ...prev, total: 0, pages: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // Group predictions by user + match combination
  const groupPredictionsByUserMatch = (predictions) => {
    const groupedMap = new Map();

    predictions.forEach((pred) => {
      const hasUserInfo = pred.userId || pred.userEmail;
      const userId = pred.userId || pred.userEmail || 'unknown';
      const matchId = pred.fixtureId || pred.matchId || pred.id || 'unknown';
      const key = hasUserInfo ? `${userId}_${matchId}` : matchId;

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
          fixtureId: pred.fixtureId || pred.matchId || pred.id,
          predictions: [],
          totalPredictions: pred.totalPredictions || 0,
          status: pred.status || pred.predictionStatus || 'ongoing',
          cmdId: pred.cmdId,
          cmdName: pred.cmdName,
        });
      }

      const group = groupedMap.get(key);
      group.predictions.push(pred);
      
      if (!hasUserInfo && pred.totalPredictions) {
        group.totalPredictions = pred.totalPredictions;
      } else {
        group.totalPredictions = group.predictions.length;
      }

      const statuses = group.predictions.map(p => p.status || p.predictionStatus || 'ongoing');
      if (statuses.every(s => s === 'ongoing' || s === 'predictionOpen')) {
        group.status = 'ongoing';
      } else if (statuses.every(s => s === 'correct' || s === 'completed')) {
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
          group.awayTeam?.toLowerCase().includes(query) ||
          group.cmdName?.toLowerCase().includes(query)
      );
    }

    // CMd filter
    if (selectedCmd && selectedCmd !== 'all') {
      if (selectedCmd === 'current') {
        // Filter by current CMd
        if (currentCmd) {
          filtered = filtered.filter((group) => {
            const groupCmdId = group.cmdId || group.predictions?.[0]?.cmdId;
            return groupCmdId === currentCmd.id;
          });
        } else {
          filtered = [];
        }
      } else {
        // Filter by specific CMd ID
        filtered = filtered.filter((group) => {
          const groupCmdId = group.cmdId || group.predictions?.[0]?.cmdId;
          return groupCmdId === selectedCmd;
        });
      }
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

  useEffect(() => {
    filterAndSortPredictions();
  }, [predictions, searchQuery, selectedStatus, selectedSort, selectedCmd, currentCmd]);

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
      id: 'predictionId',
      label: 'Prediction ID',
      render: (_, row) => {
        // Show the first prediction ID, or the group ID if no predictions
        const predictionId = row.predictions && row.predictions.length > 0 
          ? row.predictions[0].id 
          : row.id;
        // Truncate to show only first 12 characters
        const shortId = predictionId ? String(predictionId).substring(0, 12) + (predictionId.length > 12 ? '...' : '') : 'N/A';
        return (
          <Chip
            label={shortId}
            size="small"
            sx={{
              backgroundColor: '#FFE5E5',
              color: colors.brandRed,
              fontWeight: 600,
              fontSize: 10,
              height: 24,
              borderRadius: '6px',
              maxWidth: '120px',
            }}
            title={predictionId || 'N/A'} // Show full ID on hover
          />
        );
      },
    },
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
              {row.matchName || `${row.homeTeam || 'TBD'} vs ${row.awayTeam || 'TBD'}`}
            </Typography>
            {row.cmdName && (
              <Chip
                label={row.cmdName}
                size="small"
                sx={{
                  backgroundColor: colors.info,
                  color: colors.brandWhite,
                  fontWeight: 600,
                  fontSize: 9,
                  height: 20,
                  borderRadius: '4px',
                }}
              />
            )}
          </Box>
          {row.fixtureId && (
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 10 }}>
              ID: {String(row.fixtureId).replace('FIX_', 'MATCH_').substring(0, 10)}...
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
      id: 'spWon',
      label: 'Total SP Won',
      render: (_, row) => {
        // Calculate total SP for the group
        const totalSP = row.predictions ? row.predictions.reduce((sum, p) => sum + (p.spAwarded || 0), 0) : 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Star sx={{ fontSize: 16, color: colors.warning }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandBlack }}>
              {totalSP}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_, row) => {
        // Get the first prediction ID from the group
        const firstPredictionId = row.predictions && row.predictions.length > 0 
          ? row.predictions[0].id 
          : row.id;
        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate(`/predictions/details/${encodeURIComponent(firstPredictionId)}`)}
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
        );
      },
    },
  ];

  // Use filteredPredictions directly (pagination is handled by backend)
  const paginatedPredictions = filteredPredictions;


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

      {/* CMd Filter */}
      <Card
        sx={{
          mb: 3,
          borderRadius: '16px',
          backgroundColor: colors.brandWhite,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          padding: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon sx={{ fontSize: 20, color: colors.brandRed }} />
            <Typography variant="body1" sx={{ fontWeight: 600, color: colors.brandBlack }}>
              Filter by CMd:
            </Typography>
          </Box>
          <Button
            variant={selectedCmd === 'current' ? 'contained' : 'outlined'}
            onClick={() => setSelectedCmd('current')}
            sx={{
              backgroundColor: selectedCmd === 'current' ? colors.brandRed : 'transparent',
              color: selectedCmd === 'current' ? colors.brandWhite : colors.brandBlack,
              borderColor: colors.brandRed,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: selectedCmd === 'current' ? colors.brandDarkRed : `${colors.brandRed}0A`,
              },
            }}
          >
            {currentCmd ? currentCmd.name : 'Current CMd'}
          </Button>
          {cmds
            .filter(cmd => cmd.status === 'completed')
            .map((cmd) => (
              <Button
                key={cmd.id}
                variant={selectedCmd === cmd.id ? 'contained' : 'outlined'}
                onClick={() => setSelectedCmd(cmd.id)}
                sx={{
                  backgroundColor: selectedCmd === cmd.id ? colors.textSecondary : 'transparent',
                  color: selectedCmd === cmd.id ? colors.brandWhite : colors.brandBlack,
                  borderColor: colors.textSecondary,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: selectedCmd === cmd.id ? colors.textSecondary : `${colors.textSecondary}0A`,
                  },
                }}
              >
                {cmd.name}
              </Button>
            ))}
          <Button
            variant={selectedCmd === 'all' ? 'contained' : 'outlined'}
            onClick={() => setSelectedCmd('all')}
            sx={{
              backgroundColor: selectedCmd === 'all' ? colors.info : 'transparent',
              color: selectedCmd === 'all' ? colors.brandWhite : colors.brandBlack,
              borderColor: colors.info,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: selectedCmd === 'all' ? colors.info : `${colors.info}0A`,
              },
            }}
          >
            All-time
          </Button>
        </Box>
      </Card>

      {/* Status Toggle Buttons - Tabs Container */}
      <Box
        sx={{
          mb: 3,
          width: '100%',
          backgroundColor: colors.brandWhite,
          borderRadius: '20px',
          padding: 0.5,
          boxShadow: `0 2px 8px ${colors.shadow}1A`,
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', gap: 0 }}>
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
              flex: 1,
              borderRadius: '16px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              backgroundColor: selectedStatus === 'ongoing' ? colors.brandRed : 'transparent',
              color: selectedStatus === 'ongoing' ? colors.brandWhite : colors.textSecondary,
              border: 'none',
              '&:first-of-type': {
                borderTopLeftRadius: '16px',
                borderBottomLeftRadius: '16px',
              },
              '&:hover': {
                backgroundColor: selectedStatus === 'ongoing' ? colors.brandRed : 'transparent',
                border: 'none',
                boxShadow: 'none',
              },
              '&:focus': {
                border: 'none',
                boxShadow: 'none',
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
              flex: 1,
              borderRadius: '16px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              backgroundColor: selectedStatus === 'completed' ? colors.success : 'transparent',
              color: selectedStatus === 'completed' ? colors.brandWhite : colors.textSecondary,
              border: 'none',
              '&:last-of-type': {
                borderTopRightRadius: '16px',
                borderBottomRightRadius: '16px',
              },
              '&:hover': {
                backgroundColor: selectedStatus === 'completed' ? colors.success : 'transparent',
                border: 'none',
                boxShadow: 'none',
              },
              '&:focus': {
                border: 'none',
                boxShadow: 'none',
              },
            }}
          >
            Completed Predictions
          </Button>
        </Box>
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
        totalCount={pagination.total || 0}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onRowClick={(row) => {
          const firstPredictionId = row.predictions && row.predictions.length > 0 
            ? row.predictions[0].id 
            : row.id;
          navigate(`/predictions/details/${encodeURIComponent(firstPredictionId)}`);
        }}
        emptyMessage="No predictions found"
      />
    </Box>
  );
};

export default PredictionsPage;
