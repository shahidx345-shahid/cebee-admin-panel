import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Alert,
  List,
  ListItem,
  ListItemText,
  Menu,
  IconButton,
} from '@mui/material';
import {
  Add,
  SportsSoccer,
  Visibility,
  Edit,
  CheckCircle,
  AccessTime,
  ArrowUpward,
  ArrowDownward,
  CalendarToday,
  Stadium,
  MoreVert,
  PlayArrow,
  Check,
  Sort,
  TrendingUp,
  TrendingDown,
  ListAlt,
  Info,
  Person,
  KeyboardArrowRight,
  Event as EventIcon,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
// Firebase imports removed
import { db } from '../config/firebase';
import { format } from 'date-fns';
import { getCmds, getCurrentCmd } from '../services/cmdsService';
import { getFixtures } from '../services/fixturesService';

const FixturesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [fixtures, setFixtures] = useState([]);
  const [filteredFixtures, setFilteredFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('scheduled');
  const [selectedSort, setSelectedSort] = useState('dateNewest');
  const [selectedCmd, setSelectedCmd] = useState('current'); // 'current', 'all', or specific cmd ID
  const [cmds, setCmds] = useState([]);
  const [currentCmd, setCurrentCmd] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [resultsForm, setResultsForm] = useState({
    homeScore: '',
    awayScore: '',
    firstGoalScorer: '',
    firstGoalMinute: '',
    markAsCompleted: false,
  });
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [menuFixture, setMenuFixture] = useState(null);

  const getSampleFixtures = () => {
    return [
      {
        id: 'MATCH_001',
        matchId: 'MATCH_123',
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea',
        league: 'Premier League',
        kickoffTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: 'scheduled',
        predictions: 1543,
        hot: true,
        cmdId: 'cmd_001',
        cmdName: 'CMd-05',
      },
      {
        id: 'MATCH_002',
        matchId: 'MATCH_124',
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        league: 'La Liga',
        kickoffTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'scheduled',
        predictions: 2891,
        hot: true,
        cmdId: 'cmd_001',
        cmdName: 'CMd-05',
      },
      {
        id: 'MATCH_003',
        matchId: 'MATCH_125',
        homeTeam: 'Manchester City',
        awayTeam: 'Liverpool',
        league: 'Premier League',
        kickoffTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        status: 'scheduled',
        predictions: 1876,
        hot: false,
        cmdId: 'cmd_001',
        cmdName: 'CMd-05',
      },
      {
        id: 'MATCH_004',
        matchId: 'MATCH_126',
        homeTeam: 'Bayern Munich',
        awayTeam: 'Dortmund',
        league: 'Bundesliga',
        kickoffTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'resultsProcessing',
        predictions: 1245,
        hot: false,
        cmdId: 'cmd_002',
        cmdName: 'CMd-04',
      },
    ];
  };

  const loadFixtures = async () => {
    setLoading(true);
    try {
      // Load CMds from API first (needed for filtering and displaying cmd names)
      let formattedCmds = [];
      let currentCmdData = null;
      
      const cmdsResult = await getCmds();
      if (cmdsResult.success && cmdsResult.data) {
        formattedCmds = cmdsResult.data.map(cmd => ({
          id: cmd.id || cmd._id,
          name: cmd.name,
          status: cmd.status,
          fixtureCount: cmd.fixtureCount || 0,
        }));
        setCmds(formattedCmds);
        
        // Set current CMd
        const current = formattedCmds.find(cmd => cmd.status === 'current');
        if (current) {
          currentCmdData = current;
          setCurrentCmd(current);
        } else {
          // Try to get current CMd if not found in list
          const currentCmdResult = await getCurrentCmd();
          if (currentCmdResult.success && currentCmdResult.data) {
            currentCmdData = {
              id: currentCmdResult.data.id || currentCmdResult.data._id,
              name: currentCmdResult.data.name,
              status: currentCmdResult.data.status,
              fixtureCount: currentCmdResult.data.fixtureCount || 0,
            };
            setCurrentCmd(currentCmdData);
          }
        }
      }
      
      // Fetch fixtures from API
      const queryParams = {
        limit: 1000, // Get enough fixtures
      };
      
      // Add CMd filter - use currentCmdData from this function scope
      const currentCmdForFilter = currentCmdData || (formattedCmds.find(cmd => cmd.status === 'current'));
      if (selectedCmd === 'current' && currentCmdForFilter) {
        queryParams.cmdId = currentCmdForFilter.id;
      } else if (selectedCmd && selectedCmd !== 'all' && selectedCmd !== 'current') {
        queryParams.cmdId = selectedCmd;
      }
      
      // Add status filter
      if (selectedStatus && selectedStatus !== 'all') {
        queryParams.status = selectedStatus;
      }
      
      const fixturesResult = await getFixtures(queryParams);
      
      if (fixturesResult.success && fixturesResult.data) {
        // Format fixtures to match expected structure
        // Backend returns { fixtures: [...], pagination: {...} } or just array
        const fixturesArray = fixturesResult.data.fixtures || fixturesResult.data || [];
        const formattedFixtures = fixturesArray.map(fixture => {
          // Handle populated cmdId (could be object with _id and name)
          let cmdId = '';
          let cmdName = '';
          if (fixture.cmdId) {
            if (typeof fixture.cmdId === 'object' && fixture.cmdId._id) {
              cmdId = fixture.cmdId._id.toString();
              cmdName = fixture.cmdId.name || '';
            } else {
              cmdId = fixture.cmdId.toString();
              // Find CMd name from formattedCmds array
              const cmd = formattedCmds.find(c => (c.id || c._id)?.toString() === cmdId);
              cmdName = cmd ? cmd.name : '';
            }
          }
          
          // Handle populated leagueId (could be object)
          let league = '';
          if (fixture.leagueId) {
            if (typeof fixture.leagueId === 'object' && fixture.leagueId.league_name) {
              league = fixture.leagueId.league_name;
            } else {
              league = fixture.league || fixture.leagueName || fixture.league_name || '';
            }
          } else {
            league = fixture.league || fixture.leagueName || fixture.league_name || '';
          }
          
          return {
            id: fixture._id || fixture.id,
            matchId: fixture.matchId || fixture.match_id || fixture._id || fixture.id,
            homeTeam: fixture.homeTeam || fixture.home_team || '',
            awayTeam: fixture.awayTeam || fixture.away_team || '',
            league: league,
            kickoffTime: fixture.kickoffTime ? new Date(fixture.kickoffTime) : fixture.kickoff_time ? new Date(fixture.kickoff_time) : new Date(),
            status: fixture.status || fixture.matchStatus || 'scheduled',
            matchStatus: fixture.matchStatus || fixture.status || 'scheduled',
            predictions: fixture.predictionCount || fixture.prediction_count || 0,
            hot: fixture.isFeatured || fixture.isCeBeFeatured || fixture.isCeBeFeatured || false,
            cmdId: cmdId,
            cmdName: cmdName,
            venue: fixture.venue || '',
            homeScore: fixture.homeScore || fixture.home_score || null,
            awayScore: fixture.awayScore || fixture.away_score || null,
          };
        });
        
        setFixtures(formattedFixtures);
        setFilteredFixtures(formattedFixtures);
      } else {
        // Fallback to empty array if API fails
        console.error('Failed to load fixtures:', fixturesResult.error);
        setFixtures([]);
        setFilteredFixtures([]);
      }
    } catch (error) {
      console.error('Error loading fixtures:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFixtures();
  }, [selectedCmd, selectedStatus]); // Reload when filters change

  // Reload fixtures when navigating back from form page
  useEffect(() => {
    if (location.state?.refresh) {
      loadFixtures();
      // Clear the refresh flag
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const filterAndSortFixtures = () => {
      let filtered = [...fixtures];

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (fixture) =>
            fixture.homeTeam?.toLowerCase().includes(query) ||
            fixture.awayTeam?.toLowerCase().includes(query) ||
            fixture.matchId?.toLowerCase().includes(query) ||
            fixture.id?.toLowerCase().includes(query) ||
            fixture.league?.toLowerCase().includes(query) ||
            fixture.cmdName?.toLowerCase().includes(query)
        );
      }

      // CMd filter
      if (selectedCmd && selectedCmd !== 'all') {
        if (selectedCmd === 'current') {
          // Filter by current CMd
          if (currentCmd) {
            filtered = filtered.filter((fixture) => fixture.cmdId === currentCmd.id);
          } else {
            filtered = [];
          }
        } else {
          // Filter by specific CMd ID
          filtered = filtered.filter((fixture) => fixture.cmdId === selectedCmd);
        }
      }

      // Status filter - map match flow states to backend statuses
      if (selectedStatus && selectedStatus !== 'all') {
        filtered = filtered.filter((fixture) => {
          const status = fixture.matchStatus || fixture.status;
          // Map filter values to backend statuses
          if (selectedStatus === 'scheduled') {
            return status === 'scheduled' || status === 'draft';
          }
          if (selectedStatus === 'published') {
            return status === 'published' || status === 'predictionOpen';
          }
          if (selectedStatus === 'predictionLocked') {
            return status === 'predictionLocked' || status === 'locked';
          }
          if (selectedStatus === 'resultsProcessing') {
            // Result Pending includes both resultsProcessing and pending statuses
            return status === 'resultsProcessing' || status === 'pending' || status === 'fullTimeProcessing';
          }
          return status === selectedStatus;
        });
      }

      // Sort
      switch (selectedSort) {
        case 'dateNewest':
          filtered.sort((a, b) => {
            const dateA = a.kickoffTime?.toDate ? a.kickoffTime.toDate() : new Date(a.kickoffTime);
            const dateB = b.kickoffTime?.toDate ? b.kickoffTime.toDate() : new Date(b.kickoffTime);
            return dateB - dateA;
          });
          break;
        case 'dateOldest':
          filtered.sort((a, b) => {
            const dateA = a.kickoffTime?.toDate ? a.kickoffTime.toDate() : new Date(a.kickoffTime);
            const dateB = b.kickoffTime?.toDate ? b.createdAt.toDate() : new Date(b.kickoffTime);
            return dateA - dateB;
          });
          break;
        case 'teamAZ':
          filtered.sort((a, b) => {
            const teamA = `${a.homeTeam || ''} vs ${a.awayTeam || ''}`.toLowerCase();
            const teamB = `${b.homeTeam || ''} vs ${b.awayTeam || ''}`.toLowerCase();
            return teamA.localeCompare(teamB);
          });
          break;
        case 'teamZA':
          filtered.sort((a, b) => {
            const teamA = `${a.homeTeam || ''} vs ${a.awayTeam || ''}`.toLowerCase();
            const teamB = `${b.homeTeam || ''} vs ${b.awayTeam || ''}`.toLowerCase();
            return teamB.localeCompare(teamA);
          });
          break;
        case 'predictionsHigh':
          filtered.sort((a, b) => (b.predictions || 0) - (a.predictions || 0));
          break;
        case 'predictionsLow':
          filtered.sort((a, b) => (a.predictions || 0) - (b.predictions || 0));
          break;
        default:
          break;
      }

      setFilteredFixtures(filtered);
    };
    filterAndSortFixtures();
  }, [fixtures, searchQuery, selectedStatus, selectedSort, selectedCmd, currentCmd]);

  const handleCloseResultsModal = () => {
    setResultsModalOpen(false);
    setSelectedFixture(null);
    setResultsForm({
      homeScore: '',
      awayScore: '',
      firstGoalScorer: '',
      firstGoalMinute: '',
      markAsCompleted: false,
    });
  };

  const handleUpdateResults = async () => {
    if (!selectedFixture) return;

    // Validate form
    if (!resultsForm.homeScore || !resultsForm.awayScore) {
      alert('Please enter both home and away scores');
      return;
    }

    if (resultsForm.markAsCompleted && (!resultsForm.firstGoalScorer || !resultsForm.firstGoalMinute)) {
      alert('Please fill all fields to mark as completed');
      return;
    }

    try {
      // Here you would update the fixture in Firebase
      // await updateDoc(doc(db, 'fixtures', selectedFixture.id), { ... });

      console.log('Updating results:', resultsForm);
      handleCloseResultsModal();
      // Reload fixtures
      loadFixtures();
    } catch (error) {
      console.error('Error updating results:', error);
      alert('Failed to update results');
    }
  };

  const isFormValid = resultsForm.homeScore && resultsForm.awayScore &&
    resultsForm.firstGoalScorer && resultsForm.firstGoalMinute;



  const getStatusChip = (status) => {
    // Map backend statuses to match flow states
    const statusMap = {
      scheduled: 'predictionOpen',
      published: 'predictionOpen',
      predictionOpen: 'predictionOpen',
      predictionLocked: 'predictionLocked',
      locked: 'predictionLocked',
      live: 'live',
      completed: 'completed',
      resultsProcessing: 'resultsProcessing',
      fullTimeProcessing: 'resultsProcessing',
      fullTimeCompleted: 'completed',
    };

    const mappedStatus = statusMap[status] || 'predictionOpen';

    const statusConfig = {
      predictionOpen: {
        label: 'PREDICTION OPEN',
        backgroundColor: '#E3F2FD',
        color: '#1976D2',
        textColor: '#1976D2'
      },
      predictionLocked: {
        label: 'PREDICTION LOCKED',
        backgroundColor: '#FFF3E0',
        color: '#E65100',
        textColor: '#E65100'
      },
      live: {
        label: 'LIVE',
        backgroundColor: colors.brandRed,
        color: colors.brandWhite,
        textColor: colors.brandWhite
      },
      completed: {
        label: 'COMPLETED',
        backgroundColor: '#E8F5E9',
        color: '#2E7D32',
        textColor: '#2E7D32'
      },
      resultsProcessing: {
        label: 'RESULT PENDING',
        backgroundColor: colors.warning,
        color: colors.brandWhite,
        textColor: colors.brandWhite
      },
    };

    const config = statusConfig[mappedStatus] || statusConfig.predictionOpen;

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          fontWeight: 700,
          fontSize: 11,
          height: 28,
          borderRadius: '20px',
          border: 'none',
        }}
      />
    );
  };

  // Dashboard-style StatCard component
  const StatCard = ({ title, value, subtitle, icon: Icon, color, isPrimary = false, delay = 0 }) => {
    return (
      <Card
        sx={{
          padding: { xs: 2, md: 2.5 },
          borderRadius: '20px',
          background: isPrimary
            ? `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`
            : colors.brandWhite,
          border: isPrimary
            ? 'none'
            : `1.5px solid ${color}26`,
          boxShadow: isPrimary
            ? `0 6px 18px ${colors.brandRed}40`
            : `0 6px 14px ${color}1F`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          animation: `fadeInUp 0.6s ease-out ${delay}ms both`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: isPrimary
              ? `0 8px 24px ${colors.brandRed}50`
              : `0 8px 20px ${color}2F`,
          },
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
              label={subtitle}
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
              background: isPrimary
                ? `${colors.brandWhite}33`
                : `${color}1F`,
              borderRadius: '14px',
              boxShadow: isPrimary
                ? '0 3px 8px rgba(0, 0, 0, 0.12)'
                : 'none',
              mb: 2,
            }}
          >
            <Icon
              sx={{
                fontSize: { xs: 24, md: 28 },
                color: isPrimary ? colors.brandWhite : color,
              }}
            />
          </Box>

          {/* Large Count Number */}
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: isPrimary ? colors.brandWhite : colors.brandBlack,
                letterSpacing: -0.8,
                fontSize: { xs: 24, md: 30 },
                mb: 0.75,
              }}
            >
              {value}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: isPrimary ? `${colors.brandWhite}F0` : colors.brandBlack,
                fontSize: { xs: 13, md: 14 },
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const columns = [
    {
      id: 'matchId',
      label: 'Match ID',
      render: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={row.id?.substring(0, 10) || row.matchId || 'N/A'}
            sx={{
              backgroundColor: '#FFE5E5',
              color: colors.brandRed,
              fontWeight: 600,
              fontSize: 11,
              height: 28,
              borderRadius: '8px',
              border: 'none',
            }}
          />
          {row.cmdName && (
            <Chip
              label={row.cmdName}
              size="small"
              sx={{
                backgroundColor: colors.info,
                color: colors.brandWhite,
                fontWeight: 600,
                fontSize: 10,
                height: 22,
                borderRadius: '6px',
              }}
            />
          )}
        </Box>
      ),
    },
    {
      id: 'teams',
      label: 'Teams',
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.homeTeam || 'TBD'} vs {row.awayTeam || 'TBD'}
        </Typography>
      ),
    },
    {
      id: 'league',
      label: 'League',
      render: (_, row) => (
        <Chip
          label={row.league || 'N/A'}
          sx={{
            backgroundColor: '#FFE5E5',
            color: colors.brandRed,
            fontWeight: 600,
            fontSize: 11,
            height: 28,
            borderRadius: '8px',
            border: 'none',
          }}
        />
      ),
    },
    {
      id: 'kickoffTime',
      label: 'Kickoff Time',
      render: (value, row) => {
        if (!row.kickoffTime) return '-';
        const date = row.kickoffTime?.toDate ? row.kickoffTime.toDate() : new Date(row.kickoffTime);
        return (
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
            {format(date, 'MMM dd, yyyy HH:mm')}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => {
        const status = row.matchStatus || row.status;
        const isResultPending = status === 'resultsProcessing' || status === 'pending';

        if (isResultPending) {
          return (
            <Chip
              label="RESULT PENDING"
              sx={{
                backgroundColor: colors.warning,
                color: colors.brandWhite,
                fontWeight: 700,
                fontSize: 11,
                height: 28,
                borderRadius: '8px',
                border: 'none',
                textTransform: 'uppercase',
              }}
            />
          );
        }
        return getStatusChip(status);
      },
    },
    {
      id: 'score',
      label: 'Score',
      render: (_, row) => {
        if (row.homeScore !== undefined && row.awayScore !== undefined) {
          return (
            <Chip
              label={`${row.homeScore}-${row.awayScore}`}
              sx={{
                backgroundColor: colors.brandWhite,
                color: colors.brandRed,
                fontWeight: 600,
                fontSize: 11,
                height: 28,
                borderRadius: '8px',
                border: `1px solid ${colors.brandRed}`,
              }}
            />
          );
        }
        return '-';
      },
    },
    {
      id: 'action',
      label: 'Action',
      render: (_, row) => {
        const status = row.matchStatus || row.status;
        const isResultPending = status === 'resultsProcessing' || status === 'pending';
        const isScheduled = status === 'scheduled' || status === 'draft';

        return (
          <Box>
            {isScheduled ? (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setActionMenuAnchor(e.currentTarget);
                  setMenuFixture(row);
                }}
                sx={{
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  padding: 0,
                  backgroundColor: colors.brandRed,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: colors.brandDarkRed,
                  },
                }}
              >
                <MoreVert sx={{ fontSize: 20, color: colors.brandWhite }} />
              </IconButton>
            ) : (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isResultPending) {
                    setSelectedFixture(row);
                    setResultsForm({
                      homeScore: row.homeScore || '',
                      awayScore: row.awayScore || '',
                      firstGoalScorer: row.firstGoalScorer || '',
                      firstGoalMinute: row.firstGoalMinute || '',
                      markAsCompleted: false,
                    });
                    setResultsModalOpen(true);
                  } else {
                    navigate(`/fixtures/details/${row.id}`);
                  }
                }}
                sx={{
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  padding: 0,
                  backgroundColor: colors.brandRed,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: colors.brandDarkRed,
                  },
                }}
              >
                <Stadium sx={{ fontSize: 20, color: colors.brandWhite }} />
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  const paginatedFixtures = filteredFixtures.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const statusFilters = [
    { value: 'scheduled', label: 'Scheduled', icon: AccessTime, color: '#9E9E9E' },
    { value: 'published', label: 'Published', icon: Visibility, color: '#1976d2' },
    { value: 'live', label: 'Live', icon: PlayArrow, color: colors.brandRed },
    { value: 'resultsProcessing', label: 'Result Pending', icon: Edit, color: '#FF9800' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: colors.success },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: colors.brandBlack,
            fontSize: { xs: 24, md: 28 },
          }}
        >
          Fixture Management
        </Typography>
      </Box>

      {/* Stats Cards - Dashboard Style */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Top Row - 4 Cards */}
        <Grid item xs={6} md={3}>
          <StatCard
            title="Scheduled"
            value={fixtures.filter((f) => {
              const status = f.matchStatus || f.status;
              return status === 'scheduled' || status === 'draft';
            }).length.toString()}
            subtitle="Draft"
            icon={AccessTime}
            color="#9E9E9E"
            isPrimary={false}
            delay={0}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Published"
            value={fixtures.filter((f) => {
              const status = f.matchStatus || f.status;
              return status === 'published' || status === 'predictionOpen';
            }).length.toString()}
            subtitle="Predictions Open"
            icon={Visibility}
            color="#1976d2"
            isPrimary={false}
            delay={100}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Live Matches"
            value={fixtures.filter((f) => (f.matchStatus || f.status) === 'live').length.toString()}
            subtitle="Now"
            icon={PlayArrow}
            color={colors.brandRed}
            isPrimary={true}
            delay={200}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Result Pending"
            value={fixtures.filter((f) => (f.matchStatus || f.status) === 'resultsProcessing' || (f.matchStatus || f.status) === 'pending').length.toString()}
            subtitle="Action Required"
            icon={Edit}
            color="#FF9800"
            isPrimary={false}
            delay={300}
          />
        </Grid>
        {/* Bottom Row - 1 Card on Left */}
        <Grid item xs={6} md={3}>
          <StatCard
            title="Completed"
            value={fixtures.filter((f) => (f.matchStatus || f.status) === 'completed').length.toString()}
            subtitle="SP Distributed"
            icon={CheckCircle}
            color={colors.success}
            isPrimary={false}
            delay={400}
          />
        </Grid>
      </Grid>

      {/* Status Filter Buttons - Connected Style */}
      <Card
        sx={{
          mb: 3,
          borderRadius: { xs: '16px', md: '20px' },
          backgroundColor: colors.brandWhite,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: { xs: 'auto', md: 'hidden' },
          padding: 0,
          maxWidth: '100%',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          width: { xs: 'max-content', md: '100%' },
          minWidth: { xs: 'max-content', md: '100%' },
          gap: 0,
        }}>
          {statusFilters.map((filter, index) => {
            const isSelected = selectedStatus === filter.value;
            const Icon = filter.icon;

            return (
              <Button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                sx={{
                  flex: { xs: '0 0 auto', md: 1 },
                  minWidth: { xs: 110, sm: 130, md: 'auto' },
                  textTransform: 'none',
                  fontWeight: 600,
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: isSelected ? 2 : 1.75, md: isSelected ? 3 : 2.5 },
                  minHeight: { xs: 54, md: 64 },
                  borderRadius: 0,
                  backgroundColor: isSelected ? filter.color : 'transparent',
                  color: isSelected ? colors.brandWhite : colors.textSecondary,
                  border: 'none',
                  borderRight: index < statusFilters.length - 1 ? 'none' : 'none',
                  boxShadow: isSelected ? `0 2px 8px ${filter.color}40` : 'none',
                  position: 'relative',
                  margin: isSelected ? '4px' : '0',
                  whiteSpace: 'nowrap',
                  fontSize: { xs: 13, sm: 14, md: 15 },
                  '&:first-of-type': {
                    borderTopLeftRadius: { xs: '16px', md: '20px' },
                    borderBottomLeftRadius: { xs: '16px', md: '20px' },
                    marginLeft: isSelected ? '4px' : '0',
                  },
                  '&:last-of-type': {
                    borderTopRightRadius: { xs: '16px', md: '20px' },
                    borderBottomRightRadius: { xs: '16px', md: '20px' },
                    marginRight: isSelected ? '4px' : '0',
                  },
                  '&:hover': {
                    backgroundColor: isSelected ? filter.color : `${filter.color}0D`,
                    boxShadow: isSelected ? `0 2px 8px ${filter.color}40` : 'none',
                  },
                }}
              >
                <Icon
                  sx={{
                    fontSize: { xs: 18, md: 20 },
                    mr: { xs: 0.75, md: 1 },
                    color: isSelected ? colors.brandWhite : filter.color,
                    flexShrink: 0,
                  }}
                />
                <Box
                  component="span"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {filter.label}
                </Box>
              </Button>
            );
          })}
        </Box>
      </Card>

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

      {/* Search, Sort, and Add Fixture Row */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 1, md: 1.5 }, 
        mb: 3, 
        alignItems: 'stretch',
        maxWidth: '100%',
      }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: 1 }, minWidth: { xs: '100%', md: '300px' }, maxWidth: '100%' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by team name, match ID, or CMd..."
          />
        </Box>
        <FormControl sx={{ minWidth: { xs: '100%', md: 200 }, maxWidth: '100%', position: 'relative' }}>
          <Select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            displayEmpty
            sx={{
              borderRadius: '12px',
              backgroundColor: colors.brandWhite,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: `${colors.divider}66`,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.brandRed,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.brandRed,
                borderWidth: 2,
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '12px',
                  mt: 1,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: `${colors.brandRed}15`,
                      color: colors.brandRed,
                      '&:hover': {
                        backgroundColor: `${colors.brandRed}20`,
                      },
                    },
                  },
                },
              },
            }}
          >
            <MenuItem value="dateNewest">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {selectedSort === 'dateNewest' && <Check sx={{ fontSize: 18, color: colors.brandRed }} />}
                <ArrowDownward sx={{ fontSize: 16, color: selectedSort === 'dateNewest' ? colors.brandRed : colors.textSecondary }} />
                <Typography sx={{ flex: 1 }}>Date: Newest First</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="dateOldest">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {selectedSort === 'dateOldest' && <Check sx={{ fontSize: 18, color: colors.brandRed }} />}
                <ArrowUpward sx={{ fontSize: 16, color: selectedSort === 'dateOldest' ? colors.brandRed : colors.textSecondary }} />
                <Typography sx={{ flex: 1 }}>Date: Oldest First</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="teamAZ">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {selectedSort === 'teamAZ' && <Check sx={{ fontSize: 18, color: colors.brandRed }} />}
                <Sort sx={{ fontSize: 16, color: selectedSort === 'teamAZ' ? colors.brandRed : colors.textSecondary }} />
                <Typography sx={{ flex: 1 }}>Team Name: A-Z</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="teamZA">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {selectedSort === 'teamZA' && <Check sx={{ fontSize: 18, color: colors.brandRed }} />}
                <Sort sx={{ fontSize: 16, color: selectedSort === 'teamZA' ? colors.brandRed : colors.textSecondary, transform: 'rotate(180deg)' }} />
                <Typography sx={{ flex: 1 }}>Team Name: Z-A</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="predictionsHigh">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {selectedSort === 'predictionsHigh' && <Check sx={{ fontSize: 18, color: colors.brandRed }} />}
                <TrendingUp sx={{ fontSize: 16, color: selectedSort === 'predictionsHigh' ? colors.brandRed : colors.textSecondary }} />
                <Typography sx={{ flex: 1 }}>Predictions: Highest</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="predictionsLow">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {selectedSort === 'predictionsLow' && <Check sx={{ fontSize: 18, color: colors.brandRed }} />}
                <TrendingDown sx={{ fontSize: 16, color: selectedSort === 'predictionsLow' ? colors.brandRed : colors.textSecondary }} />
                <Typography sx={{ flex: 1 }}>Predictions: Lowest</Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/fixtures/add')}
          sx={{
            background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            whiteSpace: 'nowrap',
          }}
        >
          Add Fixture
        </Button>
      </Box>

      {/* Fixtures List Header */}
      <Card
        sx={{
          padding: 2.5,
          mb: 3,
          borderRadius: '16px',
          background: colors.brandWhite,
          border: `1.5px solid ${colors.divider}26`,
          boxShadow: `0 4px 12px ${colors.shadow}14`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              padding: 1.5,
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ListAlt sx={{ fontSize: 24, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Fixtures List
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {filteredFixtures.length} {filteredFixtures.length === 1 ? 'fixture' : 'fixtures'} found
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedFixtures}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredFixtures.length}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onRowClick={(row) => navigate(`/fixtures/details/${row.id}`)}
        emptyMessage="No fixtures found"
      />

      {/* Enter Match Results Modal */}
      <Dialog
        open={resultsModalOpen}
        onClose={handleCloseResultsModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            maxWidth: 500,
            width: '100%',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          },
        }}
      >
        <DialogTitle sx={{ padding: 3, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
            <Stadium sx={{ fontSize: 24, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack }}>
              Enter Match Results
            </Typography>
            {selectedFixture && (
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                {selectedFixture.id || 'N/A'}
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ padding: 3, pt: 2 }}>
          {/* Match Information */}
          {selectedFixture && (
            <Card
              sx={{
                background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
                borderRadius: '16px',
                boxShadow: `0 4px 12px ${colors.brandRed}4D`,
                mb: 3,
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <CalendarToday sx={{ fontSize: 20, color: colors.brandWhite }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandWhite }}>
                {selectedFixture.homeTeam || 'TBD'} vs {selectedFixture.awayTeam || 'TBD'}
              </Typography>
            </Card>
          )}

          {/* Prediction Requirements Info */}
          <Card
            sx={{
              backgroundColor: `${colors.info}0D`,
              border: `1.5px solid ${colors.info}26`,
              borderRadius: '16px',
              mb: 3,
              padding: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Info sx={{ fontSize: 18, color: colors.info }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.info }}>
                All 4 prediction outcomes require results:
              </Typography>
            </Box>
            <List dense sx={{ py: 0 }}>
              <ListItem sx={{ py: 0, px: 0 }}>
                <ListItemText primary={<Typography variant="caption" sx={{ color: colors.textSecondary }}>• Correct Scoreline</Typography>} />
              </ListItem>
              <ListItem sx={{ py: 0, px: 0 }}>
                <ListItemText primary={<Typography variant="caption" sx={{ color: colors.textSecondary }}>• Total Goal Range</Typography>} />
              </ListItem>
              <ListItem sx={{ py: 0, px: 0 }}>
                <ListItemText primary={<Typography variant="caption" sx={{ color: colors.textSecondary }}>• First Player to Score</Typography>} />
              </ListItem>
              <ListItem sx={{ py: 0, px: 0 }}>
                <ListItemText primary={<Typography variant="caption" sx={{ color: colors.textSecondary }}>• First Goal Minute</Typography>} />
              </ListItem>
            </List>
          </Card>

          {/* 1. Final Score */}
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                padding: 0.5,
                backgroundColor: colors.brandRed,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stadium sx={{ fontSize: 16, color: colors.brandWhite }} />
            </Box>
            1. Final Score
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TextField
              label={selectedFixture?.homeTeam || 'Home'}
              type="number"
              value={resultsForm.homeScore}
              onChange={(e) => setResultsForm({ ...resultsForm, homeScore: e.target.value })}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textSecondary }}>-</Typography>
            <TextField
              label={selectedFixture?.awayTeam || 'Away'}
              type="number"
              value={resultsForm.awayScore}
              onChange={(e) => setResultsForm({ ...resultsForm, awayScore: e.target.value })}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: colors.textSecondary, mb: 3, display: 'block' }}>
            This also determines Total Goal Range outcome
          </Typography>

          {/* 2. First Goal Scorer */}
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                padding: 0.5,
                backgroundColor: colors.brandRed,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Person sx={{ fontSize: 16, color: colors.brandWhite }} />
            </Box>
            2. First Goal Scorer (Featured Team)
          </Typography>
          <TextField
            placeholder="Enter player name..."
            value={resultsForm.firstGoalScorer}
            onChange={(e) => setResultsForm({ ...resultsForm, firstGoalScorer: e.target.value })}
            fullWidth
            size="small"
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: colors.brandRed }} />
                </InputAdornment>
              ),
            }}
          />

          {/* 3. First Goal Minute */}
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                padding: 0.5,
                backgroundColor: colors.brandRed,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AccessTime sx={{ fontSize: 16, color: colors.brandWhite }} />
            </Box>
            3. First Goal Minute
          </Typography>
          <TextField
            placeholder="Enter minute (1-120)..."
            type="number"
            value={resultsForm.firstGoalMinute}
            onChange={(e) => setResultsForm({ ...resultsForm, firstGoalMinute: e.target.value })}
            fullWidth
            size="small"
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTime sx={{ color: colors.brandRed }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Mark as Completed Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={resultsForm.markAsCompleted}
                onChange={(e) => setResultsForm({ ...resultsForm, markAsCompleted: e.target.checked })}
                disabled={!isFormValid}
                sx={{
                  color: isFormValid ? colors.brandRed : colors.textSecondary,
                  '&.Mui-checked': {
                    color: colors.brandRed,
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
                Mark as Completed
              </Typography>
            }
            sx={{ mb: 1 }}
          />
          {!isFormValid && (
            <Typography variant="caption" sx={{ color: colors.warning, display: 'block', ml: 4 }}>
              Fill all outcome fields to enable completion
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ padding: 3, pt: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={handleCloseResultsModal}
            sx={{ color: colors.textSecondary, textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateResults}
            startIcon={<Check />}
            sx={{
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Update Results
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu for Scheduled Fixtures */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => {
          setActionMenuAnchor(null);
          setMenuFixture(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            minWidth: 220,
            mt: 1,
            padding: 0.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            if (menuFixture) {
              navigate(`/fixtures/details/${menuFixture.id}`);
            }
            setActionMenuAnchor(null);
            setMenuFixture(null);
          }}
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              backgroundColor: `${colors.info}0D`,
            },
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: '#E3F2FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <Visibility sx={{ fontSize: 18, color: '#1976D2' }} />
          </Box>
          <Typography sx={{ flex: 1, fontWeight: 600, color: colors.brandBlack }}>View Details</Typography>
          <KeyboardArrowRight sx={{ fontSize: 18, color: colors.textSecondary }} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuFixture) {
              navigate(`/fixtures/edit/${menuFixture.id}`);
            }
            setActionMenuAnchor(null);
            setMenuFixture(null);
          }}
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              backgroundColor: `${colors.warning}0D`,
            },
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: '#FFF3E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <Edit sx={{ fontSize: 18, color: '#FF9800' }} />
          </Box>
          <Typography sx={{ flex: 1, fontWeight: 600, color: colors.brandBlack }}>Edit Fixture</Typography>
          <KeyboardArrowRight sx={{ fontSize: 18, color: colors.textSecondary }} />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FixturesPage;
