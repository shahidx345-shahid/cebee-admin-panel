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
  Menu,
  Avatar,
} from '@mui/material';
import {
  Add,
  AttachMoney,
  CheckCircle,
  Schedule,
  Cancel,
  Star,
  Refresh,
  AllInclusive,
  CalendarToday,
  ViewModule,
  ArrowDropDown,
  ArrowDownward,
  MoreVert,
  EmojiEvents,
  AccountBalanceWallet,
  VerifiedUser,
  Person,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';

const RewardsPage = () => {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [filteredRewards, setFilteredRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState('all');
  const [rankFilter, setRankFilter] = useState('1st-3rd');
  const [selectedSort, setSelectedSort] = useState('rankLowest');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rankAnchor, setRankAnchor] = useState(null);
  const [monthAnchor, setMonthAnchor] = useState(null);
  const [statusAnchor, setStatusAnchor] = useState(null);
  const [actionsAnchor, setActionsAnchor] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthLabel = format(new Date(), 'MMMM yyyy');
  
  const currentMonthWinners = rewards.filter((r) => {
    const rewardMonth = r.rewardMonth || '';
    return rewardMonth.startsWith(currentMonth) && (r.rank || 0) <= 3;
  });
  
  const pendingPayouts = rewards.filter((r) => 
    (r.status || r.rewardStatus) === 'pending'
  ).length;
  
  const processingCount = rewards.filter((r) => 
    (r.status || r.rewardStatus) === 'processing'
  ).length;
  
  const totalPaid = currentMonthWinners
    .filter((r) => (r.status || r.rewardStatus) === 'paid')
    .reduce((sum, r) => sum + (r.usdAmount || r.rewardAmount || 0), 0);

  useEffect(() => {
    loadRewards();
  }, []);

  useEffect(() => {
    filterAndSortRewards();
  }, [rewards, searchQuery, selectedMonth, statusFilter, rankFilter, selectedSort]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const rewardsRef = collection(db, 'rewards');
      const q = query(rewardsRef, orderBy('rewardMonth', 'desc'), orderBy('rank', 'asc'));
      const snapshot = await getDocs(q);
      const rewardsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRewards(rewardsData);
      setFilteredRewards(rewardsData);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRewards = () => {
    let filtered = [...rewards];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (reward) =>
          reward.username?.toLowerCase().includes(query) ||
          reward.userEmail?.toLowerCase().includes(query) ||
          reward.id?.toLowerCase().includes(query)
      );
    }

    if (selectedMonth && selectedMonth !== 'all') {
      filtered = filtered.filter((reward) => {
        const rewardMonth = reward.rewardMonth || '';
        return rewardMonth.startsWith(selectedMonth);
      });
    }

    if (rankFilter && rankFilter !== 'all') {
      filtered = filtered.filter((reward) => {
        const rank = reward.rank || 0;
        if (rankFilter === '1st') return rank === 1;
        if (rankFilter === '2nd') return rank === 2;
        if (rankFilter === '3rd') return rank === 3;
        if (rankFilter === '1st-3rd') return rank >= 1 && rank <= 3;
        return true;
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((reward) => {
        const status = reward.status || reward.rewardStatus;
        return status === statusFilter;
      });
    }

    switch (selectedSort) {
      case 'rankLowest':
        filtered.sort((a, b) => (a.rank || 0) - (b.rank || 0));
        break;
      case 'rankHighest':
        filtered.sort((a, b) => (b.rank || 0) - (a.rank || 0));
        break;
      case 'spHighest':
        filtered.sort((a, b) => (b.spTotal || 0) - (a.spTotal || 0));
        break;
      case 'spLowest':
        filtered.sort((a, b) => (a.spTotal || 0) - (b.spTotal || 0));
        break;
      default:
        break;
    }

    setFilteredRewards(filtered);
  };

  const getStatusChip = (status) => {
    const statusMap = {
      pending: 'PENDING',
      processing: 'PROCESSING',
      paid: 'PAID',
      failed: 'FAILED',
      cancelled: 'CANCELLED',
    };
    
    const label = statusMap[status] || 'PENDING';
    const isProcessing = status === 'processing';
    
    return (
      <Chip
        label={label}
        size="small"
        sx={{
          backgroundColor: isProcessing ? colors.info : colors.brandWhite,
          color: isProcessing ? colors.brandWhite : colors.brandBlack,
          border: isProcessing ? 'none' : `1.5px solid ${colors.divider}66`,
          fontWeight: 700,
          fontSize: 11,
          height: 28,
          borderRadius: '6px',
        }}
      />
    );
  };

  const handleActionsOpen = (event, reward) => {
    setActionsAnchor(event.currentTarget);
    setSelectedReward(reward);
  };

  const handleActionsClose = () => {
    setActionsAnchor(null);
    setSelectedReward(null);
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <EmojiEvents sx={{ fontSize: 20, color: '#FFD700' }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandBlack }}>
            1st
          </Typography>
        </Box>
      );
    }
    if (rank === 2) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <EmojiEvents sx={{ fontSize: 20, color: '#C0C0C0' }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandBlack }}>
            2nd
          </Typography>
        </Box>
      );
    }
    if (rank === 3) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <EmojiEvents sx={{ fontSize: 20, color: '#CD7F32' }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandBlack }}>
            3rd
          </Typography>
        </Box>
      );
    }
    return (
      <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandBlack }}>
        {rank}th
      </Typography>
    );
  };

  const columns = [
    {
      id: 'rank',
      label: 'Rank',
      render: (value) => getRankBadge(value),
    },
    {
      id: 'username',
      label: 'Winner',
      render: (value, row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
            {value || 'N/A'}
          </Typography>
          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 11 }}>
            {row.userEmail || row.email || 'No email'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'spTotal',
      label: 'SP Total',
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.warning }}>
          {value?.toLocaleString() || '0'}
        </Typography>
      ),
    },
    {
      id: 'usdAmount',
      label: 'Reward',
      render: (value, row) => {
        const amount = value || row.rewardAmount || 0;
        return (
          <Typography variant="body2" sx={{ fontWeight: 700, color: colors.brandRed }}>
            ${amount.toFixed(0)}
          </Typography>
        );
      },
    },
    {
      id: 'payoutMethod',
      label: 'Payout Method',
      render: (value, row) => {
        const method = value || row.payoutMethod || 'USDT';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                backgroundColor: colors.success,
                fontSize: 14,
              }}
            >
              <AttachMoney sx={{ fontSize: 14 }} />
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500, color: colors.brandBlack }}>
              {method}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'kycStatus',
      label: 'KYC Status',
      render: (value, row) => {
        const isVerified = value || row.kycVerified || row.kycStatus === 'verified';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle sx={{ fontSize: 18, color: isVerified ? colors.success : colors.textSecondary }} />
            <Typography variant="body2" sx={{ fontWeight: 500, color: colors.brandBlack }}>
              {isVerified ? 'Verified' : 'Pending'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => getStatusChip(row.status || row.rewardStatus),
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

  const paginatedRewards = filteredRewards.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box
            sx={{
              padding: 1.5,
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '14px',
              border: `2px solid ${colors.brandWhite}`,
            }}
          >
            <AttachMoney sx={{ fontSize: 28, color: colors.brandWhite }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.brandBlack,
              fontSize: { xs: 24, md: 28 },
            }}
          >
            Monthly SP Rewards
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
          Manage payouts for Top 3 Monthly SP Leaderboard winners.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
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
            <Box
              sx={{
                padding: 1.25,
                backgroundColor: `${colors.warning}1F`,
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <Star sx={{ fontSize: 24, color: '#FFD700' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {currentMonthWinners.length}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 13, mb: 0.25 }}>
              Current Month Winners
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 11 }}>
              Top 3 from {currentMonthLabel}
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
            <Box
              sx={{
                padding: 1.25,
                backgroundColor: `${colors.info}1F`,
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <Schedule sx={{ fontSize: 24, color: colors.info }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {pendingPayouts}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 13, mb: 0.25 }}>
              Pending Payouts
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 11 }}>
              Awaiting KYC or approval
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
                mb: 1.5,
              }}
            >
              <Refresh sx={{ fontSize: 24, color: colors.success }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {processingCount}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 13, mb: 0.25 }}>
              Processing
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 11 }}>
              KYC verified, ready to pay
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: colors.brandWhite,
              border: `1.5px solid ${colors.brandRed}26`,
              borderRadius: '20px',
              boxShadow: `0 6px 14px ${colors.brandRed}1F`,
            }}
          >
            <Box
              sx={{
                padding: 1.25,
                backgroundColor: `${colors.brandRed}1F`,
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <CheckCircle sx={{ fontSize: 24, color: colors.brandRed }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              ${totalPaid.toFixed(0)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 13, mb: 0.25 }}>
              Total Paid (Current)
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 11 }}>
              Payouts completed
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search Bar */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by username or e..."
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                backgroundColor: colors.brandRed,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: -0.5,
              }}
            >
              <ArrowDownward sx={{ fontSize: 14, color: colors.brandWhite }} />
            </Box>
          }
          endIcon={<ArrowDropDown sx={{ fontSize: 16, color: colors.brandRed }} />}
          onClick={(e) => setRankAnchor(e.currentTarget)}
          sx={{
            borderColor: `${colors.brandRed}33`,
            color: colors.brandBlack,
            backgroundColor: `${colors.brandRed}0D`,
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1,
          }}
        >
          Rank: {rankFilter === '1st-3rd' ? '1st to 3rd' : 
                 rankFilter === '1st' ? '1st' :
                 rankFilter === '2nd' ? '2nd' :
                 rankFilter === '3rd' ? '3rd' : '1st to 3rd'}
        </Button>
        <Menu
          anchorEl={rankAnchor}
          open={Boolean(rankAnchor)}
          onClose={() => setRankAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 180,
              boxShadow: `0 4px 12px ${colors.shadow}33`,
            },
          }}
        >
          <MenuItem onClick={() => { setRankFilter('1st-3rd'); setRankAnchor(null); }}>
            1st to 3rd
          </MenuItem>
          <MenuItem onClick={() => { setRankFilter('1st'); setRankAnchor(null); }}>
            1st
          </MenuItem>
          <MenuItem onClick={() => { setRankFilter('2nd'); setRankAnchor(null); }}>
            2nd
          </MenuItem>
          <MenuItem onClick={() => { setRankFilter('3rd'); setRankAnchor(null); }}>
            3rd
          </MenuItem>
        </Menu>
        <Button
          variant="outlined"
          startIcon={
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                backgroundColor: colors.brandRed,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: -0.5,
              }}
            >
              <CalendarToday sx={{ fontSize: 14, color: colors.brandWhite }} />
            </Box>
          }
          endIcon={<ArrowDropDown sx={{ fontSize: 16, color: colors.brandRed }} />}
          onClick={(e) => setMonthAnchor(e.currentTarget)}
          sx={{
            borderColor: `${colors.brandRed}33`,
            color: colors.brandBlack,
            backgroundColor: `${colors.brandRed}0D`,
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1,
          }}
        >
          {selectedMonth === 'all' ? 'All Months' : format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
        </Button>
        <Menu
          anchorEl={monthAnchor}
          open={Boolean(monthAnchor)}
          onClose={() => setMonthAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 200,
              boxShadow: `0 4px 12px ${colors.shadow}33`,
            },
          }}
        >
          <MenuItem onClick={() => { setSelectedMonth('all'); setMonthAnchor(null); }}>
            All Months
          </MenuItem>
          {Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthValue = date.toISOString().slice(0, 7);
            const monthLabel = format(date, 'MMMM yyyy');
            return (
              <MenuItem key={monthValue} onClick={() => { setSelectedMonth(monthValue); setMonthAnchor(null); }}>
                {monthLabel}
              </MenuItem>
            );
          })}
        </Menu>
        <Button
          variant="outlined"
          startIcon={
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                backgroundColor: colors.brandRed,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: -0.5,
              }}
            >
              <ViewModule sx={{ fontSize: 14, color: colors.brandWhite }} />
            </Box>
          }
          endIcon={<ArrowDropDown sx={{ fontSize: 16, color: colors.brandRed }} />}
          onClick={(e) => setStatusAnchor(e.currentTarget)}
          sx={{
            borderColor: `${colors.brandRed}33`,
            color: colors.brandBlack,
            backgroundColor: `${colors.brandRed}0D`,
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1,
          }}
        >
          {statusFilter === 'all' ? 'All Statuses' : 
           statusFilter === 'pending' ? 'Pending' :
           statusFilter === 'processing' ? 'Processing' :
           statusFilter === 'paid' ? 'Paid' : 'All Statuses'}
        </Button>
        <Menu
          anchorEl={statusAnchor}
          open={Boolean(statusAnchor)}
          onClose={() => setStatusAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 180,
              boxShadow: `0 4px 12px ${colors.shadow}33`,
            },
          }}
        >
          <MenuItem onClick={() => { setStatusFilter('all'); setStatusAnchor(null); }}>
            All Statuses
          </MenuItem>
          <MenuItem onClick={() => { setStatusFilter('pending'); setStatusAnchor(null); }}>
            Pending
          </MenuItem>
          <MenuItem onClick={() => { setStatusFilter('processing'); setStatusAnchor(null); }}>
            Processing
          </MenuItem>
          <MenuItem onClick={() => { setStatusFilter('paid'); setStatusAnchor(null); }}>
            Paid
          </MenuItem>
          <MenuItem onClick={() => { setStatusFilter('failed'); setStatusAnchor(null); }}>
            Failed
          </MenuItem>
        </Menu>
      </Box>

      {/* Monthly Rewards Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            padding: 0.75,
            backgroundColor: colors.brandRed,
            borderRadius: '8px',
          }}
        >
          <AttachMoney sx={{ fontSize: 18, color: colors.brandWhite }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: colors.brandBlack,
            fontSize: 18,
          }}
        >
          Monthly Rewards
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: colors.textSecondary,
            fontSize: 13,
            ml: 1,
          }}
        >
          {filteredRewards.length} rewards found
        </Typography>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedRewards}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredRewards.length}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onRowClick={(row) => navigate(`/rewards/details/${row.id}`)}
        emptyMessage="No rewards found"
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
            if (selectedReward) {
              navigate(`/rewards/details/${selectedReward.id}`);
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
          Process Payout
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleActionsClose();
          }}
          sx={{ color: colors.error }}
        >
          Cancel Reward
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default RewardsPage;
