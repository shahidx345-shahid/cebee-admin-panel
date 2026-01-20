import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Add,
  SportsSoccer,
  Visibility,
  PlayCircle,
  Edit,
  Schedule,
  CheckCircle,
  AccessTime,
  PlayArrow,
  ArrowUpward,
  List,
  ArrowDownward,
  ArrowUpward as ArrowUp,
  Sort,
  TrendingUp,
  TrendingDown,
  Check,
  Stadium,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';

const FixturesPage = () => {
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState([]);
  const [filteredFixtures, setFilteredFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('scheduled');
  const [selectedSort, setSelectedSort] = useState('dateNewest');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadFixtures();
  }, []);

  useEffect(() => {
    filterAndSortFixtures();
  }, [fixtures, searchQuery, selectedStatus, selectedSort]);

  const loadFixtures = async () => {
    try {
      setLoading(true);
      const fixturesRef = collection(db, 'fixtures');
      const q = query(fixturesRef, orderBy('kickoffTime', 'desc'));
      const snapshot = await getDocs(q);
      let fixturesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // If no fixtures exist, add sample data
      if (fixturesData.length === 0) {
        fixturesData = getSampleFixtures();
      }

      setFixtures(fixturesData);
      setFilteredFixtures(fixturesData);
    } catch (error) {
      console.error('Error loading fixtures:', error);
      // On error, use sample data
      const sampleData = getSampleFixtures();
      setFixtures(sampleData);
      setFilteredFixtures(sampleData);
    } finally {
      setLoading(false);
    }
  };

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
        homeScore: undefined,
        awayScore: undefined,
        predictions: 0,
      },
      // Live fixture
      {
        id: 'MATCH_003',
        homeTeam: 'Manchester City',
        awayTeam: 'Tottenham',
        league: 'Premier League',
        kickoffTime: new Date('2026-01-20T19:30:00'),
        matchStatus: 'live',
        homeScore: 2,
        awayScore: 1,
        predictions: 0,
      },
      // Result Pending fixture
      {
        id: 'MATCH_009',
        homeTeam: 'Everton',
        awayTeam: 'Fulham',
        league: 'Premier League',
        kickoffTime: new Date('2026-01-20T18:15:00'),
        matchStatus: 'resultsProcessing',
        homeScore: 1,
        awayScore: 2,
        predictions: 0,
      },
      // Completed fixtures
      {
        id: 'MATCH_004',
        homeTeam: 'Newcastle',
        awayTeam: 'Brighton',
        league: 'Premier League',
        kickoffTime: new Date('2026-01-19T20:15:00'),
        matchStatus: 'completed',
        homeScore: 2,
        awayScore: 1,
        predictions: 0,
      },
      {
        id: 'MATCH_005',
        homeTeam: 'West Ham',
        awayTeam: 'Aston Villa',
        league: 'Premier League',
        kickoffTime: new Date('2026-01-18T20:15:00'),
        matchStatus: 'completed',
        homeScore: 1,
        awayScore: 1,
        predictions: 0,
      },
      {
        id: 'MATCH_008',
        homeTeam: 'Wolves',
        awayTeam: 'Crystal Palace',
        league: 'Premier League',
        kickoffTime: new Date('2026-01-17T20:15:00'),
        matchStatus: 'completed',
        homeScore: 3,
        awayScore: 0,
        predictions: 0,
      },
    ];
  };

  const filterAndSortFixtures = () => {
    let filtered = [...fixtures];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (fixture) =>
          fixture.homeTeam?.toLowerCase().includes(query) ||
          fixture.awayTeam?.toLowerCase().includes(query) ||
          fixture.matchId?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (selectedStatus && selectedStatus !== 'all') {
      filtered = filtered.filter((fixture) => {
        const status = fixture.matchStatus || fixture.status;
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
          const dateB = b.kickoffTime?.toDate ? b.kickoffTime.toDate() : new Date(b.kickoffTime);
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

  const getStatusChip = (status) => {
    const statusMap = {
      scheduled: 'SCHEDULED',
      published: 'SCHEDULED',
      live: 'LIVE',
      completed: 'COMPLETED',
      resultsProcessing: 'RESULT PENDING',
    };

    const statusConfig = {
      scheduled: { 
        label: 'SCHEDULED', 
        backgroundColor: '#E3F2FD', 
        color: '#1976D2',
        textColor: '#1976D2'
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

    const mappedStatus = statusMap[status] || 'SCHEDULED';
    const config = statusConfig[status] || statusConfig.scheduled;

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
  const StatCard = ({ title, value, subtitle, icon: Icon, color, isPrimary = false }) => {
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
        <Chip
          label={row.id?.substring(0, 10) || row.matchId || 'N/A'}
          sx={{
            backgroundColor: colors.brandRed,
            color: colors.brandWhite,
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
            backgroundColor: colors.brandRed,
            color: colors.brandWhite,
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
      id: 'kickoffTime',
      label: 'Kickoff Time',
      render: (value, row) => {
        if (!row.kickoffTime) return '-';
        const date = row.kickoffTime?.toDate ? row.kickoffTime.toDate() : new Date(row.kickoffTime);
        return format(date, 'MMM dd, yyyy HH:mm');
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => getStatusChip(row.matchStatus || row.status),
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
                backgroundColor: 'transparent',
                color: colors.brandRed,
                fontWeight: 600,
                fontSize: 11,
                height: 28,
                borderRadius: '20px',
                border: `1.5px solid ${colors.brandRed}`,
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
      render: (_, row) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/fixtures/details/${row.id}`);
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
      ),
    },
  ];

  const paginatedFixtures = filteredFixtures.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const statusFilters = [
    { value: 'scheduled', label: 'Scheduled', icon: AccessTime, color: '#1976d2' },
    { value: 'published', label: 'Published', icon: Visibility, color: '#1976d2' },
    { value: 'live', label: 'Live', icon: PlayArrow, color: colors.brandRed },
    { value: 'resultsProcessing', label: 'Result Pending', icon: Edit, color: '#ed6c02' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: colors.success },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/fixtures/add')}
          sx={{
            background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Add Fixture
        </Button>
      </Box>

      {/* Stats Cards - Dashboard Style */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Scheduled"
            value={fixtures.filter((f) => (f.matchStatus || f.status) === 'scheduled').length.toString()}
            subtitle="Draft"
            icon={AccessTime}
            color="#1976d2"
            isPrimary={false}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Published"
            value={fixtures.filter((f) => (f.matchStatus || f.status) === 'published').length.toString()}
            subtitle="Predictions Open"
            icon={Visibility}
            color="#1976d2"
            isPrimary={false}
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
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Result Pending"
            value={fixtures.filter((f) => (f.matchStatus || f.status) === 'resultsProcessing').length.toString()}
            subtitle="Action Required"
            icon={Edit}
            color="#ed6c02"
            isPrimary={false}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Completed"
            value={fixtures.filter((f) => (f.matchStatus || f.status) === 'completed').length.toString()}
            subtitle="SP Distributed"
            icon={CheckCircle}
            color={colors.success}
            isPrimary={false}
          />
          </Grid>
      </Grid>

      {/* Status Filter Buttons - Card Style */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap' }}>
        {statusFilters.map((filter, index) => {
          const isSelected = selectedStatus === filter.value;
          const Icon = filter.icon;

          return (
            <Button
              key={filter.value}
              variant={isSelected ? 'contained' : 'outlined'}
              onClick={() => setSelectedStatus(filter.value)}
          sx={{
                flex: 1,
                minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' },
                borderRadius: 0,
              textTransform: 'none',
              fontWeight: 600,
                px: 3,
                py: 2,
                minHeight: 56,
                backgroundColor: isSelected ? filter.color : colors.brandWhite,
                color: isSelected ? colors.brandWhite : filter.color,
                border: 'none',
                borderTop: index === 0 ? `1.5px solid ${isSelected ? filter.color : colors.divider}66` : 'none',
                borderBottom: `1.5px solid ${isSelected ? filter.color : colors.divider}66`,
                borderLeft: index === 0 ? `1.5px solid ${isSelected ? filter.color : colors.divider}66` : 'none',
                borderRight: index === statusFilters.length - 1 ? `1.5px solid ${isSelected ? filter.color : colors.divider}66` : 'none',
                boxShadow: isSelected ? `0 4px 16px ${filter.color}60, inset 0 2px 4px ${filter.color}20` : 'none',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                zIndex: isSelected ? 1 : 0,
                position: 'relative',
                '&:first-of-type': {
                  borderTopLeftRadius: '20px',
                  borderBottomLeftRadius: '20px',
                },
                '&:last-of-type': {
                  borderTopRightRadius: '20px',
                  borderBottomRightRadius: '20px',
                },
                '&:hover': {
                  backgroundColor: isSelected ? filter.color : `${filter.color}0D`,
                  boxShadow: isSelected ? `0 4px 12px ${filter.color}50` : `0 2px 4px ${filter.color}20`,
            },
          }}
        >
              <Icon
              sx={{
                  fontSize: 18,
                  mr: 1,
                  color: isSelected ? colors.brandWhite : filter.color,
                }}
              />
              {filter.label}
            </Button>
          );
        })}
      </Box>

      {/* Search, Sort, and Add Fixture Row */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '300px' } }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by team name or match ID..."
            />
        </Box>
        <FormControl sx={{ minWidth: { xs: '100%', md: 200 }, position: 'relative' }}>
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
                <ArrowUp sx={{ fontSize: 16, color: selectedSort === 'dateOldest' ? colors.brandRed : colors.textSecondary }} />
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
            <List sx={{ fontSize: 24, color: colors.brandWhite }} />
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
    </Box>
  );
};

export default FixturesPage;
