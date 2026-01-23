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
  SportsSoccer,
  VerifiedUser,
  HighlightOff,
  Description,
} from '@mui/icons-material';
import { colors } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';

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
  const [closePollDialogOpen, setClosePollDialogOpen] = useState(false);
  const [pollToClose, setPollToClose] = useState(null);

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

  const handleClosePoll = (poll) => {
    setPollToClose(poll);
    setClosePollDialogOpen(true);
    handleMenuClose();
  };

  const confirmClosePoll = async () => {
    if (!pollToClose) return;

    try {
      // Update local state
      const updatedPolls = polls.map((p) =>
        p.id === pollToClose.id ? { ...p, status: 'closed' } : p
      );
      setPolls(updatedPolls);
      setFilteredPolls(updatedPolls);
      setClosePollDialogOpen(false);
      setPollToClose(null);
      alert('Poll closed successfully!'); // Keep alert for final feedback or remove if desired
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

      {/* Filter Strip */}
      <Card
        sx={{
          mb: 3,
          p: 1,
          borderRadius: '20px',
          backgroundColor: colors.brandWhite,
          border: 'none',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'all', label: 'All Polls', icon: <ViewModule />, color: colors.brandRed, bgColor: '#FEE2E2' },
          { id: 'active', label: 'Active', icon: <PieChart />, color: '#10B981', bgColor: '#D1FAE5' },
          { id: 'scheduled', label: 'Pending', icon: <Schedule />, color: '#F59E0B', bgColor: '#FEF3C7' },
          { id: 'closed', label: 'Closed', icon: <CheckCircle />, color: '#6B7280', bgColor: '#F3F4F6' },
        ].map((item) => {
          const isSelected = statusFilter === item.id;
          return (
            <Button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              disableRipple
              sx={{
                flex: 1,
                minWidth: 120,
                borderRadius: '16px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 15,
                py: 1.5,
                backgroundColor: isSelected ? item.color : 'transparent',
                color: isSelected ? colors.brandWhite : colors.brandBlack,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: isSelected ? item.color : item.bgColor,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : item.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? colors.brandWhite : item.color,
                  }}
                >
                  {React.cloneElement(item.icon, { sx: { fontSize: 18 } })}
                </Box>
                {item.label}
              </Box>
            </Button>
          );
        })}
      </Card>

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

      {/* Close Poll Confirmation Dialog */}
      <Dialog
        open={closePollDialogOpen}
        onClose={() => setClosePollDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
            maxWidth: '700px',
          },
        }}
      >
        <Box sx={{ p: 0 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 3, pb: 1 }}>
            <HighlightOff sx={{ color: colors.brandRed, fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: colors.brandBlack }}>
              Close Poll Manually
            </Typography>
          </Box>

          <DialogContent sx={{ p: 3, pt: 1 }}>
            {/* Header Info Card */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  backgroundColor: '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #FECACA',
                }}
              >
                <SportsSoccer sx={{ fontSize: 24, color: colors.brandRed }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>
                  {pollToClose?.leagueName || 'League Name'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 14 }}>
                  {pollToClose?.voteCount?.toLocaleString() || 0} total votes
                </Typography>
              </Box>
            </Box>

            {/* Results Section */}
            <Typography variant="subtitle2" sx={{ color: colors.textSecondary, mb: 1.5, fontWeight: 600 }}>
              Current Results (Admin Only)
            </Typography>
            <Box
              sx={{
                backgroundColor: '#FEF2F2',
                borderRadius: '16px',
                p: 2,
                mb: 3,
                border: '1px solid #FECACA',
              }}
            >
              {/* Mock Data Matching Screenshot */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ fontSize: 16, color: '#F59E0B' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandRed, fontSize: 14 }}>
                    Real Madrid
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandRed, fontSize: 14 }}>
                  38.2%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, pl: 2.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: colors.brandBlack, fontSize: 14 }}>
                  Barcelona
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: colors.brandBlack, fontSize: 14 }}>
                  32.1%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, pl: 2.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: colors.brandBlack, fontSize: 14 }}>
                  Atletico Madrid
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: colors.brandBlack, fontSize: 14 }}>
                  18.5%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 2.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: colors.brandBlack, fontSize: 14 }}>
                  Sevilla
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: colors.brandBlack, fontSize: 14 }}>
                  11.2%
                </Typography>
              </Box>
            </Box>

            {/* Featured Match Banner */}
            <Box
              sx={{
                backgroundColor: '#ECFDF5',
                borderRadius: '12px',
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                border: '1px solid #6EE7B7',
                mb: 3
              }}
            >
              <VerifiedUser sx={{ color: '#10B981', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: '#065F46', fontWeight: 600, fontSize: 14 }}>
                Featured Match: Real Madrid vs Barcelona
              </Typography>
            </Box>

            {/* Log Warning */}
            <Box
              sx={{
                backgroundColor: '#FFF7ED',
                borderRadius: '16px',
                p: 2,
                border: '1px solid #FED7AA',
                display: 'flex',
                gap: 2
              }}
            >
              <Description sx={{ color: '#F59E0B', fontSize: 24, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#F97316', fontWeight: 700, mb: 0.5 }}>
                  This action will be logged:
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', lineHeight: 1.6 }}>
                  • Close Type: Manual <br />
                  • Closed By: Super Admin <br />
                  • Closed At: {format(new Date(), 'MMM dd, yyyy HH:mm')}
                </Typography>
              </Box>
            </Box>

          </DialogContent>

          <Box sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button
              onClick={() => setClosePollDialogOpen(false)}
              variant="text"
              sx={{
                color: colors.textSecondary,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: 15,
                '&:hover': { backgroundColor: '#F3F4F6' }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmClosePoll}
              variant="contained"
              sx={{
                backgroundColor: '#DC2626',
                color: 'white',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
                fontSize: 15,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#B91C1C',
                  boxShadow: 'none',
                }
              }}
            >
              Close Poll
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default PollsPage;
