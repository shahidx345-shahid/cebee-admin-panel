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
  Search as SearchIcon,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import DataTable from '../components/common/DataTable';
import { format } from 'date-fns';

// Static rewards data
const staticRewardsData = [
  {
    id: '1',
    rank: 1,
    username: 'ChiefPredictor',
    userEmail: 'chief@example.com',
    spTotal: 2850,
    usdAmount: 500,
    payoutMethod: 'USDT',
    kycVerified: true,
    kycStatus: 'verified',
    status: 'processing',
    rewardMonth: '2025-09',
  },
  {
    id: '2',
    rank: 2,
    username: 'KingOfPredictions',
    userEmail: 'king@example.com',
    spTotal: 2780,
    usdAmount: 300,
    payoutMethod: 'Gift Card',
    kycVerified: false,
    kycStatus: 'under_review',
    status: 'pending',
    rewardMonth: '2025-09',
  },
  {
    id: '3',
    rank: 3,
    username: 'AfricanLegend',
    userEmail: 'legend@example.com',
    spTotal: 2650,
    usdAmount: 150,
    payoutMethod: 'USDT',
    kycVerified: false,
    kycStatus: 'under_review',
    status: 'pending',
    rewardMonth: '2025-09',
  },
];

const RewardsPage = () => {
  const navigate = useNavigate();
  const [rewards] = useState(staticRewardsData);
  const [filteredRewards, setFilteredRewards] = useState(staticRewardsData);
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2025-09');
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
    filterAndSortRewards();
  }, [rewards, searchQuery, selectedMonth, statusFilter, rankFilter, selectedSort]);

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
          backgroundColor: 'transparent',
          color: isProcessing ? '#42A5F5' : '#FF9800',
          border: `2px solid ${isProcessing ? '#42A5F5' : '#FF9800'}`,
          fontWeight: 700,
          fontSize: 13,
          height: 32,
          borderRadius: '8px',
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
        <Chip
          label={value?.toLocaleString() || '0'}
          size="small"
          sx={{
            backgroundColor: '#FFF4E6',
            color: '#FF9800',
            fontWeight: 700,
            fontSize: 14,
            height: 32,
            borderRadius: '8px',
            border: 'none',
          }}
        />
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
        const isGiftCard = method.toLowerCase().includes('gift');
        return (
          <Chip
            icon={
              isGiftCard ? (
                <AccountBalanceWallet sx={{ fontSize: 16, color: '#42A5F5 !important' }} />
              ) : (
                <AttachMoney sx={{ fontSize: 16, color: '#66BB6A !important' }} />
              )
            }
            label={method}
            size="small"
            sx={{
              backgroundColor: isGiftCard ? '#E3F2FD' : '#E8F5E9',
              color: isGiftCard ? '#42A5F5' : '#66BB6A',
              fontWeight: 600,
              fontSize: 13,
              height: 32,
              borderRadius: '20px',
              border: 'none',
              '& .MuiChip-icon': {
                marginLeft: '8px',
              },
            }}
          />
        );
      },
    },
    {
      id: 'kycStatus',
      label: 'KYC Status',
      render: (value, row) => {
        const kycStatus = row.kycStatus || (row.kycVerified ? 'verified' : 'under_review');
        const isVerified = kycStatus === 'verified';
        return (
          <Chip
            icon={isVerified ? <CheckCircle sx={{ fontSize: 16, color: '#66BB6A !important' }} /> : <VerifiedUser sx={{ fontSize: 16, color: '#FF9800 !important' }} />}
            label={isVerified ? 'Verified' : 'Under Review'}
            size="small"
            sx={{
              backgroundColor: isVerified ? '#E8F5E9' : '#FFF4E6',
              color: isVerified ? '#66BB6A' : '#FF9800',
              fontWeight: 600,
              fontSize: 13,
              height: 32,
              borderRadius: '20px',
              border: 'none',
              '& .MuiChip-icon': {
                marginLeft: '8px',
              },
            }}
          />
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
            backgroundColor: '#FFE0E0',
            color: colors.brandRed,
            width: 36,
            height: 36,
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: '#FFCCCC',
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
      {/* Header Card */}
      <Card
        sx={{
          padding: 3,
          mb: 3,
          borderRadius: '16px',
          backgroundColor: colors.brandWhite,
          border: `1.5px solid ${colors.divider}26`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              backgroundColor: colors.brandRed,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AttachMoney sx={{ fontSize: 32, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: colors.brandBlack,
                fontSize: 22,
                mb: 0.5,
              }}
            >
              Monthly SP Rewards
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.textSecondary,
                fontSize: 14,
              }}
            >
              Manage payouts for Top 3 Monthly SP Leaderboard winners
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: '#FFF8F0',
              border: 'none',
              borderRadius: '16px',
              boxShadow: 'none',
              height: '100%',
              minHeight: '160px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                padding: 1.25,
                backgroundColor: '#FFF5E6',
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <Star sx={{ fontSize: 24, color: '#FFA726' }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 1, fontSize: 36 }}>
              {currentMonthWinners.length}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4A4A4A', fontSize: 14, mb: 0.5 }}>
              Current Month Winners
            </Typography>
            <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: 12 }}>
              Top 3 from November 2025
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: '#F0F7FF',
              border: 'none',
              borderRadius: '16px',
              boxShadow: 'none',
              height: '100%',
              minHeight: '160px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                padding: 1.25,
                backgroundColor: '#E3F2FD',
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <Schedule sx={{ fontSize: 24, color: '#42A5F5' }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 1, fontSize: 36 }}>
              {pendingPayouts}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4A4A4A', fontSize: 14, mb: 0.5 }}>
              Pending Payouts
            </Typography>
            <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: 12 }}>
              Awaiting KYC or approval
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: '#F0F9F1',
              border: 'none',
              borderRadius: '16px',
              boxShadow: 'none',
              height: '100%',
              minHeight: '160px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                padding: 1.25,
                backgroundColor: '#E8F5E9',
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <Refresh sx={{ fontSize: 24, color: '#66BB6A' }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 1, fontSize: 36 }}>
              {processingCount}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4A4A4A', fontSize: 14, mb: 0.5 }}>
              Processing
            </Typography>
            <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: 12 }}>
              KYC verified, ready to pay
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: '#FFF5F5',
              border: 'none',
              borderRadius: '16px',
              boxShadow: 'none',
              height: '100%',
              minHeight: '160px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                padding: 1.25,
                backgroundColor: '#FFEBEE',
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <CheckCircle sx={{ fontSize: 24, color: '#EF5350' }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 1, fontSize: 36 }}>
              ${totalPaid.toFixed(0)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4A4A4A', fontSize: 14, mb: 0.5 }}>
              Total Paid (Current)
            </Typography>
            <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: 12 }}>
              Payouts completed
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search Bar */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        {/* Search Bar */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              padding: '16px 24px',
              backgroundColor: '#F9F9F9',
              borderRadius: '30px',
              border: 'none',
              width: '100%',
            }}
          >
            <SearchIcon sx={{ fontSize: 22, color: colors.brandRed }} />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                flex: 1,
                fontSize: '15px',
                color: '#4A4A4A',
                backgroundColor: 'transparent',
                width: '100%',
              }}
            />
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: '#FFB4B4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: -0.5,
              }}
            >
              <ArrowDownward sx={{ fontSize: 18, color: colors.brandWhite }} />
            </Box>
          }
          endIcon={<ArrowDropDown sx={{ fontSize: 22, color: colors.brandRed }} />}
          onClick={(e) => setRankAnchor(e.currentTarget)}
          sx={{
            borderColor: '#FFE0E0',
            color: colors.brandBlack,
            backgroundColor: '#FFF5F5',
            borderRadius: '30px',
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            py: 1.75,
            fontSize: 15,
            border: '1.5px solid #FFE0E0',
            width: '100%',
            '&:hover': {
              borderColor: '#FFCCCC',
              backgroundColor: '#FFF0F0',
            },
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
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: '#FFB4B4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: -0.5,
              }}
            >
              <CalendarToday sx={{ fontSize: 18, color: colors.brandWhite }} />
            </Box>
          }
          endIcon={<ArrowDropDown sx={{ fontSize: 22, color: colors.brandRed }} />}
          onClick={(e) => setMonthAnchor(e.currentTarget)}
          sx={{
            borderColor: '#FFE0E0',
            color: colors.brandBlack,
            backgroundColor: '#FFF5F5',
            borderRadius: '30px',
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            py: 1.75,
            fontSize: 15,
            border: '1.5px solid #FFE0E0',
            width: '100%',
            '&:hover': {
              borderColor: '#FFCCCC',
              backgroundColor: '#FFF0F0',
            },
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
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: '#FFB4B4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: -0.5,
              }}
            >
              <ViewModule sx={{ fontSize: 18, color: colors.brandWhite }} />
            </Box>
          }
          endIcon={<ArrowDropDown sx={{ fontSize: 22, color: colors.brandRed }} />}
          onClick={(e) => setStatusAnchor(e.currentTarget)}
          sx={{
            borderColor: '#FFE0E0',
            color: colors.brandBlack,
            backgroundColor: '#FFF5F5',
            borderRadius: '30px',
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            py: 1.75,
            fontSize: 15,
            border: '1.5px solid #FFE0E0',
            width: '100%',
            '&:hover': {
              borderColor: '#FFCCCC',
              backgroundColor: '#FFF0F0',
            },
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
      <Card
        sx={{
          padding: 2.5,
          mb: 0,
          borderRadius: '16px 16px 0 0',
          backgroundColor: '#FFF5F5',
          border: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              backgroundColor: colors.brandRed,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AttachMoney sx={{ fontSize: 28, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, fontSize: 18 }}>
              Monthly Rewards
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              {filteredRewards.length} rewards found
            </Typography>
          </Box>
        </Box>
      </Card>

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
