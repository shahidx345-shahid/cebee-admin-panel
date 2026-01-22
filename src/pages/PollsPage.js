import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogContent,
  Divider,
} from '@mui/material';
import {
  Add,
  CheckCircle,
  Schedule,
  MoreVert,
  Close,
  BarChart,
  PieChart,
  People,
  ViewModule,
  Assignment,
  LocalOffer,
  Info,
  CalendarToday,
  Person,
  Star,
} from '@mui/icons-material';
import { colors } from '../config/theme';
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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [pollDetails, setPollDetails] = useState(null);

  useEffect(() => {
    const loadPolls = async () => {
      try {
        setLoading(true);
        
        // Static demo data
        const demoPolls = [
          {
            id: '1',
            pollId: 'POLL_005',
            leagueName: 'Ligue 1',
            status: 'closed',
            voteCount: 18765,
            startTime: new Date('2026-01-12T15:59:00'),
            closeTime: new Date('2026-01-17T15:59:00'),
            createdAt: new Date('2026-01-10T15:59:00'),
          },
          {
            id: '2',
            pollId: 'POLL_006',
            leagueName: 'Premier League',
            status: 'closed',
            voteCount: 16543,
            startTime: new Date('2026-01-02T15:59:00'),
            closeTime: new Date('2026-01-07T15:59:00'),
            createdAt: new Date('2025-12-30T15:59:00'),
          },
          {
            id: '3',
            pollId: 'POLL_007',
            leagueName: 'La Liga',
            status: 'closed',
            voteCount: 14321,
            startTime: new Date('2025-12-28T15:59:00'),
            closeTime: new Date('2026-01-02T15:59:00'),
            createdAt: new Date('2025-12-26T15:59:00'),
          },
        ];
        
        setPolls(demoPolls);
        setFilteredPolls(demoPolls);
      } catch (error) {
        console.error('Error loading polls:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPolls();
  }, []);

  useEffect(() => {
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
    filterPolls();
  }, [polls, searchQuery, statusFilter, leagueFilter]);

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
      // Update local state
      const updatedPolls = polls.map((p) =>
        p.id === poll.id ? { ...p, status: 'closed' } : p
      );
      setPolls(updatedPolls);
      setFilteredPolls(updatedPolls);
      handleMenuClose();
      alert('Poll closed successfully!');
    } catch (error) {
      console.error('Error closing poll:', error);
      alert('Failed to close poll');
    }
  };

  const handlePollClick = (poll) => {
    setPollDetails(poll);
    setDetailsDialogOpen(true);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setPollDetails(null);
  };

  const getStatusChip = (status) => {
    // Map pending to scheduled for display
    const displayStatus = status === 'pending' ? 'scheduled' : status;

    const statusConfig = {
      active: { label: 'ACTIVE', bgColor: '#10B981', textColor: colors.brandWhite },
      scheduled: { label: 'SCHEDULED', bgColor: '#3B82F6', textColor: colors.brandWhite },
      closed: { label: 'CLOSED', bgColor: '#E5E7EB', textColor: '#6B7280' },
    };

    const config = statusConfig[displayStatus] || statusConfig.active;

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.bgColor,
          color: config.textColor,
          fontWeight: 500,
          fontSize: 13,
          borderRadius: '8px',
          height: 28,
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
            backgroundColor: '#FEE2E2',
            color: colors.brandRed,
            fontWeight: 600,
            fontSize: 13,
            borderRadius: '8px',
            height: 28,
          }}
        />
      ),
    },
    {
      id: 'leagueName',
      label: 'League',
      render: (value) => (
        <Chip
          label={value || 'N/A'}
          size="small"
          sx={{
            backgroundColor: '#FEE2E2',
            color: colors.brandRed,
            fontWeight: 600,
            fontSize: 13,
            borderRadius: '8px',
            height: 28,
          }}
        />
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <People sx={{ fontSize: 20, color: colors.brandRed }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandRed, fontSize: 15 }}>
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
        return (
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 14 }}>
            {format(date, 'MMM dd, yyyy HH:mm')}
          </Typography>
        );
      },
    },
    {
      id: 'closeTime',
      label: 'Close Time',
      render: (_, row) => {
        const date = row.closeTime?.toDate ? row.closeTime.toDate() : new Date(row.closeTime);
        return (
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 14 }}>
            {format(date, 'MMM dd, yyyy HH:mm')}
          </Typography>
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_, row) => {
        return (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e, row);
            }}
            sx={{
              backgroundColor: '#FEE2E2',
              color: colors.brandRed,
              width: 40,
              height: 40,
              borderRadius: '12px',
              '&:hover': {
                backgroundColor: '#FECACA',
              },
            }}
          >
            <MoreVert sx={{ fontSize: 20 }} />
          </IconButton>
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
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: colors.brandRed,
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
              fontWeight: 600,
              color: colors.brandBlack,
              fontSize: 30,
            }}
          >
            Poll Management
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: '#9CA3AF',
            fontSize: 14,
            ml: 9,
          }}
        >
          One poll per league • Max 5 active polls
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Card
            sx={{
              padding: 3.5,
              borderRadius: '24px',
              backgroundColor: '#DBEAFE',
              border: 'none',
              boxShadow: 'none',
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <BarChart sx={{ fontSize: 28, color: '#3B82F6', mb: 1.5 }} />
            <Typography variant="h3" sx={{ fontWeight: 500, color: colors.brandBlack, mb: 0.5, fontSize: 32, lineHeight: 1 }}>
              {polls.length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 15, fontWeight: 400 }}>
              Total Polls
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Card
            sx={{
              padding: 3.5,
              borderRadius: '24px',
              backgroundColor: '#D1FAE5',
              border: 'none',
              boxShadow: 'none',
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <PieChart sx={{ fontSize: 28, color: '#10B981', mb: 1.5 }} />
            <Typography variant="h3" sx={{ fontWeight: 500, color: colors.brandBlack, mb: 0.5, fontSize: 32, lineHeight: 1 }}>
              {activePolls.length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 15, fontWeight: 400 }}>
              Active
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Card
            sx={{
              padding: 3.5,
              borderRadius: '24px',
              backgroundColor: '#FEF3C7',
              border: 'none',
              boxShadow: 'none',
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Schedule sx={{ fontSize: 28, color: '#F59E0B', mb: 1.5 }} />
            <Typography variant="h3" sx={{ fontWeight: 500, color: colors.brandBlack, mb: 0.5, fontSize: 32, lineHeight: 1 }}>
              {polls.filter((p) => (p.status || p.pollStatus) === 'pending' || (p.status || p.pollStatus) === 'scheduled').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 15, fontWeight: 400 }}>
              Pending
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Card
            sx={{
              padding: 3.5,
              borderRadius: '24px',
              backgroundColor: '#FECDD3',
              border: 'none',
              boxShadow: 'none',
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <People sx={{ fontSize: 28, color: '#EF4444', mb: 1.5 }} />
            <Typography variant="h3" sx={{ fontWeight: 500, color: colors.brandBlack, mb: 0.5, fontSize: 32, lineHeight: 1 }}>
              {polls.reduce((sum, p) => sum + (p.voteCount || 0), 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 15, fontWeight: 400 }}>
              Total Votes
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
        <Button
          disableRipple
          onClick={() => setStatusFilter('all')}
          startIcon={<ViewModule />}
          sx={{
            minWidth: 240,
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 15,
            px: 3.5,
            py: 2,
            backgroundColor: statusFilter === 'all' ? colors.brandRed : colors.brandWhite,
            color: statusFilter === 'all' ? colors.brandWhite : colors.brandRed,
            border: statusFilter === 'all' ? 'none' : '1px solid #E5E7EB',
            boxShadow: 'none !important',
            '& .MuiButton-startIcon': {
              color: statusFilter === 'all' ? colors.brandWhite : colors.brandRed,
            },
            '&:hover': {
              backgroundColor: statusFilter === 'all' ? colors.brandDarkRed : '#F9FAFB',
              boxShadow: 'none !important',
            },
            '&:active': {
              backgroundColor: statusFilter === 'all' ? colors.brandDarkRed : '#F9FAFB',
            },
          }}
        >
          All Polls
        </Button>
        <Button
          disableRipple
          onClick={() => setStatusFilter('active')}
          startIcon={<PieChart />}
          sx={{
            flex: 1,
            minWidth: 180,
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 15,
            px: 3.5,
            py: 2,
            backgroundColor: statusFilter === 'active' ? '#10B981' : colors.brandWhite,
            color: statusFilter === 'active' ? colors.brandWhite : '#10B981',
            border: statusFilter === 'active' ? 'none' : '1px solid #E5E7EB',
            boxShadow: 'none !important',
            '& .MuiButton-startIcon': {
              color: statusFilter === 'active' ? colors.brandWhite : '#10B981',
            },
            '&:hover': {
              backgroundColor: statusFilter === 'active' ? '#059669' : '#F9FAFB',
              boxShadow: 'none !important',
            },
            '&:active': {
              backgroundColor: statusFilter === 'active' ? '#059669' : '#F9FAFB',
            },
          }}
        >
          Active
        </Button>
        <Button
          disableRipple
          onClick={() => setStatusFilter('scheduled')}
          startIcon={<Schedule />}
          sx={{
            flex: 1,
            minWidth: 180,
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 15,
            px: 3.5,
            py: 2,
            backgroundColor: statusFilter === 'scheduled' ? '#F59E0B' : colors.brandWhite,
            color: statusFilter === 'scheduled' ? colors.brandWhite : '#F59E0B',
            border: statusFilter === 'scheduled' ? 'none' : '1px solid #E5E7EB',
            boxShadow: 'none !important',
            '& .MuiButton-startIcon': {
              color: statusFilter === 'scheduled' ? colors.brandWhite : '#F59E0B',
            },
            '&:hover': {
              backgroundColor: statusFilter === 'scheduled' ? '#D97706' : '#F9FAFB',
              boxShadow: 'none !important',
            },
            '&:active': {
              backgroundColor: statusFilter === 'scheduled' ? '#D97706' : '#F9FAFB',
            },
          }}
        >
          Pending
        </Button>
        <Button
          disableRipple
          onClick={() => setStatusFilter('closed')}
          startIcon={<CheckCircle />}
          sx={{
            flex: 1,
            minWidth: 180,
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 15,
            px: 3.5,
            py: 2,
            backgroundColor: statusFilter === 'closed' ? '#6B7280' : colors.brandWhite,
            color: statusFilter === 'closed' ? colors.brandWhite : '#6B7280',
            border: statusFilter === 'closed' ? 'none' : '1px solid #E5E7EB',
            boxShadow: 'none !important',
            '& .MuiButton-startIcon': {
              color: statusFilter === 'closed' ? colors.brandWhite : '#6B7280',
            },
            '&:hover': {
              backgroundColor: statusFilter === 'closed' ? '#4B5563' : '#F9FAFB',
              boxShadow: 'none !important',
            },
            '&:active': {
              backgroundColor: statusFilter === 'closed' ? '#4B5563' : '#F9FAFB',
            },
          }}
        >
          Closed
        </Button>
      </Box>

      {/* Search Bar and Create Button */}
      <Card
        sx={{
          padding: 3,
          mb: 3,
          borderRadius: '24px',
          backgroundColor: colors.brandWhite,
          border: 'none',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          display: 'flex',
          gap: 2.5,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search polls by ID or league..."
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<Add sx={{ fontSize: 18 }} />}
          onClick={handleCreatePoll}
          disabled={!canCreateMorePolls()}
          sx={{
            backgroundColor: colors.brandRed,
            borderRadius: '16px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 15,
            px: 3.5,
            py: 1.75,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: colors.brandDarkRed,
              boxShadow: 'none',
            },
            '&:disabled': {
              backgroundColor: '#9CA3AF',
              color: colors.brandWhite,
            },
          }}
        >
          Create Poll
        </Button>
      </Card>

      {/* Table Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 4 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: colors.brandRed,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Assignment sx={{ fontSize: 28, color: colors.brandWhite }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 22, mb: 0.25 }}>
            All Polls
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: 14 }}>
            {filteredPolls.length} polls • Page {page + 1} of {Math.ceil(filteredPolls.length / rowsPerPage) || 1}
          </Typography>
        </Box>
      </Box>

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
        onRowClick={handlePollClick}
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

      {/* Poll Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleDetailsDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
            maxWidth: '600px',
          },
        }}
      >
        {pollDetails && (
          <>
            {/* Red Header */}
            <Box
              sx={{
                backgroundColor: colors.brandRed,
                color: colors.brandWhite,
                px: 3,
                py: 2.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BarChart sx={{ fontSize: 24, color: colors.brandWhite }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 20, mb: 0, lineHeight: 1.3 }}>
                    Poll Details
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 13, mt: 0.25 }}>
                    {pollDetails.leagueName}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={handleDetailsDialogClose}
                size="small"
                sx={{
                  color: colors.brandWhite,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Close sx={{ fontSize: 24 }} />
              </IconButton>
            </Box>

            <DialogContent sx={{ p: 0, backgroundColor: colors.brandWhite }}>
              {/* Poll Information */}
              <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16, mb: 2, color: colors.brandBlack }}>
                  Poll Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: `1px solid #E5E7EB` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <LocalOffer sx={{ fontSize: 18, color: colors.brandRed }} />
                      <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 14 }}>
                        Poll ID
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14, color: colors.brandBlack }}>
                      {pollDetails.pollId}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: `1px solid #E5E7EB` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Assignment sx={{ fontSize: 18, color: colors.brandRed }} />
                      <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 14 }}>
                        League
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14, color: colors.brandBlack }}>
                      {pollDetails.leagueName}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: `1px solid #E5E7EB` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Info sx={{ fontSize: 18, color: colors.brandRed }} />
                      <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 14 }}>
                        Status
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14, color: colors.brandBlack }}>
                      {pollDetails.status === 'closed' ? 'Closed' : pollDetails.status === 'active' ? 'Active' : 'Pending'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <People sx={{ fontSize: 18, color: colors.brandRed }} />
                      <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 14 }}>
                        Total Votes
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14, color: colors.brandBlack }}>
                      {pollDetails.voteCount?.toLocaleString() || 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Timing */}
              <Box sx={{ px: 3, py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16, mb: 2, color: colors.brandBlack }}>
                  Timing
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: `1px solid #E5E7EB` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Schedule sx={{ fontSize: 18, color: colors.brandRed }} />
                      <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 14 }}>
                        Start Time
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14, color: colors.brandBlack }}>
                      {format(pollDetails.startTime instanceof Date ? pollDetails.startTime : new Date(pollDetails.startTime), 'MMM dd, yyyy • HH:mm')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Schedule sx={{ fontSize: 18, color: colors.brandRed }} />
                      <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 14 }}>
                        Close Time
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14, color: colors.brandBlack }}>
                      {format(pollDetails.closeTime instanceof Date ? pollDetails.closeTime : new Date(pollDetails.closeTime), 'MMM dd, yyyy • HH:mm')}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Admin Details */}
              <Box sx={{ px: 3, py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16, mb: 2, color: colors.brandBlack }}>
                  Admin Details
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: `1px solid #E5E7EB` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Person sx={{ fontSize: 18, color: colors.brandRed }} />
                      <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 14 }}>
                        Created By
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14, color: colors.brandBlack }}>
                      Super Admin
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <CalendarToday sx={{ fontSize: 18, color: colors.brandRed }} />
                      <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 14 }}>
                        Created At
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14, color: colors.brandBlack }}>
                      {format(pollDetails.createdAt instanceof Date ? pollDetails.createdAt : new Date(pollDetails.createdAt), 'MMM dd, yyyy • HH:mm')}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Winner Preview (Admin Only) */}
              <Box sx={{ mx: 3, my: 2.5, p: 2.5, backgroundColor: '#ECFDF5', borderRadius: '12px', border: '1px solid #D1FAE5' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Star sx={{ fontSize: 22, color: '#16A34A' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#16A34A', fontSize: 13, fontWeight: 600, mb: 0.25 }}>
                      Winner Preview (Admin Only)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16, color: colors.brandBlack }}>
                      PSG
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Close Button */}
              <Box sx={{ px: 3, pb: 3 }}>
                <Button
                  fullWidth
                  onClick={handleDetailsDialogClose}
                  sx={{
                    backgroundColor: '#F9FAFB',
                    color: '#6B7280',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: 15,
                    py: 1.5,
                    boxShadow: 'none',
                    border: '1px solid #E5E7EB',
                    '&:hover': {
                      backgroundColor: '#F3F4F6',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Close
                </Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PollsPage;
