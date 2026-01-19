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
} from '@mui/material';
import {
  EmojiEvents,
  TrendingUp,
  BarChart,
  Person,
  People,
  VerifiedUser,
  AllInclusive,
  ArrowUpward,
  ArrowDownward,
  MoreVert,
  CheckCircle,
  List as ListIcon,
  ArrowDropDown,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
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
    loadLeaderboard();
  }, []);

  useEffect(() => {
    filterAndSortEntries();
  }, [entries, searchQuery, selectedPeriod, selectedSort]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const leaderboardRef = collection(db, 'leaderboard');
      const q = query(leaderboardRef, orderBy('rank', 'asc'));
      const snapshot = await getDocs(q);
      const entriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(entriesData);
      setFilteredEntries(entriesData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#FFD700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BarChart sx={{ fontSize: 18, color: colors.warning }} />
        </Box>
      );
    }
    return (
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: colors.backgroundLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: 12 }}>
          {rank}
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
        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.warning }}>
          {(value || row.spTotal || 0).toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'totalPredictions',
      label: 'Predictions',
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: colors.brandBlack }}>
          {value || 0}
        </Typography>
      ),
    },
    {
      id: 'accuracyRate',
      label: 'Accuracy',
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.success }}>
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
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
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
            backgroundColor: colors.brandRed,
            color: colors.brandWhite,
            width: 32,
            height: 32,
            '&:hover': {
              backgroundColor: colors.brandDarkRed,
            },
          }}
        >
          <MoreVert sx={{ fontSize: 18 }} />
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
        <Button
          variant="outlined"
          startIcon={<AllInclusive sx={{ fontSize: 18, color: colors.brandRed }} />}
          endIcon={<ArrowDropDown sx={{ fontSize: 18, color: colors.brandRed }} />}
          onClick={(e) => setPeriodAnchor(e.currentTarget)}
          sx={{
            borderColor: `${colors.brandRed}33`,
            color: colors.brandBlack,
            backgroundColor: colors.brandWhite,
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1,
          }}
        >
          All Time Leaders
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
        <Box sx={{ flex: 1, minWidth: 300 }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by username or email..."
            />
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowUpward sx={{ fontSize: 18, color: colors.brandRed }} />}
          endIcon={<ArrowDropDown sx={{ fontSize: 18, color: colors.brandRed }} />}
          onClick={(e) => setSortAnchor(e.currentTarget)}
          sx={{
            borderColor: `${colors.brandRed}33`,
            color: colors.brandBlack,
            backgroundColor: colors.brandWhite,
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1,
          }}
        >
          Rank: {selectedSort === 'rankAsc' ? 'Low to High' : 'High to Low'}
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
          <MenuItem onClick={() => { setSelectedSort('rankAsc'); setSortAnchor(null); }}>
            Rank: Low to High
          </MenuItem>
          <MenuItem onClick={() => { setSelectedSort('rankDesc'); setSortAnchor(null); }}>
            Rank: High to Low
          </MenuItem>
        </Menu>
      </Box>

      {/* Leaderboard Rankings Header */}
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
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: colors.brandBlack,
                fontSize: 18,
              }}
            >
              Leaderboard Rankings
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.textSecondary,
                fontSize: 13,
              }}
            >
              {filteredEntries.length} participants
            </Typography>
          </Box>
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
