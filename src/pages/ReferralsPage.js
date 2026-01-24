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
  IconButton,
  Menu,
  Tooltip,
} from '@mui/material';
import {
  CardGiftcard,
  CheckCircle,
  Star,
  PersonAdd,
  ArrowDropDown,
  ViewModule,
  Public,
  MoreVert,
  CalendarToday,
  ArrowUpward,
  ArrowDownward,
  Check,
  Flag,
  Navigation,
  Sort,
  CheckCircleOutline,
  Campaign,
  Warning,
  EmojiEvents,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import ReferralDetailsView from '../components/referrals/ReferralDetailsView';

import { format } from 'date-fns';

const ReferralsPage = () => {
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('dateNewest');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateMenuAnchor, setDateMenuAnchor] = useState(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [countryMenuAnchor, setCountryMenuAnchor] = useState(null);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedRowForAction, setSelectedRowForAction] = useState(null);
  const [timePeriod, setTimePeriod] = useState('allTime'); // 'allTime' or 'monthly'
  const [timePeriodMenuAnchor, setTimePeriodMenuAnchor] = useState(null);

  const handleActionMenuOpen = (event, row) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedRowForAction(row);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedRowForAction(null);
  };

  const handleViewDetails = () => {
    setSelectedReferral(selectedRowForAction);
    handleActionMenuClose();
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  useEffect(() => {
    filterAndSortReferrals();
  }, [referrals, searchQuery, statusFilter, countryFilter, selectedSort, timePeriod]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      // Mock Data matching screenshot with Phase 1 refinements
      const mockReferrals = [
        { id: '1', referrerId: 'USR_1001', referrerUsername: 'PredictionMaster', referrerEmail: 'predmaster@example.com', referrerCountry: 'Nigeria', referredId: 'USR_2001', referredUsername: 'FootballFan2025', referredEmail: 'footballfan2025@example.com', referredCountry: 'Algeria', cpAwarded: 10, status: 'valid', referralDate: new Date('2026-01-15'), source: 'Invite Link', risk: false },
        { id: '2', referrerId: 'USR_1002', referrerUsername: 'AfricanLegend', referrerEmail: 'legend@example.com', referrerCountry: 'Ghana', referredId: 'USR_2002', referredUsername: 'MatchMaster', referredEmail: 'matchmaster@example.com', referredCountry: 'Ivory Coast', cpAwarded: 10, status: 'valid', referralDate: new Date('2026-01-12'), source: 'Manual Code', risk: false },
        { id: '3', referrerId: 'USR_1003', referrerUsername: 'GoalMachine', referrerEmail: 'goalmachine@example.com', referrerCountry: 'Kenya', referredId: 'USR_2003', referredUsername: 'TopScorer', referredEmail: 'topscorer@example.com', referredCountry: 'Senegal', cpAwarded: 10, status: 'valid', referralDate: new Date('2026-01-10'), source: 'Campaign', risk: false },
        { id: '4', referrerId: 'USR_1004', referrerUsername: 'ScoreKing', referrerEmail: 'scoreking@example.com', referrerCountry: 'South Africa', referredId: 'USR_2004', referredUsername: 'ProPredictor', referredEmail: 'propredictor@example.com', referredCountry: 'Uganda', cpAwarded: 0, status: 'flagged', statusReason: 'Duplicate device detected', referralDate: new Date('2026-01-08'), source: 'Invite Link', risk: true, riskReason: 'Duplicate IP' },
        { id: '5', referrerId: 'USR_1005', referrerUsername: 'ChiefPredictor', referrerEmail: 'chief@example.com', referrerCountry: 'Egypt', referredId: 'USR_2005', referredUsername: 'WinnerTakes', referredEmail: 'winnertakes@example.com', referredCountry: 'Tanzania', cpAwarded: 10, status: 'valid', referralDate: new Date('2025-12-05'), source: 'Invite Link', risk: false },
        { id: '6', referrerId: 'USR_1006', referrerUsername: 'FootballWizard', referrerEmail: 'wizard@example.com', referrerCountry: 'Morocco', referredId: 'USR_2006', referredUsername: 'BetKing', referredEmail: 'betking@example.com', referredCountry: 'Cameroon', cpAwarded: 10, status: 'valid', referralDate: new Date('2025-12-01'), source: 'Manual Code', risk: false },
        { id: '7', referrerId: 'USR_1007', referrerUsername: 'KingOfPredictions', referrerEmail: 'kingpred@example.com', referrerCountry: 'Nigeria', referredId: 'USR_2007', referredUsername: 'MatchDay', referredEmail: 'matchday@example.com', referredCountry: 'Morocco', cpAwarded: 0, status: 'invalid', statusReason: 'Self-referral', referralDate: new Date('2025-11-28'), source: 'Invite Link', risk: true, riskReason: 'Self-referral' },
        // Added another referral for PredictionMaster (USR_1001) to test aggregation
        { id: '8', referrerId: 'USR_1001', referrerUsername: 'PredictionMaster', referrerEmail: 'predmaster@example.com', referrerCountry: 'Nigeria', referredId: 'USR_2008', referredUsername: 'SoccerStar', referredEmail: 'soccerstar@example.com', referredCountry: 'Nigeria', cpAwarded: 10, status: 'valid', referralDate: new Date('2026-01-20'), source: 'Share Button', risk: false },
      ];

      setReferrals(mockReferrals);
      setFilteredReferrals(mockReferrals);
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortReferrals = () => {
    let filtered = [...referrals];

    // Apply time period filter first
    if (timePeriod === 'monthly') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      filtered = filtered.filter(r => {
        const d = r.referralDate instanceof Date ? r.referralDate : new Date(r.referralDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ref) =>
          ref.referrerUsername?.toLowerCase().includes(query) ||
          ref.referredUsername?.toLowerCase().includes(query) ||
          ref.referredEmail?.toLowerCase().includes(query) ||
          ref.id?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((ref) => {
        const status = ref.status || ref.referralStatus;
        return status === statusFilter;
      });
    }

    if (countryFilter !== 'all') {
      filtered = filtered.filter((ref) => ref.referredCountry === countryFilter);
    }

    switch (selectedSort) {
      case 'dateNewest':
        filtered.sort((a, b) => {
          const dateA = a.referralDate?.toDate ? a.referralDate.toDate() : new Date(a.referralDate);
          const dateB = b.referralDate?.toDate ? b.referralDate.toDate() : new Date(b.referralDate);
          return dateB - dateA;
        });
        break;
      case 'dateOldest':
        filtered.sort((a, b) => {
          const dateA = a.referralDate?.toDate ? a.referralDate.toDate() : new Date(a.referralDate);
          const dateB = b.referralDate?.toDate ? b.referralDate.toDate() : new Date(b.referralDate);
          return dateA - dateB;
        });
        break;
      case 'referrerAZ':
        filtered.sort((a, b) => (a.referrerUsername || '').localeCompare(b.referrerUsername || ''));
        break;
      case 'referrerZA':
        filtered.sort((a, b) => (b.referrerUsername || '').localeCompare(a.referrerUsername || ''));
        break;
      case 'cpHighest':
        filtered.sort((a, b) => (b.cpAwarded || 0) - (a.cpAwarded || 0));
        break;
      case 'cpLowest':
        filtered.sort((a, b) => (a.cpAwarded || 0) - (b.cpAwarded || 0));
        break;
      default:
        break;
    }

    setFilteredReferrals(filtered);
  };

  const validReferrals = referrals.filter((r) => (r.status || r.referralStatus) === 'valid' || (r.status || r.referralStatus) === 'completed');
  const totalCPIssued = referrals.reduce((sum, r) => sum + (r.cpAwarded || r.cpEarned || 0), 0);

  // Get current month/year
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Filter referrals based on time period
  const getFilteredByTimePeriod = (refList) => {
    if (timePeriod === 'monthly') {
      return refList.filter(r => {
        const d = r.referralDate instanceof Date ? r.referralDate : new Date(r.referralDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    }
    return refList; // All time
  };

  // Calculate stats based on time period
  const periodReferrals = getFilteredByTimePeriod(referrals);
  const periodValidReferrals = getFilteredByTimePeriod(validReferrals);
  const periodCPIssued = periodReferrals.reduce((sum, r) => sum + (r.cpAwarded || 0), 0);

  // Calculate unique referrers for the period
  const uniqueReferrerIds = new Set(periodReferrals.map(r => r.referrerId));
  const uniqueReferrersCount = uniqueReferrerIds.size;

  // Always calculate monthly stats for display
  const monthlyReferrals = referrals.filter(r => {
    const d = r.referralDate instanceof Date ? r.referralDate : new Date(r.referralDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const cpIssuedThisMonth = monthlyReferrals.reduce((sum, r) => sum + (r.cpAwarded || 0), 0);


  const getDateSortLabel = () => {
    switch (selectedSort) {
      case 'dateNewest':
        return 'Newest';
      case 'dateOldest':
        return 'Oldest';
      default:
        return 'Newest';
    }
  };

  const getStatusLabel = () => {
    if (statusFilter === 'all') return 'All Statuses';
    return statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
  };

  const getCountryLabel = () => {
    if (countryFilter === 'all') return 'All Countries';
    return countryFilter.length > 12 ? `${countryFilter.substring(0, 12)}...` : countryFilter;
  };

  const handleDateMenuClose = (value) => {
    if (value) setSelectedSort(value);
    setDateMenuAnchor(null);
  };

  const handleStatusMenuClose = (value) => {
    if (value) setStatusFilter(value);
    setStatusMenuAnchor(null);
  };

  const handleCountryMenuClose = (value) => {
    if (value) setCountryFilter(value);
    setCountryMenuAnchor(null);
  };

  const getStatusChip = (status, reason) => {
    const isValid = status === 'valid' || status === 'completed';
    const isFlagged = status === 'flagged' || status === 'invalid';

    return (
      <Tooltip title={reason || (isValid ? 'Valid Referral' : 'Status info')} arrow>
        <Chip
          icon={isValid ? <CheckCircle sx={{ fontSize: 14 }} /> : <Flag sx={{ fontSize: 14 }} />}
          label={status.toUpperCase()}
          size="small"
          variant="outlined"
          sx={{
            backgroundColor: isValid ? '#F0FDF4' : '#FEF2F2',
            borderColor: isValid ? colors.success : colors.error,
            color: isValid ? colors.success : colors.error,
            fontWeight: 700,
            fontSize: 11,
            borderRadius: '6px',
            height: 24,
            '& .MuiChip-icon': {
              color: isValid ? colors.success : colors.error,
            },
          }}
        />
      </Tooltip>
    );
  };

  const columns = [
    {
      id: 'referrer',
      label: 'Referrer',
      render: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
            {row.referrerUsername || 'N/A'}
          </Typography>
          {row.risk && (
            <Tooltip title="Flagged for internal review" arrow>
              <Warning sx={{ fontSize: 16, color: colors.warning }} />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      id: 'referred',
      label: 'Referred User',
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
          {row.referredUsername || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'source',
      label: 'Source',
      render: (value) => (
        <Chip
          label={value || 'Invite Link'}
          size="small"
          sx={{
            height: 20,
            fontSize: 10,
            bgcolor: '#F3F4F6',
            color: colors.textSecondary
          }}
        />
      ),
    },
    {
      id: 'referredEmail',
      label: 'Email',
      render: (value) => (
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 14 }}>
          {value || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'referredCountry',
      label: 'Country',
      render: (value) => (
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 14 }}>
          {value || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'cpAwarded',
      label: 'CP Earned',
      render: (value) => (
        <Chip
          label={`${value || 0} CP`}
          size="small"
          sx={{
            backgroundColor: '#FFF7ED',
            color: '#EA580C',
            fontWeight: 700,
            fontSize: 11,
            borderRadius: '6px',
            height: 24,
          }}
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => getStatusChip(row.status || row.referralStatus, row.statusReason),
    },
    {
      id: 'referralDate',
      label: 'Date',
      render: (value) => {
        if (!value) return 'N/A';
        const date = value?.toDate ? value.toDate() : new Date(value);
        return (
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 14 }}>
            {format(date, 'MMM d, yyyy')}
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
          onClick={(e) => handleActionMenuOpen(e, row)}
          sx={{
            backgroundColor: '#FFEBEE',
            color: colors.brandRed,
            width: 32,
            height: 32,
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: '#FFCDD2',
            },
          }}
        >
          <MoreVert sx={{ fontSize: 18 }} />
        </IconButton>
      ),
    },
  ];

  const paginatedReferrals = filteredReferrals.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getReferrerStats = (referrerId) => {
    if (!referrerId) return null;
    const referrerReferrals = referrals.filter(r => r.referrerId === referrerId);

    // Calculate stats
    const totalReferrals = referrerReferrals.length;
    const totalCP = referrerReferrals.reduce((sum, r) => sum + (r.cpAwarded || 0), 0);

    const now = new Date();
    const currentMonthData = referrerReferrals.filter(r => {
      const d = r.referralDate instanceof Date ? r.referralDate : new Date(r.referralDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const monthlyReferralsCount = currentMonthData.length;
    const monthlyCP = currentMonthData.reduce((sum, r) => sum + (r.cpAwarded || 0), 0);

    return {
      totalReferrals,
      monthlyReferrals: monthlyReferralsCount,
      totalCP,
      monthlyCP
    };
  };

  if (selectedReferral) {
    const stats = getReferrerStats(selectedReferral.referrerId);
    return <ReferralDetailsView referral={selectedReferral} onBack={() => setSelectedReferral(null)} referrerStats={stats} />;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* View Only Mode Banner */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: '12px',
          backgroundColor: '#E3F2FD',
          border: '1px solid #BBDEFB',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            color: '#1976D2',
            mt: 0.25,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1976D2', mb: 0.5 }}>
            View Only Mode (Phase 1)
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#1976D2', lineHeight: 1.5 }}>
            CP values are system-defined. Engagement and Campaign CP sources are coming in Phase 2.
          </Typography>
        </Box>
      </Box>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
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
            <CardGiftcard sx={{ fontSize: 28, color: colors.brandWhite }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.brandBlack,
              fontSize: { xs: 20, md: 22 },
            }}
          >
            Referral Management
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: colors.textSecondary,
            fontSize: 13,
            ml: 8,
          }}
        >
          Monitor referral activity and audit CP issued from referrals
        </Typography>
      </Box>

      {/* Time Period Filter */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={(e) => setTimePeriodMenuAnchor(e.currentTarget)}
          endIcon={<ArrowDropDown sx={{ fontSize: 20, color: colors.brandRed }} />}
          startIcon={
            <Box sx={{ color: colors.brandRed, display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ fontSize: 18 }} />
            </Box>
          }
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            fontSize: 15,
            color: colors.brandRed,
            backgroundColor: '#FFF5F5',
            borderColor: '#FFCDD2',
            borderWidth: '1.5px',
            '&:hover': {
              backgroundColor: '#FFEBEE',
              borderColor: colors.brandRed,
            },
          }}
        >
          {timePeriod === 'allTime' ? 'All Time' : 'This Month'}
        </Button>
        <Menu
          anchorEl={timePeriodMenuAnchor}
          open={Boolean(timePeriodMenuAnchor)}
          onClose={() => setTimePeriodMenuAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              mt: 1,
              minWidth: 200,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              p: 1,
            },
          }}
        >
          {[
            { value: 'allTime', label: 'All Time', icon: <Public sx={{ fontSize: 18 }} /> },
            { value: 'monthly', label: 'This Month', icon: <CalendarToday sx={{ fontSize: 18 }} /> },
          ].map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => {
                setTimePeriod(option.value);
                setTimePeriodMenuAnchor(null);
              }}
              sx={{
                mb: 0.5,
                borderRadius: '12px',
                py: 1.5,
                px: 2,
                backgroundColor: timePeriod === option.value ? '#FFEBEE' : 'transparent',
                border: timePeriod === option.value ? `1px solid ${colors.brandRed}40` : '1px solid transparent',
                '&:hover': {
                  backgroundColor: timePeriod === option.value ? '#FFEBEE' : colors.backgroundLight,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    backgroundColor: timePeriod === option.value ? '#FFCDD2' : '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: timePeriod === option.value ? colors.brandRed : colors.textSecondary,
                  }}
                >
                  {option.icon}
                </Box>
                <Typography
                  sx={{
                    fontWeight: timePeriod === option.value ? 700 : 500,
                    color: timePeriod === option.value ? colors.brandBlack : colors.textPrimary,
                    fontSize: 14,
                  }}
                >
                  {option.label}
                </Typography>
              </Box>
              {timePeriod === option.value && (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#FFCDD2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check sx={{ fontSize: 14, color: colors.brandRed }} />
                </Box>
              )}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* This Month Referrals / Total Referrals */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '16px',
              boxShadow: 'none',
              backgroundColor: '#F0F9FF',
              height: '100%',
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ mb: 2, flexDirection: 'row', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PersonAdd sx={{ fontSize: 20, color: '#0284C7' }} />
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.textSecondary }}>
                {timePeriod === 'monthly' ? 'This Month Referrals' : 'Total Referrals'}
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, color: colors.brandBlack, fontSize: 28, mb: 0.5 }}>
              {periodReferrals.length}
            </Typography>
            <Typography sx={{ color: colors.textSecondary, fontSize: 12 }}>
              {timePeriod === 'monthly' ? 'Current Month' : 'All Time'}
            </Typography>
          </Card>
        </Grid>

        {/* Valid Referrals */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '16px',
              boxShadow: 'none',
              backgroundColor: '#F0FDF4',
              height: '100%',
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ mb: 2, flexDirection: 'row', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle sx={{ fontSize: 20, color: '#16A34A' }} />
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.textSecondary }}>Valid Referrals</Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, color: colors.brandBlack, fontSize: 28, mb: 0.5 }}>
              {periodValidReferrals.length}
            </Typography>
            <Typography sx={{ color: colors.textSecondary, fontSize: 12 }}>
              {timePeriod === 'monthly' ? 'Current Month' : 'All Time'}
            </Typography>
          </Card>
        </Grid>

        {/* This Month Referrals CP Issued / Total CP Issued */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '16px',
              boxShadow: 'none',
              backgroundColor: '#FFFBEB',
              height: '100%',
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ mb: 2, flexDirection: 'row', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star sx={{ fontSize: 20, color: '#D97706' }} />
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.textSecondary }}>
                {timePeriod === 'monthly' ? 'This Month CP Issued' : 'Total CP Issued'}
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, color: colors.brandBlack, fontSize: 28, mb: 0.5 }}>
              {periodCPIssued}
            </Typography>
            <Typography sx={{ color: colors.textSecondary, fontSize: 12 }}>
              {timePeriod === 'monthly' ? 'Current Month' : 'Lifetime Earned'}
            </Typography>
          </Card>
        </Grid>

        {/* Unique Referrers */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '16px',
              boxShadow: 'none',
              backgroundColor: '#FFF1F2',
              height: '100%',
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ mb: 2, flexDirection: 'row', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#FFE4E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmojiEvents sx={{ fontSize: 20, color: '#E11D48' }} />
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.textSecondary }}>Unique Referrers</Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, color: colors.brandBlack, fontSize: 28, mb: 0.5 }}>
              {uniqueReferrersCount}
            </Typography>
            <Typography sx={{ color: colors.textSecondary, fontSize: 12 }}>
              {timePeriod === 'monthly' ? 'Current Month' : 'All Time'}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1, minWidth: 300 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by referrer, referred user, email, or ID..."
          />
        </Box>
        <Button
          variant="outlined"
          onClick={(e) => setDateMenuAnchor(e.currentTarget)}
          endIcon={<ArrowDropDown sx={{ fontSize: 20, color: colors.brandRed }} />}
          startIcon={
            <Box sx={{ color: colors.brandRed, display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ fontSize: 18 }} />
            </Box>
          }
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            py: 1.2,
            fontSize: 14,
            color: colors.brandRed,
            backgroundColor: '#FFF5F5',
            borderColor: '#FFCDD2',
            borderWidth: '1px',
            '&:hover': {
              backgroundColor: '#FFEBEE',
              borderColor: colors.brandRed,
            },
          }}
        >
          Date: {getDateSortLabel()}...
        </Button>
        <Button
          variant="outlined"
          onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
          endIcon={<ArrowDropDown sx={{ fontSize: 20, color: colors.brandRed }} />}
          startIcon={
            <Box sx={{ color: colors.brandRed, display: 'flex', alignItems: 'center' }}>
              <ViewModule sx={{ fontSize: 18 }} />
            </Box>
          }
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            py: 1.2,
            fontSize: 14,
            color: colors.brandRed,
            backgroundColor: '#FFF5F5',
            borderColor: '#FFCDD2',
            borderWidth: '1px',
            '&:hover': {
              backgroundColor: '#FFEBEE',
              borderColor: colors.brandRed,
            },
          }}
        >
          {getStatusLabel()}
        </Button>
        <Button
          variant="outlined"
          onClick={(e) => setCountryMenuAnchor(e.currentTarget)}
          endIcon={<ArrowDropDown sx={{ fontSize: 20, color: colors.brandRed }} />}
          startIcon={
            <Box sx={{ color: colors.brandRed, display: 'flex', alignItems: 'center' }}>
              <Public sx={{ fontSize: 18 }} />
            </Box>
          }
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            py: 1.2,
            fontSize: 14,
            color: colors.brandRed,
            backgroundColor: '#FFF5F5',
            borderColor: '#FFCDD2',
            borderWidth: '1px',
            '&:hover': {
              backgroundColor: '#FFEBEE',
              borderColor: colors.brandRed,
            },
          }}
        >
          {getCountryLabel()}
        </Button>
        {/* Date Menu */}
        <Menu
          anchorEl={dateMenuAnchor}
          open={Boolean(dateMenuAnchor)}
          onClose={() => handleDateMenuClose(null)}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              mt: 1,
              minWidth: 240,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              p: 1,
            },
          }}
        >
          {[
            { value: 'dateNewest', label: 'Date: Newest First', icon: <ArrowDownward sx={{ fontSize: 18 }} /> },
            { value: 'dateOldest', label: 'Date: Oldest First', icon: <ArrowUpward sx={{ fontSize: 18 }} /> },
            { value: 'referrerAZ', label: 'Referrer: A-Z', icon: <Sort sx={{ fontSize: 18 }} /> },
            { value: 'referrerZA', label: 'Referrer: Z-A', icon: <Sort sx={{ fontSize: 18, transform: 'scaleY(-1)' }} /> },
          ].map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleDateMenuClose(option.value)}
              sx={{
                mb: 0.5,
                borderRadius: '12px',
                py: 1.5,
                px: 2,
                backgroundColor: selectedSort === option.value ? '#FFEBEE' : 'transparent',
                border: selectedSort === option.value ? `1px solid ${colors.brandRed}40` : '1px solid transparent',
                '&:hover': {
                  backgroundColor: selectedSort === option.value ? '#FFEBEE' : colors.backgroundLight,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    backgroundColor: selectedSort === option.value ? '#FFCDD2' : '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: selectedSort === option.value ? colors.brandRed : colors.textSecondary,
                  }}
                >
                  {option.icon}
                </Box>
                <Typography
                  sx={{
                    fontWeight: selectedSort === option.value ? 700 : 500,
                    color: selectedSort === option.value ? colors.brandBlack : colors.textPrimary,
                    fontSize: 14,
                  }}
                >
                  {option.label}
                </Typography>
              </Box>
              {selectedSort === option.value && (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#FFCDD2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check sx={{ fontSize: 14, color: colors.brandRed }} />
                </Box>
              )}
            </MenuItem>
          ))}
        </Menu>

        {/* Status Menu */}
        <Menu
          anchorEl={statusMenuAnchor}
          open={Boolean(statusMenuAnchor)}
          onClose={() => handleStatusMenuClose(null)}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              mt: 1,
              minWidth: 240,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              p: 1,
            },
          }}
        >
          {[
            { value: 'all', label: 'All Statuses', icon: <ViewModule sx={{ fontSize: 18 }} /> },
            { value: 'valid', label: 'Valid', icon: <CheckCircleOutline sx={{ fontSize: 18 }} /> },
            { value: 'flagged', label: 'Flagged', icon: <Flag sx={{ fontSize: 18 }} /> },
          ].map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleStatusMenuClose(option.value)}
              sx={{
                mb: 0.5,
                borderRadius: '12px',
                py: 1.5,
                px: 2,
                backgroundColor: statusFilter === option.value ? '#FFEBEE' : 'transparent',
                border: statusFilter === option.value ? `1px solid ${colors.brandRed}40` : '1px solid transparent',
                '&:hover': {
                  backgroundColor: statusFilter === option.value ? '#FFEBEE' : colors.backgroundLight,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    backgroundColor: statusFilter === option.value ? '#FFCDD2' : '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: statusFilter === option.value ? colors.brandRed : colors.textSecondary,
                  }}
                >
                  {option.icon}
                </Box>
                <Typography
                  sx={{
                    fontWeight: statusFilter === option.value ? 700 : 500,
                    color: statusFilter === option.value ? colors.brandBlack : colors.textPrimary,
                    fontSize: 14,
                  }}
                >
                  {option.label}
                </Typography>
              </Box>
              {statusFilter === option.value && (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#FFCDD2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check sx={{ fontSize: 14, color: colors.brandRed }} />
                </Box>
              )}
            </MenuItem>
          ))}
        </Menu>

        {/* Country Menu */}
        <Menu
          anchorEl={countryMenuAnchor}
          open={Boolean(countryMenuAnchor)}
          onClose={() => handleCountryMenuClose(null)}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              mt: 1,
              minWidth: 240,
              maxHeight: 400,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              p: 1,
            },
          }}
        >
          <MenuItem
            onClick={() => handleCountryMenuClose('all')}
            sx={{
              mb: 0.5,
              borderRadius: '12px',
              py: 1.5,
              px: 2,
              backgroundColor: countryFilter === 'all' ? '#FFEBEE' : 'transparent',
              border: countryFilter === 'all' ? `1px solid ${colors.brandRed}40` : '1px solid transparent',
              '&:hover': {
                backgroundColor: countryFilter === 'all' ? '#FFEBEE' : colors.backgroundLight,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  backgroundColor: countryFilter === 'all' ? '#FFCDD2' : '#F5F5F5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: countryFilter === 'all' ? colors.brandRed : colors.textSecondary,
                }}
              >
                <Public sx={{ fontSize: 18 }} />
              </Box>
              <Typography
                sx={{
                  fontWeight: countryFilter === 'all' ? 700 : 500,
                  color: countryFilter === 'all' ? colors.brandBlack : colors.textPrimary,
                  fontSize: 14,
                }}
              >
                All Countries
              </Typography>
            </Box>
            {countryFilter === 'all' && (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#FFCDD2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check sx={{ fontSize: 14, color: colors.brandRed }} />
              </Box>
            )}
          </MenuItem>
          {[
            'Algeria', 'Cameroon', 'Egypt', 'Ghana', 'Ivory Coast',
            'Kenya', 'Morocco', 'Nigeria', 'Senegal', 'South Africa',
            'Tanzania', 'Uganda'
          ].map((country) => (
            <MenuItem
              key={country}
              onClick={() => handleCountryMenuClose(country)}
              sx={{
                mb: 0.5,
                borderRadius: '12px',
                py: 1.5,
                px: 2,
                backgroundColor: countryFilter === country ? '#FFEBEE' : 'transparent',
                border: countryFilter === country ? `1px solid ${colors.brandRed}40` : '1px solid transparent',
                '&:hover': {
                  backgroundColor: countryFilter === country ? '#FFEBEE' : colors.backgroundLight,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    backgroundColor: countryFilter === country ? '#FFCDD2' : '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: countryFilter === country ? colors.brandRed : colors.textSecondary,
                  }}
                >
                  <Navigation sx={{ fontSize: 16, transform: 'rotate(45deg)' }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: countryFilter === country ? 700 : 500,
                    color: countryFilter === country ? colors.brandBlack : colors.textPrimary,
                    fontSize: 14,
                  }}
                >
                  {country}
                </Typography>
              </Box>
              {countryFilter === country && (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#FFCDD2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check sx={{ fontSize: 14, color: colors.brandRed }} />
                </Box>
              )}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Referral Records Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: colors.brandRed,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CardGiftcard sx={{ fontSize: 18, color: colors.brandWhite }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, fontSize: 16 }}>
            Referral Records
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 14 }}>
            {filteredReferrals.length} referral{filteredReferrals.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              borderRadius: '12px',
              fontSize: 14,
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedReferrals}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredReferrals.length}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        emptyMessage="No referrals found"
      />

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            mt: 1,
            minWidth: 160,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        <MenuItem onClick={handleViewDetails} sx={{ fontSize: 14, fontWeight: 500 }}>
          View Details
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ReferralsPage;
