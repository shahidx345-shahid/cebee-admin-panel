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
  FormControl,
  InputLabel,
  Button,
  Menu,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  EmojiEvents,
  BarChart,
  Person,
  People,
  ArrowUpward,
  MoreVert,
  CheckCircle,
  List as ListIcon,
  ArrowDropDown,
  AllInclusive,
  Search,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import { format } from 'date-fns';

// Static leaderboard data
const staticLeaderboardData = [
  {
    id: '1',
    rank: 1,
    username: 'ChiefPredictor',
    userEmail: 'chiefpredictor@example.com',
    points: 28500,
    spTotal: 28500,
    totalPredictions: 950,
    accuracyRate: 75.8,
    isVerified: true,
    lastUpdated: new Date('2026-01-22T13:32:00'),
    period: 'allTime'
  },
  {
    id: '2',
    rank: 2,
    username: 'AfricanLegend',
    userEmail: 'africanilegend@example.com',
    points: 26500,
    spTotal: 26500,
    totalPredictions: 880,
    accuracyRate: 73.9,
    isVerified: true,
    lastUpdated: new Date('2026-01-22T13:29:00'),
    period: 'allTime'
  },
  {
    id: '3',
    rank: 3,
    username: 'KingOfPredictions',
    userEmail: 'kingofpredictions@example.com',
    points: 24800,
    spTotal: 24800,
    totalPredictions: 820,
    accuracyRate: 74.4,
    isVerified: true,
    lastUpdated: new Date('2026-01-22T13:26:00'),
    period: 'allTime'
  },
  {
    id: '4',
    rank: 4,
    username: 'PredictionMaster',
    userEmail: 'predictionmaster@example.com',
    points: 22400,
    spTotal: 22400,
    totalPredictions: 780,
    accuracyRate: 74.4,
    isVerified: true,
    lastUpdated: new Date('2026-01-22T13:23:00'),
    period: 'allTime'
  },
  {
    id: '5',
    rank: 5,
    username: 'FootballWizard',
    userEmail: 'footballwizard@example.com',
    points: 20500,
    spTotal: 20500,
    totalPredictions: 720,
    accuracyRate: 73.6,
    isVerified: true,
    lastUpdated: new Date('2026-01-22T13:20:00'),
    period: 'allTime'
  },
  {
    id: '6',
    rank: 6,
    username: 'ScoreKing',
    userEmail: 'scoreking@example.com',
    points: 18900,
    spTotal: 18900,
    totalPredictions: 680,
    accuracyRate: 73.5,
    isVerified: true,
    lastUpdated: new Date('2026-01-22T13:17:00'),
    period: 'allTime'
  },
  {
    id: '7',
    rank: 7,
    username: 'GoalMachine',
    userEmail: 'goalmachine@example.com',
    points: 17200,
    spTotal: 17200,
    totalPredictions: 640,
    accuracyRate: 73.4,
    isVerified: true,
    lastUpdated: new Date('2026-01-22T13:14:00'),
    period: 'allTime'
  },
  {
    id: '8',
    rank: 8,
    username: 'MatchGuru',
    userEmail: 'matchguru@example.com',
    points: 15800,
    spTotal: 15800,
    totalPredictions: 600,
    accuracyRate: 72.9,
    isVerified: true,
    lastUpdated: new Date('2026-01-22T13:11:00'),
    period: 'allTime'
  },
  {
    id: '9',
    rank: 9,
    username: 'StrikerPro',
    userEmail: 'strikerpro@example.com',
    points: 14500,
    spTotal: 14500,
    totalPredictions: 560,
    accuracyRate: 72.3,
    isVerified: true,
    lastUpdated: new Date('2026-01-22T13:08:00'),
    period: 'allTime'
  },
  {
    id: '10',
    rank: 10,
    username: 'GameChanger',
    userEmail: 'gamechanger@example.com',
    points: 13200,
    spTotal: 13200,
    totalPredictions: 520,
    accuracyRate: 71.8,
    isVerified: true,
    lastUpdated: new Date('2026-01-22T13:05:00'),
    period: 'allTime'
  },
  {
    id: '11',
    rank: 11,
    username: 'TacticalGenius',
    userEmail: 'tacticalgenius@example.com',
    points: 12000,
    spTotal: 12000,
    totalPredictions: 480,
    accuracyRate: 71.2,
    isVerified: true,
    lastUpdated: new Date('2026-01-22T13:02:00'),
    period: 'allTime'
  },
  {
    id: '12',
    rank: 12,
    username: 'NetBuster',
    userEmail: 'netbuster@example.com',
    points: 10800,
    spTotal: 10800,
    totalPredictions: 440,
    accuracyRate: 70.5,
    isVerified: false,
    lastUpdated: new Date('2026-01-22T12:59:00'),
    period: 'allTime'
  },
  {
    id: '13',
    rank: 13,
    username: 'PitchMaster',
    userEmail: 'pitchmaster@example.com',
    points: 9600,
    spTotal: 9600,
    totalPredictions: 400,
    accuracyRate: 69.8,
    isVerified: false,
    lastUpdated: new Date('2026-01-22T12:56:00'),
    period: 'allTime'
  },
  {
    id: '14',
    rank: 14,
    username: 'BallWatcher',
    userEmail: 'ballwatcher@example.com',
    points: 8500,
    spTotal: 8500,
    totalPredictions: 360,
    accuracyRate: 69.0,
    isVerified: false,
    lastUpdated: new Date('2026-01-22T12:53:00'),
    period: 'allTime'
  },
  {
    id: '15',
    rank: 15,
    username: 'FieldExpert',
    userEmail: 'fieldexpert@example.com',
    points: 7400,
    spTotal: 7400,
    totalPredictions: 320,
    accuracyRate: 68.3,
    isVerified: false,
    lastUpdated: new Date('2026-01-22T12:50:00'),
    period: 'allTime'
  },
  {
    id: '16',
    rank: 16,
    username: 'TeamAnalyst',
    userEmail: 'teamanalyst@example.com',
    points: 6500,
    spTotal: 6500,
    totalPredictions: 280,
    accuracyRate: 67.5,
    isVerified: false,
    lastUpdated: new Date('2026-01-22T12:47:00'),
    period: 'allTime'
  },
  {
    id: '17',
    rank: 17,
    username: 'MatchPredictor',
    userEmail: 'matchpredictor@example.com',
    points: 5600,
    spTotal: 5600,
    totalPredictions: 240,
    accuracyRate: 66.8,
    isVerified: false,
    lastUpdated: new Date('2026-01-22T12:44:00'),
    period: 'allTime'
  },
  {
    id: '18',
    rank: 18,
    username: 'ScoreReader',
    userEmail: 'scorereader@example.com',
    points: 4800,
    spTotal: 4800,
    totalPredictions: 200,
    accuracyRate: 66.0,
    isVerified: false,
    lastUpdated: new Date('2026-01-22T12:41:00'),
    period: 'allTime'
  },
  {
    id: '19',
    rank: 19,
    username: 'GoalSeeker',
    userEmail: 'goalseeker@example.com',
    points: 4000,
    spTotal: 4000,
    totalPredictions: 160,
    accuracyRate: 65.2,
    isVerified: false,
    lastUpdated: new Date('2026-01-22T12:38:00'),
    period: 'allTime'
  },
  {
    id: '20',
    rank: 20,
    username: 'WhistleBlower',
    userEmail: 'whistleblower@example.com',
    points: 3300,
    spTotal: 3300,
    totalPredictions: 120,
    accuracyRate: 64.5,
    isVerified: false,
    lastUpdated: new Date('2026-01-22T12:35:00'),
    period: 'allTime'
  },
  // Adding more users for ranks 21-50
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `${21 + i}`,
    rank: 21 + i,
    username: `Player${21 + i}`,
    userEmail: `player${21 + i}@example.com`,
    points: 3000 - (i * 100),
    spTotal: 3000 - (i * 100),
    totalPredictions: 100 - (i * 2),
    accuracyRate: 64.0 - (i * 0.5),
    isVerified: false,
    lastUpdated: new Date(Date.now() - (i * 3 * 60 * 1000)),
    period: 'allTime'
  }))
];

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState(staticLeaderboardData);
  const [filteredEntries, setFilteredEntries] = useState(staticLeaderboardData);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('allTime');
  const [selectedSort, setSelectedSort] = useState('rankAsc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [periodAnchor, setPeriodAnchor] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);
  const [paginationAnchor, setPaginationAnchor] = useState(null);
  const [actionsAnchor, setActionsAnchor] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const totalParticipants = entries.length;
  const topScorer = entries[0]?.username || 'N/A';
  const averageAccuracy = entries.length > 0
    ? ((entries.reduce((sum, e) => sum + (e.accuracyRate || 0), 0) / entries.length)).toFixed(1)
    : '0.0';
  const totalPoints = entries.reduce((sum, e) => sum + (e.spTotal || e.points || 0), 0);

  useEffect(() => {
    const filterAndSortEntries = () => {
      let filtered = [...entries];

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (entry) =>
            entry.username?.toLowerCase().includes(query) ||
            entry.userEmail?.toLowerCase().includes(query) ||
            entry.id?.toLowerCase().includes(query)
        );
      }

      if (selectedPeriod !== 'all') {
        filtered = filtered.filter((entry) => entry.period === selectedPeriod);
      }

      switch (selectedSort) {
        case 'rankAsc':
          filtered.sort((a, b) => (a.rank || 0) - (b.rank || 0));
          break;
        case 'rankDesc':
          filtered.sort((a, b) => (b.rank || 0) - (a.rank || 0));
          break;
        case 'pointsHighest':
          filtered.sort((a, b) => (b.spTotal || 0) - (a.spTotal || 0));
          break;
        case 'pointsLowest':
          filtered.sort((a, b) => (a.spTotal || 0) - (b.spTotal || 0));
          break;
        case 'accuracyHighest':
          filtered.sort((a, b) => (b.accuracyRate || 0) - (a.accuracyRate || 0));
          break;
        case 'accuracyLowest':
          filtered.sort((a, b) => (a.accuracyRate || 0) - (b.accuracyRate || 0));
          break;
        case 'usernameAZ':
          filtered.sort((a, b) => (a.username || '').localeCompare(b.username || ''));
          break;
        case 'usernameZA':
          filtered.sort((a, b) => (b.username || '').localeCompare(a.username || ''));
          break;
        default:
          break;
      }

      setFilteredEntries(filtered);
    };
    filterAndSortEntries();
  }, [entries, searchQuery, selectedPeriod, selectedSort]);



  const getRankBadge = (rank) => {
    return (
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: `${colors.brandRed}1A`,
          border: `2px solid ${colors.brandRed}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandRed, fontSize: 14 }}>
          #{rank}
        </Typography>
      </Box>
    );
  };

  const handleActionsOpen = (event, entry) => {
    setActionsAnchor(event.currentTarget);
    setSelectedEntry(entry);
  };

  const handleActionsClose = () => {
    setActionsAnchor(null);
    setSelectedEntry(null);
  };

  const columns = [
    {
      id: 'rank',
      label: 'Rank',
      render: (value) => getRankBadge(value),
    },
    {
      id: 'username',
      label: 'Username',
      render: (value, row) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person sx={{ fontSize: 18, color: colors.info }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
              {value || 'N/A'}
            </Typography>
            {row.isVerified && (
              <CheckCircle sx={{ fontSize: 16, color: colors.info }} />
            )}
          </Box>
          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 11, ml: 4 }}>
            {row.userEmail || row.email || 'No email'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'points',
      label: 'Points',
      render: (value, row) => (
        <Chip
          label={(value || row.spTotal || 0).toLocaleString()}
          sx={{
            backgroundColor: `${colors.warning}26`,
            color: colors.warning,
            fontWeight: 700,
            fontSize: 13,
            height: 28,
            borderRadius: '8px',
            '& .MuiChip-label': {
              px: 1.5,
            },
          }}
        />
      ),
    },
    {
      id: 'totalPredictions',
      label: 'Predictions',
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
          {value || 0}
        </Typography>
      ),
    },
    {
      id: 'accuracyRate',
      label: 'Accuracy',
      render: (value) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 700, 
            color: colors.success,
            backgroundColor: `${colors.success}1A`,
            display: 'inline-block',
            px: 1.5,
            py: 0.5,
            borderRadius: '6px',
          }}
        >
          {value?.toFixed(1) || '0.0'}%
        </Typography>
      ),
    },
    {
      id: 'lastUpdated',
      label: 'Last Updated',
      render: (value, row) => {
        const date = value?.toDate ? value.toDate() : (row.updatedAt?.toDate ? row.updatedAt.toDate() : new Date(value || row.updatedAt));
        return (
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13, fontWeight: 500 }}>
            {format(date, 'MMM dd, HH:mm')}
          </Typography>
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleActionsOpen(e, row);
          }}
          sx={{
            backgroundColor: `${colors.brandRed}1A`,
            color: colors.brandRed,
            width: 36,
            height: 36,
            border: `1.5px solid ${colors.brandRed}33`,
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: `${colors.brandRed}33`,
            },
          }}
        >
          <MoreVert sx={{ fontSize: 20 }} />
        </IconButton>
      ),
    },
  ];

  const paginatedEntries = filteredEntries.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: colors.brandBlack,
          fontSize: { xs: 24, md: 28 },
          mb: 3,
        }}
      >
        Leaderboard Control
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
                <People sx={{ fontSize: 24, color: colors.brandWhite }} />
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
              {totalParticipants}
            </Typography>
            <Typography variant="body2" sx={{ color: `${colors.brandWhite}DD`, fontSize: 13 }}>
              Total Participants
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
                <BarChart sx={{ fontSize: 24, color: colors.warning }} />
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
              {topScorer}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Top Scorer
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
                  borderRadius: '12px',
                }}
              >
                <BarChart sx={{ fontSize: 24, color: colors.success }} />
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
              {averageAccuracy}%
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Average Accuracy
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
                <EmojiEvents sx={{ fontSize: 24, color: colors.info }} />
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
              {totalPoints.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Total Points
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search Bar */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* All Time Leaders Dropdown */}
        <Button
          variant="outlined"
          onClick={(e) => setPeriodAnchor(e.currentTarget)}
          sx={{
            borderColor: colors.brandRed,
            borderWidth: 1,
            color: colors.brandBlack,
            backgroundColor: colors.brandWhite,
            borderRadius: '25px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2.5,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: 'auto',
            '&:hover': {
              borderColor: colors.brandRed,
              backgroundColor: colors.brandWhite,
            },
          }}
        >
          <AllInclusive sx={{ fontSize: 18, color: colors.brandRed }} />
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: colors.brandBlack }}>
            All Time Leaders
          </Typography>
          <Box
            sx={{
              width: 24,
              height: 24,
              backgroundColor: colors.brandRed,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ml: 0.5,
            }}
          >
            <ArrowDropDown sx={{ fontSize: 16, color: colors.brandWhite }} />
          </Box>
        </Button>
        <Menu
          anchorEl={periodAnchor}
          open={Boolean(periodAnchor)}
          onClose={() => setPeriodAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 200,
              boxShadow: `0 4px 12px ${colors.shadow}33`,
              mt: 0.5,
            },
          }}
        >
          <MenuItem onClick={() => { setSelectedPeriod('allTime'); setPeriodAnchor(null); }}>
            All Time Leaders
          </MenuItem>
          <MenuItem onClick={() => { setSelectedPeriod('monthly'); setPeriodAnchor(null); }}>
            Monthly Leaders
          </MenuItem>
          <MenuItem onClick={() => { setSelectedPeriod('weekly'); setPeriodAnchor(null); }}>
            Weekly Leaders
          </MenuItem>
          <MenuItem onClick={() => { setSelectedPeriod('daily'); setPeriodAnchor(null); }}>
            Daily Leaders
          </MenuItem>
        </Menu>

        {/* Search Bar */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <TextField
            fullWidth
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '25px',
                backgroundColor: colors.brandWhite,
                fontSize: 14,
                '& fieldset': {
                  borderColor: colors.divider,
                  borderWidth: 1,
                },
                '&:hover fieldset': {
                  borderColor: colors.divider,
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.divider,
                  borderWidth: 1,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: colors.brandRed, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Rank Dropdown */}
        <Button
          variant="outlined"
          onClick={(e) => setSortAnchor(e.currentTarget)}
          sx={{
            borderColor: colors.brandRed,
            borderWidth: 1,
            color: colors.brandBlack,
            backgroundColor: colors.brandWhite,
            borderRadius: '25px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2.5,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: 'auto',
            '&:hover': {
              borderColor: colors.brandRed,
              backgroundColor: colors.brandWhite,
            },
          }}
        >
          <ArrowUpward sx={{ fontSize: 18, color: colors.brandRed }} />
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: colors.brandBlack }}>
            Rank: {selectedSort === 'rankAsc' ? 'Low to High' : 'High to Low'}
          </Typography>
          <Box
            sx={{
              width: 24,
              height: 24,
              backgroundColor: colors.brandRed,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ml: 0.5,
            }}
          >
            <ArrowDropDown sx={{ fontSize: 16, color: colors.brandWhite }} />
          </Box>
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
              mt: 0.5,
            },
          }}
        >
          <MenuItem onClick={() => { setSelectedSort('rankAsc'); setSortAnchor(null); }}>
            Rank: Low to High
          </MenuItem>
          <MenuItem onClick={() => { setSelectedSort('rankDesc'); setSortAnchor(null); }}>
            Rank: High to Low
          </MenuItem>
        </Menu>
      </Box>

      {/* Leaderboard Rankings Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 2,
          padding: 2,
          backgroundColor: colors.brandWhite,
          borderRadius: '12px 12px 0 0',
          border: `1.5px solid ${colors.divider}26`,
          borderBottom: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              backgroundColor: colors.brandRed,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart sx={{ fontSize: 22, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: colors.brandBlack,
                fontSize: 17,
                mb: 0.25,
              }}
            >
              Leaderboard Rankings
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {filteredEntries.length} participants
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          endIcon={<ArrowDropDown sx={{ fontSize: 18 }} />}
          onClick={(e) => setPaginationAnchor(e.currentTarget)}
          sx={{
            borderColor: colors.brandRed,
            color: colors.brandBlack,
            backgroundColor: colors.brandWhite,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            py: 1,
            fontSize: 13,
            '&:hover': {
              borderColor: colors.brandRed,
              backgroundColor: `${colors.brandRed}0D`,
            },
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
              mt: 0.5,
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
        data={paginatedEntries}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredEntries.length}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onRowClick={(row) => navigate(`/leaderboard/details/${row.id}`)}
        emptyMessage="No leaderboard entries found"
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={actionsAnchor}
        open={Boolean(actionsAnchor)}
        onClose={handleActionsClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: 180,
            boxShadow: `0 4px 12px ${colors.shadow}33`,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedEntry) {
              navigate(`/leaderboard/details/${selectedEntry.id}`);
            }
            handleActionsClose();
          }}
        >
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleActionsClose();
          }}
        >
          View User Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleActionsClose();
          }}
          sx={{ color: colors.error }}
        >
          Reset Points
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LeaderboardPage;
