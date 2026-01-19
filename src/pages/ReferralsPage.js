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
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
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

  useEffect(() => {
    loadReferrals();
  }, []);

  useEffect(() => {
    filterAndSortReferrals();
  }, [referrals, searchQuery, statusFilter, countryFilter, selectedSort]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const referralsRef = collection(db, 'referrals');
      const q = query(referralsRef, orderBy('referralDate', 'desc'));
      const snapshot = await getDocs(q);
      const referralsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReferrals(referralsData);
      setFilteredReferrals(referralsData);
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortReferrals = () => {
    let filtered = [...referrals];

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
  const uniqueReferrers = new Set(referrals.map((r) => r.referrerUsername || r.referrerId)).size;

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

  const getStatusChip = (status) => {
    const isValid = status === 'valid' || status === 'completed';
    return (
      <Chip
        icon={<CheckCircle sx={{ fontSize: 14 }} />}
        label="VALID"
        size="small"
        sx={{
          backgroundColor: colors.success,
          color: colors.brandWhite,
          fontWeight: 700,
          fontSize: 11,
          borderRadius: '20px',
          height: 24,
          '& .MuiChip-icon': {
            color: colors.brandWhite,
          },
        }}
      />
    );
  };

  const columns = [
    {
      id: 'referrer',
      label: 'Referrer',
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
            {row.referrerUsername || 'N/A'}
          </Typography>
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
            backgroundColor: colors.warning,
            color: colors.brandWhite,
            fontWeight: 700,
            fontSize: 11,
            borderRadius: '20px',
            height: 24,
          }}
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => getStatusChip(row.status || row.referralStatus),
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
      render: () => (
        <IconButton
          size="small"
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

  const paginatedReferrals = filteredReferrals.slice(
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
          fontSize: { xs: 24, md: 28 },
        }}
      >
        Referral Management
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
          Monitor referral activity and audit CP issued from referrals
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Total Referrals */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              borderRadius: '16px',
              boxShadow: `0 4px 12px ${colors.shadow}14`,
              backgroundColor: colors.brandWhite,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  backgroundColor: colors.brandRed,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CardGiftcard sx={{ fontSize: 24, color: colors.brandWhite }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.25 }}>
                  {referrals.length}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 14 }}>
                  Total Referrals
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 12 }}>
              All referrals recorded
            </Typography>
          </Card>
        </Grid>

        {/* Valid Referrals */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              borderRadius: '16px',
              boxShadow: `0 4px 12px ${colors.shadow}14`,
              backgroundColor: colors.brandWhite,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  backgroundColor: colors.success,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle sx={{ fontSize: 24, color: colors.brandWhite }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.25 }}>
                  {validReferrals.length}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 14 }}>
                  Valid Referrals
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 12 }}>
              CP successfully issued
            </Typography>
          </Card>
        </Grid>

        {/* CP Issued (Total) */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              borderRadius: '16px',
              boxShadow: `0 4px 12px ${colors.shadow}14`,
              backgroundColor: colors.brandWhite,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  backgroundColor: colors.warning,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Star sx={{ fontSize: 24, color: colors.brandWhite }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.25 }}>
                  {totalCPIssued}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 14 }}>
                  CP Issued (Total)
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 12 }}>
              CeBee Points awarded
            </Typography>
          </Card>
        </Grid>

        {/* Unique Referrers */}
        <Grid item xs={6} md={3}>
            <Card
              sx={{
              padding: 2.5,
                borderRadius: '16px',
              boxShadow: `0 4px 12px ${colors.shadow}14`,
              backgroundColor: colors.brandWhite,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  backgroundColor: colors.info,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonAdd sx={{ fontSize: 24, color: colors.brandWhite }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.25 }}>
                  {uniqueReferrers}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 14 }}>
                  Unique Referrers
              </Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 12 }}>
              Users who referred others
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
          endIcon={<ArrowDropDown sx={{ color: colors.brandRed }} />}
          startIcon={
            <Box sx={{ color: colors.brandRed }}>
              <CalendarToday sx={{ fontSize: 18 }} />
            </Box>
          }
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            color: colors.brandRed,
            borderColor: `${colors.divider}66`,
            '&:hover': {
              backgroundColor: `${colors.divider}0D`,
              borderColor: colors.brandRed,
            },
          }}
        >
          Date: {getDateSortLabel()}...
        </Button>
        <Button
          variant="outlined"
          onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
          endIcon={<ArrowDropDown sx={{ color: colors.brandRed }} />}
          startIcon={
            <Box sx={{ color: colors.brandRed }}>
              <ViewModule sx={{ fontSize: 18 }} />
            </Box>
          }
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            color: colors.brandRed,
            borderColor: `${colors.divider}66`,
            '&:hover': {
              backgroundColor: `${colors.divider}0D`,
              borderColor: colors.brandRed,
            },
          }}
        >
          {getStatusLabel()}
        </Button>
        <Button
          variant="outlined"
          onClick={(e) => setCountryMenuAnchor(e.currentTarget)}
          endIcon={<ArrowDropDown sx={{ color: colors.brandRed }} />}
          startIcon={
            <Box sx={{ color: colors.brandRed }}>
              <Public sx={{ fontSize: 18 }} />
            </Box>
          }
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            color: colors.brandRed,
            borderColor: `${colors.divider}66`,
            '&:hover': {
              backgroundColor: `${colors.divider}0D`,
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
              borderRadius: '12px',
              mt: 1,
              minWidth: 200,
            },
          }}
        >
          <MenuItem onClick={() => handleDateMenuClose('dateNewest')}>Newest</MenuItem>
          <MenuItem onClick={() => handleDateMenuClose('dateOldest')}>Oldest</MenuItem>
        </Menu>

        {/* Status Menu */}
        <Menu
          anchorEl={statusMenuAnchor}
          open={Boolean(statusMenuAnchor)}
          onClose={() => handleStatusMenuClose(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              mt: 1,
              minWidth: 200,
            },
          }}
        >
          <MenuItem onClick={() => handleStatusMenuClose('all')}>All Statuses</MenuItem>
          <MenuItem onClick={() => handleStatusMenuClose('valid')}>Valid</MenuItem>
          <MenuItem onClick={() => handleStatusMenuClose('completed')}>Completed</MenuItem>
          <MenuItem onClick={() => handleStatusMenuClose('pending')}>Pending</MenuItem>
          <MenuItem onClick={() => handleStatusMenuClose('failed')}>Failed</MenuItem>
        </Menu>

        {/* Country Menu */}
        <Menu
          anchorEl={countryMenuAnchor}
          open={Boolean(countryMenuAnchor)}
          onClose={() => handleCountryMenuClose(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              mt: 1,
              minWidth: 200,
            },
          }}
        >
          <MenuItem onClick={() => handleCountryMenuClose('all')}>All Countries</MenuItem>
          {[...new Set(referrals.map((r) => r.referredCountry).filter(Boolean))].map((country) => (
            <MenuItem key={country} onClick={() => handleCountryMenuClose(country)}>
                    {country}
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
    </Box>
  );
};

export default ReferralsPage;
