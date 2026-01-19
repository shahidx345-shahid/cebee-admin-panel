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
  FilterList,
  ArrowDropDown,
  MoreVert,
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchQuery, selectedStatus, selectedSort]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
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
          user.id?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((user) => {
        if (selectedStatus === 'active') return user.isActive === true && !user.isDeleted;
        if (selectedStatus === 'inactive') return user.isActive === false && !user.isDeleted;
        if (selectedStatus === 'suspended') return user.status === 'suspended';
        if (selectedStatus === 'flagged') return user.fraudFlags && user.fraudFlags.length > 0;
        return true;
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

  const activeCount = users.filter((u) => u.isActive && !u.isDeleted).length;
  const verifiedCount = users.filter((u) => u.isVerified).length;
  const totalPredictions = users.reduce((sum, u) => sum + (u.totalPredictions || 0), 0);

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
              {totalPredictions} Total Predictions
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* User Status Tabs */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={selectedStatus}
          exclusive
          onChange={(e, newValue) => {
            if (newValue !== null) setSelectedStatus(newValue);
          }}
          sx={{
            '& .MuiToggleButton-root': {
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              border: `1.5px solid ${colors.divider}66`,
              '&.Mui-selected': {
                backgroundColor: colors.success,
                color: colors.brandWhite,
                borderColor: colors.success,
                '&:hover': {
                  backgroundColor: colors.success,
                },
              },
            },
          }}
        >
          <ToggleButton value="active">
            <CheckCircle sx={{ fontSize: 18, mr: 1 }} />
            Active Users
          </ToggleButton>
          <ToggleButton value="inactive">
            <Cancel sx={{ fontSize: 18, mr: 1, color: colors.error }} />
            Inactive Users
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Search and Filter Bar */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 300 }}>
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
          }
          endIcon={<ArrowDropDown sx={{ color: colors.brandRed }} />}
          onClick={(e) => setSpFilterAnchor(e.currentTarget)}
          sx={{
            borderColor: colors.brandWhite,
            color: colors.brandBlack,
            backgroundColor: colors.brandWhite,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1,
            boxShadow: `0 2px 8px ${colors.shadow}14`,
          }}
        >
          SP: {selectedSort === 'spHigh' ? 'High' : selectedSort === 'spLow' ? 'Low' : 'High'}
        </Button>
        <Menu
          anchorEl={spFilterAnchor}
          open={Boolean(spFilterAnchor)}
          onClose={() => setSpFilterAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 180,
              boxShadow: `0 4px 12px ${colors.shadow}33`,
            },
          }}
        >
          <MenuItem onClick={() => { setSelectedSort('spHigh'); setSpFilterAnchor(null); }}>
            SP: High
          </MenuItem>
          <MenuItem onClick={() => { setSelectedSort('spLow'); setSpFilterAnchor(null); }}>
            SP: Low
          </MenuItem>
        </Menu>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          sx={{
            borderColor: colors.brandWhite,
            color: colors.brandBlack,
            backgroundColor: colors.brandWhite,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1,
            boxShadow: `0 2px 8px ${colors.shadow}14`,
          }}
        >
          Filters
        </Button>
      </Box>

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
