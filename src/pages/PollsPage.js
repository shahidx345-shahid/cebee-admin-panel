import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
} from '@mui/material';
import {
  Add,
  Poll,
  CheckCircle,
  Schedule,
  Cancel,
  MoreVert,
  Close,
  BarChart,
  PieChart,
  People,
  ViewModule,
  Assignment,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import { collection, getDocs, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';

const PollsPage = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPoll, setSelectedPoll] = useState(null);

  useEffect(() => {
    loadPolls();
  }, []);

  useEffect(() => {
    filterPolls();
  }, [polls, searchQuery, statusFilter, leagueFilter]);

  const loadPolls = async () => {
    try {
      setLoading(true);
      const pollsRef = collection(db, 'polls');
      const q = query(pollsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const pollsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPolls(pollsData);
      setFilteredPolls(pollsData);
    } catch (error) {
      console.error('Error loading polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPolls = () => {
    let filtered = [...polls];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (poll) =>
          poll.pollId?.toLowerCase().includes(query) ||
          poll.leagueName?.toLowerCase().includes(query) ||
          poll.question?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((poll) => {
        const status = poll.status || poll.pollStatus;
        // Map 'scheduled' filter to both 'pending' and 'scheduled' statuses
        if (statusFilter === 'scheduled') {
          return status === 'pending' || status === 'scheduled';
        }
        return status === statusFilter;
      });
    }

    if (leagueFilter !== 'all') {
      filtered = filtered.filter((poll) => poll.leagueId === leagueFilter);
    }

    filtered.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });

    setFilteredPolls(filtered);
  };

  const canCreateMorePolls = () => {
    const activePolls = polls.filter((p) => (p.status || p.pollStatus) === 'active');
    return activePolls.length < 5;
  };

  const handleCreatePoll = () => {
    if (!canCreateMorePolls()) {
      alert('Maximum 5 active polls reached. Close a poll to create a new one.');
      return;
    }
    navigate('/polls/add');
  };

  const handleMenuOpen = (event, poll) => {
    setAnchorEl(event.currentTarget);
    setSelectedPoll(poll);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPoll(null);
  };

  const handleClosePoll = async (poll) => {
    try {
      const pollRef = doc(db, 'polls', poll.id);
      await updateDoc(pollRef, {
        status: 'closed',
        closedAt: serverTimestamp(),
      });
      await loadPolls();
      handleMenuClose();
    } catch (error) {
      console.error('Error closing poll:', error);
      alert('Failed to close poll');
    }
  };

  const getStatusChip = (status) => {
    // Map pending to scheduled for display
    const displayStatus = status === 'pending' ? 'scheduled' : status;
    
    const statusConfig = {
      active: { label: 'ACTIVE', color: colors.success },
      scheduled: { label: 'SCHEDULED', color: colors.info },
      closed: { label: 'CLOSED', color: colors.textSecondary },
    };

    const config = statusConfig[displayStatus] || statusConfig.active;

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.color,
          color: colors.brandWhite,
          fontWeight: 600,
          fontSize: 11,
          borderRadius: '20px',
        }}
      />
    );
  };

  const columns = [
    {
      id: 'pollId',
      label: 'Poll ID',
      render: (_, row) => (
        <Chip
          label={row.pollId || `POLL_${String(row.order || 0).padStart(3, '0')}`}
          size="small"
          sx={{
            backgroundColor: `${colors.brandRed}1A`,
            color: colors.brandRed,
            fontWeight: 600,
            fontSize: 12,
            borderRadius: '8px',
          }}
        />
      ),
    },
    {
      id: 'leagueName',
      label: 'League',
      render: (value, row) => (
        <Box>
          <Chip
            label={value || 'N/A'}
            size="small"
            sx={{
              backgroundColor: `${colors.brandRed}1A`,
              color: colors.brandRed,
              fontWeight: 600,
              fontSize: 12,
              borderRadius: '8px',
              mb: 0.5,
            }}
          />
          {row.teams && Array.isArray(row.teams) && row.teams.length > 0 && (
            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', fontSize: 11, mt: 0.5 }}>
              Teams: {row.teams.slice(0, 3).join(', ')}
              {row.teams.length > 3 && ` +${row.teams.length - 3} more`}
            </Typography>
          )}
          {row.matches && Array.isArray(row.matches) && row.matches.length > 0 && (
            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', fontSize: 11, mt: 0.5 }}>
              Matches: {row.matches.slice(0, 2).map(m => (m && m.homeTeam && m.awayTeam ? `${m.homeTeam} vs ${m.awayTeam}` : 'TBD')).join(', ')}
              {row.matches.length > 2 && ` +${row.matches.length - 2} more`}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => getStatusChip(row.status || row.pollStatus || 'pending'),
    },
    {
      id: 'voteCount',
      label: 'Votes',
      render: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <People sx={{ fontSize: 18, color: colors.brandRed }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
            {value?.toLocaleString() || 0}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'startTime',
      label: 'Start Time',
      render: (_, row) => {
        const date = row.startTime?.toDate ? row.startTime.toDate() : new Date(row.startTime);
        return format(date, 'MMM dd, yyyy HH:mm');
      },
    },
    {
      id: 'closeTime',
      label: 'Close Time',
      render: (_, row) => {
        const date = row.closeTime?.toDate ? row.closeTime.toDate() : new Date(row.closeTime);
        return format(date, 'MMM dd, yyyy HH:mm');
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const isActive = (row.status || row.pollStatus) === 'active';
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isActive && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClosePoll(row);
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
                <Close sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, row);
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
          </Box>
        );
      },
    },
  ];

  const paginatedPolls = filteredPolls.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const activePolls = polls.filter((p) => (p.status || p.pollStatus) === 'active');

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart sx={{ fontSize: 28, color: colors.brandWhite }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.brandBlack,
              fontSize: { xs: 24, md: 28 },
            }}
          >
            Poll Management
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: colors.textSecondary,
            fontSize: 14,
            ml: 8.5,
          }}
        >
          One poll per league • Max 5 active polls
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '20px',
              backgroundColor: `${colors.info}0D`,
              border: `1.5px solid ${colors.info}26`,
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <BarChart sx={{ fontSize: 28, color: colors.info }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {polls.length}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Total Polls
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '20px',
              backgroundColor: `${colors.success}0D`,
              border: `1.5px solid ${colors.success}26`,
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <PieChart sx={{ fontSize: 28, color: colors.success }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {activePolls.length}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Active
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '20px',
              backgroundColor: `${colors.warning}0D`,
              border: `1.5px solid ${colors.warning}26`,
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Schedule sx={{ fontSize: 28, color: colors.warning }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {polls.filter((p) => (p.status || p.pollStatus) === 'pending' || (p.status || p.pollStatus) === 'scheduled').length}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Scheduled
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '20px',
              backgroundColor: `${colors.brandRed}0D`,
              border: `1.5px solid ${colors.brandRed}26`,
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <People sx={{ fontSize: 28, color: colors.brandRed }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {polls.reduce((sum, p) => sum + (p.voteCount || 0), 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Total Votes
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button
          variant={statusFilter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setStatusFilter('all')}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            backgroundColor: statusFilter === 'all' ? colors.brandRed : colors.brandWhite,
            color: statusFilter === 'all' ? colors.brandWhite : colors.textSecondary,
            border: `1.5px solid ${statusFilter === 'all' ? colors.brandRed : colors.divider}66`,
            '&:hover': {
              backgroundColor: statusFilter === 'all' ? colors.brandRed : `${colors.divider}0D`,
            },
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '6px',
              backgroundColor: statusFilter === 'all' ? `${colors.brandWhite}33` : `${colors.divider}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <ViewModule sx={{ fontSize: 14, color: statusFilter === 'all' ? colors.brandWhite : colors.textSecondary }} />
          </Box>
          All Polls
        </Button>
        <Button
          variant={statusFilter === 'active' ? 'contained' : 'outlined'}
          onClick={() => setStatusFilter('active')}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            backgroundColor: statusFilter === 'active' ? colors.success : colors.brandWhite,
            color: statusFilter === 'active' ? colors.brandWhite : colors.success,
            border: `1.5px solid ${statusFilter === 'active' ? colors.success : colors.divider}66`,
            '&:hover': {
              backgroundColor: statusFilter === 'active' ? colors.success : `${colors.divider}0D`,
            },
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '6px',
              backgroundColor: `${colors.success}1A`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <PieChart sx={{ fontSize: 14, color: colors.success }} />
          </Box>
          Active
        </Button>
        <Button
          variant={statusFilter === 'scheduled' ? 'contained' : 'outlined'}
          onClick={() => setStatusFilter('scheduled')}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            backgroundColor: statusFilter === 'scheduled' ? colors.info : colors.brandWhite,
            color: statusFilter === 'scheduled' ? colors.brandWhite : colors.info,
            border: `1.5px solid ${statusFilter === 'scheduled' ? colors.info : colors.divider}66`,
            '&:hover': {
              backgroundColor: statusFilter === 'scheduled' ? colors.info : `${colors.divider}0D`,
            },
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '6px',
              backgroundColor: statusFilter === 'scheduled' ? `${colors.brandWhite}33` : `${colors.info}1A`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <Schedule sx={{ fontSize: 14, color: statusFilter === 'scheduled' ? colors.brandWhite : colors.info }} />
          </Box>
          Scheduled
        </Button>
        <Button
          variant={statusFilter === 'closed' ? 'contained' : 'outlined'}
          onClick={() => setStatusFilter('closed')}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            backgroundColor: statusFilter === 'closed' ? colors.textSecondary : colors.brandWhite,
            color: statusFilter === 'closed' ? colors.brandWhite : colors.textSecondary,
            border: `1.5px solid ${statusFilter === 'closed' ? colors.textSecondary : colors.divider}66`,
            '&:hover': {
              backgroundColor: statusFilter === 'closed' ? colors.textSecondary : `${colors.divider}0D`,
            },
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '6px',
              backgroundColor: `${colors.divider}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <CheckCircle sx={{ fontSize: 14, color: colors.textSecondary }} />
          </Box>
          Closed
        </Button>
      </Box>

      {/* Search Bar and Create Button */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search polls by ID or league..."
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreatePoll}
          disabled={!canCreateMorePolls()}
          sx={{
            background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
          }}
        >
          Create Poll
        </Button>
      </Box>

      {/* Poll List Header */}
      <Card
        sx={{
          padding: 2.5,
          mb: 2,
          borderRadius: '16px',
          backgroundColor: colors.brandWhite,
          border: `1.5px solid ${colors.divider}26`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundColor: colors.brandRed,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Assignment sx={{ fontSize: 24, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.25 }}>
              All Polls
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              {filteredPolls.length} polls • Page {page + 1} of {Math.ceil(filteredPolls.length / rowsPerPage) || 1}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedPolls}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredPolls.length}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onRowClick={(row) => navigate(`/polls/edit/${row.id}`)}
        emptyMessage="No polls found"
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
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
            if (selectedPoll) {
              navigate(`/polls/edit/${selectedPoll.id}`);
            }
            handleMenuClose();
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Edit
          </Typography>
        </MenuItem>
        {selectedPoll && (selectedPoll.status || selectedPoll.pollStatus) === 'active' && (
          <MenuItem
            onClick={() => {
              if (selectedPoll) {
                handleClosePoll(selectedPoll);
              }
            }}
            sx={{ color: colors.error }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Close Poll
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default PollsPage;
