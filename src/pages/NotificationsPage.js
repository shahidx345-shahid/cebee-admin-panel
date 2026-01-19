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
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  IconButton,
} from '@mui/material';
import {
  Add,
  Notifications,
  CheckCircle,
  Schedule,
  Description,
  Error,
  Send,
  Visibility,
  TrendingUp,
  ArrowUpward,
  ArrowDownward,
  ArrowDropDown,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('sent');
  const [typeFilter, setTypeFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('dateNewest');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortAnchor, setSortAnchor] = useState(null);

  const totalSent = notifications.length;
  const totalDelivered = notifications.reduce((sum, n) => sum + (n.deliveredCount || 0), 0);
  const totalOpened = notifications.reduce((sum, n) => sum + (n.openedCount || 0), 0);
  const scheduledCount = notifications.filter((n) => (n.status || n.notificationStatus) === 'scheduled').length;
  
  const deliveredRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0.0';
  const openedRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0';

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterAndSortNotifications();
  }, [notifications, searchQuery, selectedStatus, typeFilter, audienceFilter, selectedSort]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notificationsData);
      setFilteredNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortNotifications = () => {
    let filtered = [...notifications];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (notif) =>
          notif.title?.toLowerCase().includes(query) ||
          notif.body?.toLowerCase().includes(query) ||
          notif.id?.toLowerCase().includes(query)
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((notif) => {
        const status = notif.status || notif.notificationStatus;
        return status === selectedStatus;
      });
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((notif) => notif.type === typeFilter);
    }

    if (audienceFilter !== 'all') {
      filtered = filtered.filter((notif) => notif.audience === audienceFilter);
    }

    switch (selectedSort) {
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
      case 'titleAZ':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'titleZA':
        filtered.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'openRateHighest':
        filtered.sort((a, b) => (b.openedPercentage || 0) - (a.openedPercentage || 0));
        break;
      case 'openRateLowest':
        filtered.sort((a, b) => (a.openedPercentage || 0) - (b.openedPercentage || 0));
        break;
      default:
        break;
    }

    setFilteredNotifications(filtered);
  };


  const columns = [
    {
      id: 'title',
      label: 'Title',
      render: (value, row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {value || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      render: (value) => (
        <Chip
          label={value || 'N/A'}
          size="small"
          sx={{
            backgroundColor: `${colors.info}1A`,
            color: colors.info,
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      ),
    },
    {
      id: 'audience',
      label: 'Audience',
      render: (value) => (
        <Typography variant="body2" sx={{ color: colors.brandRed, fontWeight: 600 }}>
          {value || 'All Users'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => {
        const status = row.status || row.notificationStatus || 'sent';
        return (
          <Chip
            label={status.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: colors.success,
              color: colors.brandWhite,
              fontWeight: 600,
              fontSize: 11,
              borderRadius: '20px',
            }}
          />
        );
      },
    },
    {
      id: 'sentCount',
      label: 'Sent',
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.sentCount?.toLocaleString() || row.totalSent?.toLocaleString() || '0'}
        </Typography>
      ),
    },
    {
      id: 'deliveredCount',
      label: 'Delivered',
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.deliveredCount?.toLocaleString() || '0'}
        </Typography>
      ),
    },
    {
      id: 'openedPercentage',
      label: 'Opened %',
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.success }}>
            {value?.toFixed(1) || 0}%
          </Typography>
      ),
    },
    {
      id: 'creator',
      label: 'Creator',
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.creator || row.createdBy || 'ADMIN_001'}
        </Typography>
      ),
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (value) => {
        if (!value) return 'N/A';
        const date = value?.toDate ? value.toDate() : new Date(value);
        return format(date, 'MMM dd, HH:mm');
      },
    },
    {
      id: 'schedule',
      label: 'Schedule',
      render: (_, row) => {
        const hasSchedule = row.scheduledTime || row.schedule;
        return (
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            {hasSchedule ? format(hasSchedule?.toDate ? hasSchedule.toDate() : new Date(hasSchedule), 'MMM dd, HH:mm') : '-'}
          </Typography>
        );
      },
    },
  ];

  const paginatedNotifications = filteredNotifications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const statusTabs = [
    {
      value: 'sent',
      label: 'Sent',
      count: notifications.filter((n) => (n.status || n.notificationStatus) === 'sent').length,
    },
    {
      value: 'scheduled',
      label: 'Scheduled',
      count: notifications.filter((n) => (n.status || n.notificationStatus) === 'scheduled').length,
    },
    {
      value: 'draft',
      label: 'Drafts',
      count: notifications.filter((n) => (n.status || n.notificationStatus) === 'draft').length,
    },
    {
      value: 'failed',
      label: 'Failed',
      count: notifications.filter((n) => (n.status || n.notificationStatus) === 'failed').length,
    },
  ];


  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
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
                <Send sx={{ fontSize: 24, color: colors.brandWhite }} />
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
              {totalSent.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: `${colors.brandWhite}DD`, fontSize: 13 }}>
              Total Sent
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
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle sx={{ fontSize: 24, color: colors.success }} />
              </Box>
              <Chip
                label={`${deliveredRate}%`}
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
              {totalDelivered.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Delivered
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
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Visibility sx={{ fontSize: 24, color: colors.info }} />
              </Box>
                  <Chip
                label={`${openedRate}%`}
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
              {totalOpened.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Opened
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
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Schedule sx={{ fontSize: 24, color: colors.warning }} />
              </Box>
              <Chip
                label="+5.2%"
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
              {scheduledCount}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Scheduled
              </Typography>
            </Card>
          </Grid>
      </Grid>

      {/* Status Filter Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1.5 }}>
        <Button
          variant={selectedStatus === 'sent' ? 'contained' : 'outlined'}
          onClick={() => setSelectedStatus('sent')}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            backgroundColor: selectedStatus === 'sent' ? colors.success : colors.brandWhite,
            color: selectedStatus === 'sent' ? colors.brandWhite : colors.textSecondary,
            border: `1.5px solid ${selectedStatus === 'sent' ? colors.success : colors.divider}66`,
            '&:hover': {
              backgroundColor: selectedStatus === 'sent' ? colors.success : `${colors.divider}0D`,
            },
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: selectedStatus === 'sent' ? `${colors.brandWhite}33` : `${colors.success}1A`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <CheckCircle
              sx={{
                fontSize: 14,
                color: selectedStatus === 'sent' ? colors.brandWhite : colors.success,
              }}
            />
          </Box>
          Sent
        </Button>
        <Button
          variant={selectedStatus === 'scheduled' ? 'contained' : 'outlined'}
          onClick={() => setSelectedStatus('scheduled')}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            backgroundColor: selectedStatus === 'scheduled' ? colors.success : colors.brandWhite,
            color: selectedStatus === 'scheduled' ? colors.brandWhite : colors.info,
            border: `1.5px solid ${selectedStatus === 'scheduled' ? colors.success : colors.divider}66`,
            '&:hover': {
              backgroundColor: selectedStatus === 'scheduled' ? colors.success : `${colors.divider}0D`,
            },
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: `${colors.info}1A`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <Schedule
              sx={{
                fontSize: 14,
                color: colors.info,
              }}
            />
          </Box>
          Scheduled
        </Button>
        <Button
          variant={selectedStatus === 'draft' ? 'contained' : 'outlined'}
          onClick={() => setSelectedStatus('draft')}
          sx={{
            borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
            px: 3,
            py: 1.5,
            backgroundColor: selectedStatus === 'draft' ? colors.success : colors.brandWhite,
            color: selectedStatus === 'draft' ? colors.brandWhite : colors.warning,
            border: `1.5px solid ${selectedStatus === 'draft' ? colors.success : colors.divider}66`,
            '&:hover': {
              backgroundColor: selectedStatus === 'draft' ? colors.success : `${colors.divider}0D`,
            },
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '6px',
              backgroundColor: `${colors.warning}1A`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <Description
              sx={{
              fontSize: 14,
                color: colors.warning,
              }}
            />
          </Box>
          Drafts
        </Button>
        <Button
          variant={selectedStatus === 'failed' ? 'contained' : 'outlined'}
          onClick={() => setSelectedStatus('failed')}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            backgroundColor: selectedStatus === 'failed' ? colors.success : colors.brandWhite,
            color: selectedStatus === 'failed' ? colors.brandWhite : colors.error,
            border: `1.5px solid ${selectedStatus === 'failed' ? colors.success : colors.divider}66`,
            '&:hover': {
              backgroundColor: selectedStatus === 'failed' ? colors.success : `${colors.divider}0D`,
            },
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              backgroundColor: `${colors.error}1A`,
              mr: 1.5,
              position: 'relative',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Error
              sx={{
                fontSize: 12,
                color: colors.error,
                mt: 0.75,
              }}
            />
          </Box>
          Failed
        </Button>
      </Box>

      {/* Search and Action Bar */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 300 }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            placeholder="Search by title, message or ID..."
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowDownward sx={{ fontSize: 18, color: colors.brandRed }} />}
          endIcon={<ArrowDropDown sx={{ fontSize: 18, color: colors.brandRed }} />}
          onClick={(e) => setSortAnchor(e.currentTarget)}
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
          Date: {selectedSort === 'dateNewest' ? 'Newest First' : 'Oldest First'}
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
          <MenuItem onClick={() => { setSelectedSort('dateNewest'); setSortAnchor(null); }}>
            Date: Newest First
          </MenuItem>
          <MenuItem onClick={() => { setSelectedSort('dateOldest'); setSortAnchor(null); }}>
            Date: Oldest First
          </MenuItem>
        </Menu>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/notifications/create')}
          sx={{
            background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
          }}
        >
          Create Notification
        </Button>
      </Box>

      {/* Notifications List Header */}
      <Card
        sx={{
          padding: 2.5,
          mb: 2,
          borderRadius: '16px',
          backgroundColor: colors.brandWhite,
          border: `1.5px solid ${colors.divider}26`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <Notifications sx={{ fontSize: 24, color: colors.brandWhite }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.25 }}>
                Notifications List
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                {filteredNotifications.length} notifications found
              </Typography>
            </Box>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{
                borderRadius: '12px',
                '& .MuiSelect-icon': {
                  color: colors.brandRed,
                },
              }}
            >
              <MenuItem value={10}>10 / page</MenuItem>
              <MenuItem value={25}>25 / page</MenuItem>
              <MenuItem value={50}>50 / page</MenuItem>
              <MenuItem value={100}>100 / page</MenuItem>
              </Select>
            </FormControl>
        </Box>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedNotifications}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredNotifications.length}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onRowClick={(row) => navigate(`/notifications/details/${row.id}`)}
        emptyMessage="No notifications found"
      />
    </Box>
  );
};

export default NotificationsPage;
