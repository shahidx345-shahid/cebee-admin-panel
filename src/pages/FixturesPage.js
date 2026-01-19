import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Chip,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add,
  SportsSoccer,
  Visibility,
  PlayCircle,
  Edit,
  Schedule,
  CheckCircle,
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
    if (selectedStatus !== 'all') {
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

  const statusTabs = [
    { value: 'scheduled', label: 'Scheduled', count: fixtures.filter((f) => (f.matchStatus || f.status) === 'scheduled').length },
    { value: 'published', label: 'Published', count: fixtures.filter((f) => (f.matchStatus || f.status) === 'published').length },
    { value: 'live', label: 'Live', count: fixtures.filter((f) => (f.matchStatus || f.status) === 'live').length },
    { value: 'resultsProcessing', label: 'Result Pending', count: fixtures.filter((f) => (f.matchStatus || f.status) === 'resultsProcessing').length },
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

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Fixtures', value: fixtures.length, color: colors.brandRed },
          {
            label: 'Scheduled',
            value: fixtures.filter((f) => (f.matchStatus || f.status) === 'scheduled').length,
            color: colors.textSecondary,
          },
          {
            label: 'Live',
            value: fixtures.filter((f) => (f.matchStatus || f.status) === 'live').length,
            color: colors.error,
          },
          {
            label: 'Completed',
            value: fixtures.filter((f) => (f.matchStatus || f.status) === 'completed').length,
            color: colors.success,
          },
        ].map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card
              sx={{
                padding: 2,
                background: `linear-gradient(135deg, ${stat.color}1A 0%, ${stat.color}0D 100%)`,
                border: `1.5px solid ${stat.color}33`,
                borderRadius: '16px',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Status Tabs */}
      <Card sx={{ mb: 3, borderRadius: '16px', overflow: 'hidden' }}>
        <Tabs
          value={selectedStatus}
          onChange={(e, newValue) => setSelectedStatus(newValue)}
          sx={{
            borderBottom: `1px solid ${colors.divider}33`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 14,
            },
          }}
        >
          {statusTabs.map((tab) => (
            <Tab
              key={tab.value}
              label={`${tab.label} (${tab.count})`}
              value={tab.value}
              sx={{
                color: selectedStatus === tab.value ? colors.brandRed : colors.textSecondary,
              }}
            />
          ))}
        </Tabs>
      </Card>

      {/* Filters */}
      <Card sx={{ padding: 2.5, mb: 3, borderRadius: '16px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by team name or match ID..."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                label="Sort By"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="dateNewest">Date (Newest)</MenuItem>
                <MenuItem value="dateOldest">Date (Oldest)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
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
