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
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  Paper,
} from '@mui/material';
import {
  Add,
  Person,
  People,
  CheckCircle,
  Cancel,
  Flag,
  VerifiedUser,
  BarChart,
  ArrowUpward,
  ArrowDownward,
  FilterList,
  ArrowDropDown,
  MoreVert,
  Check,
  Sort,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [selectedSort, setSelectedSort] = useState('spHigh');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [spFilterAnchor, setSpFilterAnchor] = useState(null);
  const [accuracyFilterAnchor, setAccuracyFilterAnchor] = useState(null);
  const [accuracyFilter, setAccuracyFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [leaguePreference, setLeaguePreference] = useState('all');
  const [clubPreference, setClubPreference] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [accuracyRange, setAccuracyRange] = useState('all');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchInputRef, setSearchInputRef] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchQuery, selectedStatus, selectedSort, accuracyFilter, leaguePreference, clubPreference, countryFilter, accuracyRange]);

  const generateDummyUsers = () => {
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Amy'];
    const lastNames = ['Doe', 'Smith', 'Wilson', 'Jones', 'Brown', 'Davis', 'Miller', 'Garcia', 'Martinez', 'Anderson'];
    const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Brazil', 'India', 'Nigeria', 'South Africa', 'Kenya', 'Ghana'];
    const users = [];
    
    // Generate 1000 users for better statistics
    for (let i = 0; i < 1000; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i}`;
      const email = `${username}@example.com`;
      const isActive = Math.random() > 0.12; // ~88% active
      const isBlocked = Math.random() > 0.96; // ~4% blocked
      const isDeleted = Math.random() > 0.98; // ~2% deleted/deactivated
      const hasFlags = Math.random() > 0.94; // ~6% flagged
      const isVerified = Math.random() > 0.20; // ~80% verified
      
      users.push({
        id: `USER_${i.toString().padStart(6, '0')}`,
        username: username,
        email: email,
        fullName: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        country: countries[Math.floor(Math.random() * countries.length)],
        preferredLeague: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'All'][Math.floor(Math.random() * 6)],
        preferredClub: ['Manchester United', 'Liverpool', 'Arsenal', 'Chelsea', 'Barcelona', 'Real Madrid', 'All'][Math.floor(Math.random() * 7)],
        isActive: isActive && !isBlocked && !isDeleted,
        isVerified: isVerified && !isBlocked && !isDeleted,
        isBlocked: isBlocked,
        isDeleted: isDeleted,
        isDeactivated: isDeleted,
        fraudFlags: hasFlags ? ['Suspicious activity', 'Multiple accounts'] : [],
        spTotal: Math.floor(Math.random() * 5000) + 100,
        spCurrent: Math.floor(Math.random() * 2000) + 50,
        cpTotal: Math.floor(Math.random() * 1000) + 10,
        cpCurrent: Math.floor(Math.random() * 500) + 5,
        totalPredictions: Math.floor(Math.random() * 100) + 5,
        predictionAccuracy: Math.floor(Math.random() * 100),
        totalPolls: Math.floor(Math.random() * 20) + 1,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        spFromPredictions: Math.floor(Math.random() * 3000) + 50,
        spFromDailyLogin: Math.floor(Math.random() * 500) + 10,
        cpFromReferrals: Math.floor(Math.random() * 300) + 5,
        cpFromEngagement: Math.floor(Math.random() * 200) + 5,
      });
    }
    
    return users;
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      let usersData = [];
      
      // Try to load from Firebase
      try {
      const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
        usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      } catch (error) {
        console.log('Using dummy data:', error);
      }
      
      // Use dummy data if no real data exists
      if (usersData.length === 0) {
        usersData = generateDummyUsers();
      }
      
      // For demo: always use dummy data
      usersData = generateDummyUsers();
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to dummy data
      const dummyData = generateDummyUsers();
      setUsers(dummyData);
      setFilteredUsers(dummyData);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.id?.toLowerCase().includes(query) ||
          user.fullName?.toLowerCase().includes(query) ||
          user.name?.toLowerCase().includes(query) ||
          `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((user) => {
        if (selectedStatus === 'active') return user.isActive === true && !user.isDeleted && !user.isBlocked;
        if (selectedStatus === 'inactive') return user.isActive === false && !user.isDeleted && !user.isBlocked;
        if (selectedStatus === 'suspended') return user.status === 'suspended';
        if (selectedStatus === 'flagged') return user.fraudFlags && user.fraudFlags.length > 0;
        if (selectedStatus === 'blocked') return user.isBlocked === true;
        if (selectedStatus === 'deactivated') return user.isDeleted === true || user.isDeactivated === true;
        return true;
      });
    }

    // Accuracy filter (from advanced filters)
    if (accuracyRange !== 'all') {
      filtered = filtered.filter((user) => {
        const accuracy = user.predictionAccuracy || 0;
        if (accuracyRange === '0-25') return accuracy >= 0 && accuracy <= 25;
        if (accuracyRange === '26-50') return accuracy > 25 && accuracy <= 50;
        if (accuracyRange === '51-75') return accuracy > 50 && accuracy <= 75;
        if (accuracyRange === '76-100') return accuracy > 75 && accuracy <= 100;
        return true;
      });
    }

    // Legacy accuracy filter (keep for backward compatibility)
    if (accuracyFilter !== 'all') {
      filtered = filtered.filter((user) => {
        const accuracy = user.predictionAccuracy || 0;
        if (accuracyFilter === '0-25') return accuracy >= 0 && accuracy <= 25;
        if (accuracyFilter === '26-50') return accuracy > 25 && accuracy <= 50;
        if (accuracyFilter === '51-75') return accuracy > 50 && accuracy <= 75;
        if (accuracyFilter === '76-100') return accuracy > 75 && accuracy <= 100;
        return true;
      });
    }

    // League Preference filter
    if (leaguePreference !== 'all') {
      filtered = filtered.filter((user) => {
        // Assuming user has a preferredLeague field, or we can add it to dummy data
        return user.preferredLeague === leaguePreference;
      });
    }

    // Club Preference filter
    if (clubPreference !== 'all') {
      filtered = filtered.filter((user) => {
        // Assuming user has a preferredClub field, or we can add it to dummy data
        return user.preferredClub === clubPreference;
      });
    }

    // Country filter
    if (countryFilter !== 'all') {
      filtered = filtered.filter((user) => {
        return user.country === countryFilter;
      });
    }

    // Sort
    switch (selectedSort) {
      case 'spHigh':
        filtered.sort((a, b) => (b.spTotal || 0) - (a.spTotal || 0));
        break;
      case 'spLow':
        filtered.sort((a, b) => (a.spTotal || 0) - (b.spTotal || 0));
        break;
      case 'predictionsHigh':
        filtered.sort((a, b) => (b.totalPredictions || 0) - (a.totalPredictions || 0));
        break;
      case 'predictionsLow':
        filtered.sort((a, b) => (a.totalPredictions || 0) - (b.totalPredictions || 0));
        break;
      case 'dateNewest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        });
        break;
      case 'dateOldest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateA - dateB;
        });
        break;
      case 'nameAZ':
        filtered.sort((a, b) => (a.username || '').localeCompare(b.username || ''));
        break;
      case 'nameZA':
        filtered.sort((a, b) => (b.username || '').localeCompare(a.username || ''));
        break;
      default:
        break;
    }

    setFilteredUsers(filtered);
  };

  const getStatusChip = (user) => {
    if (user.fraudFlags && user.fraudFlags.length > 0) {
      return (
        <Chip
          icon={<Flag />}
          label="Flagged"
          size="small"
          sx={{
            backgroundColor: `${colors.error}1A`,
            color: colors.error,
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      );
    }
    if (user.status === 'suspended') {
      return (
        <Chip
          icon={<Cancel />}
          label="Suspended"
          size="small"
          sx={{
            backgroundColor: `${colors.warning}1A`,
            color: colors.warning,
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      );
    }
    if (user.isActive) {
      return (
        <Chip
          icon={<CheckCircle />}
          label="Active"
          size="small"
          sx={{
            backgroundColor: `${colors.success}1A`,
            color: colors.success,
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      );
    }
    return (
      <Chip
        icon={<Cancel />}
        label="Inactive"
        size="small"
        sx={{
          backgroundColor: `${colors.textSecondary}1A`,
          color: colors.textSecondary,
          fontWeight: 600,
          fontSize: 11,
        }}
      />
    );
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const activeCount = users.filter((u) => u.isActive && !u.isDeleted && !u.isBlocked).length;
  const verifiedCount = users.filter((u) => u.isVerified).length;
  const flaggedCount = users.filter((u) => u.fraudFlags && u.fraudFlags.length > 0).length;
  const blockedCount = users.filter((u) => u.isBlocked === true).length;
  const deactivatedCount = users.filter((u) => u.isDeleted === true || u.isDeactivated === true).length;

  const columns = [
    {
      id: 'username',
      label: 'USERNAME',
      render: (value, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
          {row.username || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'id',
      label: 'USER ID',
      render: (_, row) => (
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
          {row.id || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'email',
      label: 'EMAIL',
      render: (value) => (
        <Typography variant="body2" sx={{ color: colors.brandBlack, fontSize: 13 }}>
          {value || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'STATUS',
      render: (_, row) => getStatusChip(row),
    },
    {
      id: 'spTotal',
      label: 'TOTAL SP',
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
          {value?.toLocaleString() || '0'}
        </Typography>
      ),
    },
    {
      id: 'rank',
      label: 'RANK',
      render: (value) => (
        <Typography variant="body2" sx={{ color: colors.brandBlack }}>
          {value || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'createdAt',
      label: 'JOIN DATE',
      render: (value) => {
        if (!value) return 'N/A';
        const date = value?.toDate ? value.toDate() : new Date(value);
        return format(date, 'MMM dd, yyyy');
      },
    },
    {
      id: 'actions',
      label: 'ACTI',
      render: (_, row) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleMenuOpen(e, row);
          }}
        >
          <MoreVert sx={{ fontSize: 18, color: colors.textSecondary }} />
        </IconButton>
      ),
    },
  ];

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'flagged', label: 'Flagged' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'deactivated', label: 'Deactivated' },
  ];

  const sortOptions = [
    { value: 'spHigh', label: 'SP (High)' },
    { value: 'spLow', label: 'SP (Low)' },
    { value: 'predictionsHigh', label: 'Predictions (Most)' },
    { value: 'predictionsLow', label: 'Predictions (Least)' },
    { value: 'dateNewest', label: 'Join Date (Newest)' },
    { value: 'dateOldest', label: 'Join Date (Oldest)' },
    { value: 'nameAZ', label: 'Name (A-Z)' },
    { value: 'nameZA', label: 'Name (Z-A)' },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: colors.brandBlack,
          fontSize: { xs: 24, md: 28 },
          mb: 3,
        }}
      >
        User Management
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
              animation: 'fadeInUp 0.6s ease-out 0ms both',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 24px ${colors.brandRed}50`,
              },
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowUpward sx={{ fontSize: 16, color: colors.success }} />
                <Typography variant="caption" sx={{ color: colors.success, fontWeight: 600, fontSize: 12 }}>
                  +12.5%
                </Typography>
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandWhite, mb: 0.5 }}>
              {users.length} Total Users
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
                <CheckCircle sx={{ fontSize: 24, color: colors.success }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowUpward sx={{ fontSize: 16, color: colors.success }} />
                <Typography variant="caption" sx={{ color: colors.success, fontWeight: 600, fontSize: 12 }}>
                  +8.2%
                </Typography>
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {activeCount} Active Users
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
                <VerifiedUser sx={{ fontSize: 24, color: colors.info }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowUpward sx={{ fontSize: 16, color: colors.success }} />
                <Typography variant="caption" sx={{ color: colors.success, fontWeight: 600, fontSize: 12 }}>
                  +15.3%
                </Typography>
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {verifiedCount} Verified Users
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
              animation: 'fadeInUp 0.6s ease-out 200ms both',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 20px ${colors.warning}2F`,
              },
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowUpward sx={{ fontSize: 16, color: colors.success }} />
                <Typography variant="caption" sx={{ color: colors.success, fontWeight: 600, fontSize: 12 }}>
                  +5.1%
                </Typography>
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {flaggedCount} Flagged Users
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: colors.brandWhite,
              border: `1.5px solid ${colors.error}26`,
              borderRadius: '20px',
              boxShadow: `0 6px 14px ${colors.error}1F`,
              animation: 'fadeInUp 0.6s ease-out 300ms both',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 20px ${colors.error}2F`,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box
                sx={{
                  padding: 1.25,
                  backgroundColor: `${colors.error}1F`,
                  borderRadius: '12px',
                }}
              >
                <Cancel sx={{ fontSize: 24, color: colors.error }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowUpward sx={{ fontSize: 16, color: colors.success }} />
                <Typography variant="caption" sx={{ color: colors.success, fontWeight: 600, fontSize: 12 }}>
                  +2.3%
                </Typography>
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {blockedCount} Blocked Users
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: colors.brandWhite,
              border: `1.5px solid ${colors.textSecondary}26`,
              borderRadius: '20px',
              boxShadow: `0 6px 14px ${colors.textSecondary}1F`,
              animation: 'fadeInUp 0.6s ease-out 400ms both',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 20px ${colors.textSecondary}2F`,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box
                sx={{
                  padding: 1.25,
                  backgroundColor: `${colors.textSecondary}1F`,
                  borderRadius: '12px',
                }}
              >
                <Person sx={{ fontSize: 24, color: colors.textSecondary }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowUpward sx={{ fontSize: 16, color: colors.success }} />
                <Typography variant="caption" sx={{ color: colors.success, fontWeight: 600, fontSize: 12 }}>
                  +1.1%
                </Typography>
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {deactivatedCount} Deactivated Users
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* User Status Tabs */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1.5 }}>
        <Button
          variant={selectedStatus === 'active' ? 'contained' : 'outlined'}
          onClick={() => setSelectedStatus('active')}
          startIcon={
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: selectedStatus === 'active' ? colors.brandWhite : colors.success,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle 
          sx={{
                  fontSize: 14, 
                  color: selectedStatus === 'active' ? colors.success : colors.brandWhite 
                }} 
              />
            </Box>
          }
          sx={{
            flex: 1,
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            py: 1.5,
            backgroundColor: selectedStatus === 'active' ? colors.success : colors.brandWhite,
            color: selectedStatus === 'active' ? colors.brandWhite : colors.brandBlack,
            border: `1.5px solid ${selectedStatus === 'active' ? colors.success : colors.divider}66`,
                '&:hover': {
              backgroundColor: selectedStatus === 'active' ? colors.success : colors.brandWhite,
              borderColor: selectedStatus === 'active' ? colors.success : colors.divider,
            },
          }}
        >
            Active Users
        </Button>
        <Button
          variant={selectedStatus === 'inactive' ? 'contained' : 'outlined'}
          onClick={() => setSelectedStatus('inactive')}
          startIcon={
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: selectedStatus === 'inactive' ? colors.brandWhite : colors.textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cancel 
                sx={{ 
                  fontSize: 14, 
                  color: selectedStatus === 'inactive' ? colors.error : colors.brandWhite 
                }} 
              />
            </Box>
          }
          sx={{
            flex: 1,
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            py: 1.5,
            backgroundColor: selectedStatus === 'inactive' ? colors.success : colors.brandWhite,
            color: selectedStatus === 'inactive' ? colors.brandWhite : colors.brandBlack,
            border: `1.5px solid ${selectedStatus === 'inactive' ? colors.success : colors.divider}66`,
                '&:hover': {
              backgroundColor: selectedStatus === 'inactive' ? colors.success : colors.brandWhite,
              borderColor: selectedStatus === 'inactive' ? colors.success : colors.divider,
            },
          }}
        >
            Inactive Users
        </Button>
      </Box>

      {/* Search and Filter Bar */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'center' }}>
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by username, email or user ID..."
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: colors.brandRed,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedSort === 'spHigh' ? (
                <ArrowUpward sx={{ fontSize: 12, color: colors.brandWhite }} />
              ) : selectedSort === 'spLow' ? (
                <ArrowDownward sx={{ fontSize: 12, color: colors.brandWhite }} />
              ) : selectedSort === 'predictionsHigh' || selectedSort === 'predictionsLow' ? (
                <BarChart sx={{ fontSize: 12, color: colors.brandWhite }} />
              ) : selectedSort === 'dateNewest' ? (
                <ArrowDownward sx={{ fontSize: 12, color: colors.brandWhite }} />
              ) : selectedSort === 'dateOldest' ? (
                <ArrowUpward sx={{ fontSize: 12, color: colors.brandWhite }} />
              ) : selectedSort === 'nameAZ' || selectedSort === 'nameZA' ? (
                <Sort sx={{ fontSize: 12, color: colors.brandWhite }} />
              ) : (
                <ArrowUpward sx={{ fontSize: 12, color: colors.brandWhite }} />
              )}
            </Box>
          }
          endIcon={<ArrowDropDown sx={{ color: colors.brandRed, fontSize: 20 }} />}
          onClick={(e) => setSpFilterAnchor(e.currentTarget)}
          sx={{
            flex: 1,
            borderColor: `${colors.brandRed}26`,
            color: colors.brandBlack,
            backgroundColor: colors.brandWhite,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1.5,
            boxShadow: `0 2px 8px ${colors.shadow}14`,
            '&:hover': {
              borderColor: colors.brandRed,
              backgroundColor: colors.brandWhite,
            },
          }}
        >
          {selectedSort === 'spHigh' ? 'SP: High' : 
           selectedSort === 'spLow' ? 'SP: Low' :
           selectedSort === 'predictionsHigh' ? 'Predictions: Most' :
           selectedSort === 'predictionsLow' ? 'Predictions: Least' :
           selectedSort === 'dateNewest' ? 'Join Date: Newest' :
           selectedSort === 'dateOldest' ? 'Join Date: Oldest' :
           selectedSort === 'nameAZ' ? 'Name: A-Z' :
           selectedSort === 'nameZA' ? 'Name: Z-A' : 'SP: High'}
        </Button>
        <Menu
          anchorEl={spFilterAnchor}
          open={Boolean(spFilterAnchor)}
          onClose={() => setSpFilterAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 220,
              boxShadow: `0 4px 12px ${colors.shadow}33`,
              padding: '8px 0',
            },
          }}
        >
          <MenuItem 
            onClick={() => { setSelectedSort('spHigh'); setSpFilterAnchor(null); }}
            selected={selectedSort === 'spHigh'}
            sx={{
              py: 1.5,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              backgroundColor: selectedSort === 'spHigh' ? `${colors.brandRed}0D` : 'transparent',
              '&:hover': {
                backgroundColor: `${colors.brandRed}0D`,
              },
              '&.Mui-selected': {
                backgroundColor: `${colors.brandRed}0D`,
                '&:hover': {
                  backgroundColor: `${colors.brandRed}1A`,
                },
              },
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: colors.brandRed,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowUpward sx={{ fontSize: 14, color: colors.brandWhite }} />
            </Box>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: selectedSort === 'spHigh' ? 700 : 500 }}>
            SP: High
            </Typography>
            {selectedSort === 'spHigh' && (
              <Check sx={{ fontSize: 18, color: colors.brandRed }} />
            )}
          </MenuItem>
          <MenuItem 
            onClick={() => { setSelectedSort('spLow'); setSpFilterAnchor(null); }}
            selected={selectedSort === 'spLow'}
            sx={{
              py: 1.5,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              backgroundColor: selectedSort === 'spLow' ? `${colors.brandRed}0D` : 'transparent',
              '&:hover': {
                backgroundColor: `${colors.brandRed}0D`,
              },
              '&.Mui-selected': {
                backgroundColor: `${colors.brandRed}0D`,
                '&:hover': {
                  backgroundColor: `${colors.brandRed}1A`,
                },
              },
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: colors.textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowDownward sx={{ fontSize: 14, color: colors.brandWhite }} />
            </Box>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: selectedSort === 'spLow' ? 700 : 500 }}>
            SP: Low
            </Typography>
            {selectedSort === 'spLow' && (
              <Check sx={{ fontSize: 18, color: colors.brandRed }} />
            )}
          </MenuItem>
          <MenuItem 
            onClick={() => { setSelectedSort('predictionsHigh'); setSpFilterAnchor(null); }}
            selected={selectedSort === 'predictionsHigh'}
            sx={{
              py: 1.5,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              backgroundColor: selectedSort === 'predictionsHigh' ? `${colors.brandRed}0D` : 'transparent',
              '&:hover': {
                backgroundColor: `${colors.brandRed}0D`,
              },
              '&.Mui-selected': {
                backgroundColor: `${colors.brandRed}0D`,
                '&:hover': {
                  backgroundColor: `${colors.brandRed}1A`,
                },
              },
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: selectedSort === 'predictionsHigh' ? colors.brandRed : colors.textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart sx={{ fontSize: 14, color: colors.brandWhite }} />
            </Box>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: selectedSort === 'predictionsHigh' ? 700 : 500 }}>
              Predictions: Most
            </Typography>
            {selectedSort === 'predictionsHigh' && (
              <Check sx={{ fontSize: 18, color: colors.brandRed }} />
            )}
          </MenuItem>
          <MenuItem 
            onClick={() => { setSelectedSort('predictionsLow'); setSpFilterAnchor(null); }}
            selected={selectedSort === 'predictionsLow'}
            sx={{
              py: 1.5,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              backgroundColor: selectedSort === 'predictionsLow' ? `${colors.brandRed}0D` : 'transparent',
              '&:hover': {
                backgroundColor: `${colors.brandRed}0D`,
              },
              '&.Mui-selected': {
                backgroundColor: `${colors.brandRed}0D`,
                '&:hover': {
                  backgroundColor: `${colors.brandRed}1A`,
                },
              },
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: colors.textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart sx={{ fontSize: 14, color: colors.brandWhite }} />
            </Box>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: selectedSort === 'predictionsLow' ? 700 : 500 }}>
              Predictions: Least
            </Typography>
            {selectedSort === 'predictionsLow' && (
              <Check sx={{ fontSize: 18, color: colors.brandRed }} />
            )}
          </MenuItem>
          <MenuItem 
            onClick={() => { setSelectedSort('dateNewest'); setSpFilterAnchor(null); }}
            selected={selectedSort === 'dateNewest'}
            sx={{
              py: 1.5,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              backgroundColor: selectedSort === 'dateNewest' ? `${colors.brandRed}0D` : 'transparent',
              '&:hover': {
                backgroundColor: `${colors.brandRed}0D`,
              },
              '&.Mui-selected': {
                backgroundColor: `${colors.brandRed}0D`,
                '&:hover': {
                  backgroundColor: `${colors.brandRed}1A`,
                },
              },
            }}
          >
            <ArrowDownward sx={{ fontSize: 18, color: colors.textSecondary }} />
            <Typography variant="body2" sx={{ flex: 1, fontWeight: selectedSort === 'dateNewest' ? 700 : 500 }}>
              Join Date: Newest
            </Typography>
            {selectedSort === 'dateNewest' && (
              <Check sx={{ fontSize: 18, color: colors.brandRed }} />
            )}
          </MenuItem>
          <MenuItem 
            onClick={() => { setSelectedSort('dateOldest'); setSpFilterAnchor(null); }}
            selected={selectedSort === 'dateOldest'}
            sx={{
              py: 1.5,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              backgroundColor: selectedSort === 'dateOldest' ? `${colors.brandRed}0D` : 'transparent',
              '&:hover': {
                backgroundColor: `${colors.brandRed}0D`,
              },
              '&.Mui-selected': {
                backgroundColor: `${colors.brandRed}0D`,
                '&:hover': {
                  backgroundColor: `${colors.brandRed}1A`,
                },
              },
            }}
          >
            <ArrowUpward sx={{ fontSize: 18, color: colors.textSecondary }} />
            <Typography variant="body2" sx={{ flex: 1, fontWeight: selectedSort === 'dateOldest' ? 700 : 500 }}>
              Join Date: Oldest
            </Typography>
            {selectedSort === 'dateOldest' && (
              <Check sx={{ fontSize: 18, color: colors.brandRed }} />
            )}
          </MenuItem>
          <MenuItem 
            onClick={() => { setSelectedSort('nameAZ'); setSpFilterAnchor(null); }}
            selected={selectedSort === 'nameAZ'}
            sx={{
              py: 1.5,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              backgroundColor: selectedSort === 'nameAZ' ? `${colors.brandRed}0D` : 'transparent',
              '&:hover': {
                backgroundColor: `${colors.brandRed}0D`,
              },
              '&.Mui-selected': {
                backgroundColor: `${colors.brandRed}0D`,
                '&:hover': {
                  backgroundColor: `${colors.brandRed}1A`,
                },
              },
            }}
          >
            <Sort sx={{ fontSize: 18, color: colors.textSecondary }} />
            <Typography variant="body2" sx={{ flex: 1, fontWeight: selectedSort === 'nameAZ' ? 700 : 500 }}>
              Name: A-Z
            </Typography>
            {selectedSort === 'nameAZ' && (
              <Check sx={{ fontSize: 18, color: colors.brandRed }} />
            )}
          </MenuItem>
          <MenuItem 
            onClick={() => { setSelectedSort('nameZA'); setSpFilterAnchor(null); }}
            selected={selectedSort === 'nameZA'}
            sx={{
              py: 1.5,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              backgroundColor: selectedSort === 'nameZA' ? `${colors.brandRed}0D` : 'transparent',
              '&:hover': {
                backgroundColor: `${colors.brandRed}0D`,
              },
              '&.Mui-selected': {
                backgroundColor: `${colors.brandRed}0D`,
                '&:hover': {
                  backgroundColor: `${colors.brandRed}1A`,
                },
              },
            }}
          >
            <Sort sx={{ fontSize: 18, color: colors.textSecondary, transform: 'rotate(180deg)' }} />
            <Typography variant="body2" sx={{ flex: 1, fontWeight: selectedSort === 'nameZA' ? 700 : 500 }}>
              Name: Z-A
            </Typography>
            {selectedSort === 'nameZA' && (
              <Check sx={{ fontSize: 18, color: colors.brandRed }} />
            )}
          </MenuItem>
        </Menu>
        <Button
          variant="outlined"
          startIcon={<FilterList sx={{ color: colors.textSecondary }} />}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          sx={{
            flex: 1,
            borderColor: colors.brandWhite,
            color: colors.brandBlack,
            backgroundColor: colors.brandWhite,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1.5,
            boxShadow: `0 2px 8px ${colors.shadow}14`,
            '&:hover': {
              backgroundColor: colors.brandWhite,
            },
            position: 'relative',
          }}
        >
          Filters
          {(leaguePreference !== 'all' || clubPreference !== 'all' || countryFilter !== 'all' || accuracyRange !== 'all') && (
            <Badge
              badgeContent={
                [leaguePreference, clubPreference, countryFilter, accuracyRange].filter(f => f !== 'all').length
              }
              color="error"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                '& .MuiBadge-badge': {
                  backgroundColor: colors.brandRed,
                  color: colors.brandWhite,
                  fontSize: 10,
                  minWidth: 18,
                  height: 18,
                },
              }}
            />
          )}
        </Button>
      </Box>

      {/* Advanced Filters Section */}
      {showAdvancedFilters && (
        <Card
          sx={{
            padding: 3,
            mb: 3,
            borderRadius: '16px',
            backgroundColor: colors.brandWhite,
            boxShadow: `0 2px 8px ${colors.shadow}14`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList sx={{ color: colors.brandRed, fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack }}>
                Advanced Filters
              </Typography>
            </Box>
            <Button
              onClick={() => {
                setLeaguePreference('all');
                setClubPreference('all');
                setCountryFilter('all');
                setAccuracyRange('all');
              }}
              sx={{
                color: colors.brandRed,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: `${colors.brandRed}0D`,
                },
              }}
            >
              Clear All
            </Button>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: colors.textSecondary }}>League Preference</InputLabel>
                <Select
                  value={leaguePreference}
                  onChange={(e) => setLeaguePreference(e.target.value)}
                  label="League Preference"
                  sx={{
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: `${colors.brandRed}26`,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.brandRed,
                    },
                    '& .MuiSvgIcon-root': {
                      color: colors.brandRed,
                    },
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Premier League">Premier League</MenuItem>
                  <MenuItem value="La Liga">La Liga</MenuItem>
                  <MenuItem value="Serie A">Serie A</MenuItem>
                  <MenuItem value="Bundesliga">Bundesliga</MenuItem>
                  <MenuItem value="Ligue 1">Ligue 1</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: colors.textSecondary }}>Club Preference</InputLabel>
                <Select
                  value={clubPreference}
                  onChange={(e) => setClubPreference(e.target.value)}
                  label="Club Preference"
                  sx={{
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: `${colors.brandRed}26`,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.brandRed,
                    },
                    '& .MuiSvgIcon-root': {
                      color: colors.brandRed,
                    },
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Manchester United">Manchester United</MenuItem>
                  <MenuItem value="Liverpool">Liverpool</MenuItem>
                  <MenuItem value="Arsenal">Arsenal</MenuItem>
                  <MenuItem value="Chelsea">Chelsea</MenuItem>
                  <MenuItem value="Barcelona">Barcelona</MenuItem>
                  <MenuItem value="Real Madrid">Real Madrid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: colors.textSecondary }}>Country</InputLabel>
                <Select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  label="Country"
                  sx={{
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: `${colors.brandRed}26`,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.brandRed,
                    },
                    '& .MuiSvgIcon-root': {
                      color: colors.brandRed,
                    },
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="United States">United States</MenuItem>
                  <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                  <MenuItem value="Canada">Canada</MenuItem>
                  <MenuItem value="Australia">Australia</MenuItem>
                  <MenuItem value="Germany">Germany</MenuItem>
                  <MenuItem value="France">France</MenuItem>
                  <MenuItem value="Spain">Spain</MenuItem>
                  <MenuItem value="Italy">Italy</MenuItem>
                  <MenuItem value="Brazil">Brazil</MenuItem>
                  <MenuItem value="India">India</MenuItem>
                  <MenuItem value="Nigeria">Nigeria</MenuItem>
                  <MenuItem value="South Africa">South Africa</MenuItem>
                  <MenuItem value="Kenya">Kenya</MenuItem>
                  <MenuItem value="Ghana">Ghana</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: colors.textSecondary }}>Accuracy Range</InputLabel>
                <Select
                  value={accuracyRange}
                  onChange={(e) => setAccuracyRange(e.target.value)}
                  label="Accuracy Range"
                  sx={{
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: `${colors.brandRed}26`,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.brandRed,
                    },
                    '& .MuiSvgIcon-root': {
                      color: colors.brandRed,
                    },
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="0-25">0-25%</MenuItem>
                  <MenuItem value="26-50">26-50%</MenuItem>
                  <MenuItem value="51-75">51-75%</MenuItem>
                  <MenuItem value="76-100">76-100%</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Users List Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              padding: 0.75,
              backgroundColor: colors.brandRed,
              borderRadius: '8px',
            }}
          >
            <People sx={{ fontSize: 18, color: colors.brandWhite }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: colors.brandBlack,
              fontSize: 18,
            }}
          >
            Users List
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.textSecondary,
              fontSize: 13,
              ml: 1,
            }}
          >
            {filteredUsers.length} users found
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.divider,
              },
            }}
          >
            <MenuItem value={10}>10 per page</MenuItem>
            <MenuItem value={25}>25 per page</MenuItem>
            <MenuItem value={50}>50 per page</MenuItem>
            <MenuItem value={100}>100 per page</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedUsers}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredUsers.length}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onRowClick={(row) => navigate(`${constants.routes.users}/details/${row.id}`)}
        emptyMessage="No users found"
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
            if (selectedUser) {
              navigate(`${constants.routes.users}/details/${selectedUser.id}`);
            }
            handleMenuClose();
          }}
        >
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
          }}
        >
          Edit User
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
          }}
          sx={{ color: colors.error }}
        >
          Suspend User
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UsersPage;
