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
      const fixturesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFixtures(fixturesData);
      setFilteredFixtures(fixturesData);
    } catch (error) {
      console.error('Error loading fixtures:', error);
    } finally {
      setLoading(false);
    }
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
      default:
        break;
    }

    setFilteredFixtures(filtered);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      scheduled: { label: 'Scheduled', color: colors.textSecondary, icon: Schedule },
      published: { label: 'Published', color: colors.info, icon: Visibility },
      live: { label: 'Live', color: colors.brandRed, icon: PlayCircle },
      completed: { label: 'Completed', color: colors.success, icon: CheckCircle },
      resultsProcessing: { label: 'Result Pending', color: colors.warning, icon: Edit },
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
      <Chip
        icon={<Icon />}
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
      id: 'match',
      label: 'Match',
      render: (_, row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.homeTeam || 'TBD'} vs {row.awayTeam || 'TBD'}
          </Typography>
          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 11 }}>
            {row.league || 'N/A'} • {row.venue || 'TBD'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'kickoffTime',
      label: 'Kickoff Time',
      render: (value) => {
        if (!value) return 'TBD';
        const date = value?.toDate ? value.toDate() : new Date(value);
        return format(date, 'MMM dd, yyyy • HH:mm');
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => getStatusChip(row.matchStatus || row.status),
    },
    {
      id: 'predictions',
      label: 'Predictions',
      render: (value) => value || 0,
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
      <Box sx={{ mb: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {statusFilters.map((filter) => {
          const isSelected = selectedStatus === filter.value;
          const Icon = filter.icon;
          const count = fixtures.filter((f) => {
            const status = f.matchStatus || f.status;
            if (filter.value === 'scheduled') return status === 'scheduled';
            if (filter.value === 'published') return status === 'published';
            if (filter.value === 'live') return status === 'live';
            if (filter.value === 'resultsProcessing') return status === 'resultsProcessing';
            if (filter.value === 'completed') return status === 'completed';
            return false;
          }).length;

          return (
            <Button
              key={filter.value}
              variant={isSelected ? 'contained' : 'outlined'}
              onClick={() => setSelectedStatus(filter.value)}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                backgroundColor: isSelected ? '#424242' : colors.brandWhite,
                color: isSelected ? colors.brandWhite : filter.color,
                border: `1.5px solid ${isSelected ? '#424242' : colors.divider}66`,
                boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
                '&:hover': {
                  backgroundColor: isSelected ? '#424242' : `${colors.divider}0D`,
                  boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
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
        <FormControl sx={{ minWidth: { xs: '100%', md: 200 } }}>
          <Select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            displayEmpty
            sx={{
              borderRadius: '12px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: `${colors.divider}66`,
              },
            }}
          >
            <MenuItem value="dateNewest">Date: Newest First</MenuItem>
            <MenuItem value="dateOldest">Date: Oldest First</MenuItem>
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
