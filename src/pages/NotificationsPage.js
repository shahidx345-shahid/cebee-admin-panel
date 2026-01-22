import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Chip,
  MenuItem,
  Menu,
  IconButton,
} from '@mui/material';
import {
  Add,
  CheckCircle,
  Schedule,
  Description,
  Error,
  Send,
  Visibility,
  ArrowUpward,
  ArrowDownward,
  ArrowDropDown,
  Search as SearchIcon,
  MoreVert,
  Notifications,
} from '@mui/icons-material';
import { colors } from '../config/theme';
import DataTable from '../components/common/DataTable';
import { format } from 'date-fns';

// Static notifications data
const staticNotifications = [
  {
    id: '1',
    title: 'Welcome to CeBee Predict System',
    body: 'Start making predictions and win rewards!',
    type: 'Important Announcement',
    audience: 'All Users',
    status: 'sent',
    sentCount: 15420,
    deliveredCount: 15230,
    openedCount: 8945,
    openedPercentage: 58.7,
    creator: 'ADMIN_001',
    createdAt: new Date('2026-01-22T11:51:00'),
    scheduledTime: null,
  },
  {
    id: '2',
    title: 'New Poll: Who Will Win the Title?',
    body: 'Cast your vote for the league winner!',
    type: 'New Poll Available',
    audience: 'All Users',
    status: 'sent',
    sentCount: 15420,
    deliveredCount: 15230,
    openedCount: 8945,
    openedPercentage: 58.7,
    creator: 'ADMIN_001',
    createdAt: new Date('2026-01-22T08:51:00'),
    scheduledTime: null,
  },
  {
    id: '3',
    title: 'Poll Closing in 1 Hour!',
    body: 'Last chance to vote on the current poll',
    type: 'Poll Ending Soon',
    audience: 'Active Users (30 days)',
    status: 'sent',
    sentCount: 8750,
    deliveredCount: 8640,
    openedCount: 6238,
    openedPercentage: 72.2,
    creator: 'ADMIN_001',
    createdAt: new Date('2026-01-22T05:51:00'),
    scheduledTime: null,
  },
  {
    id: '4',
    title: 'Your Reward Has Been Sent!',
    body: 'Congratulations! Your reward has been processed.',
    type: 'Reward Processed',
    audience: 'Winners',
    status: 'sent',
    sentCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    openedPercentage: 100.0,
    creator: 'ADMIN_001',
    createdAt: new Date('2026-01-21T13:51:00'),
    scheduledTime: null,
  },
  {
    id: '5',
    title: 'Premier League Matchday Info',
    body: 'New matchday fixtures are now available',
    type: 'New Matchday Available',
    audience: 'All Users',
    status: 'sent',
    sentCount: 16230,
    deliveredCount: 16010,
    openedCount: 11527,
    openedPercentage: 72.0,
    creator: 'ADMIN_001',
    createdAt: new Date('2026-01-21T13:51:00'),
    scheduledTime: null,
  },
  {
    id: '6',
    title: 'Poll Results: Player of the Month',
    body: 'The results are in! See who won.',
    type: 'Poll Results Announced',
    audience: 'All Users',
    status: 'sent',
    sentCount: 14500,
    deliveredCount: 14200,
    openedCount: 9798,
    openedPercentage: 69.0,
    creator: 'ADMIN_002',
    createdAt: new Date('2026-01-21T08:51:00'),
    scheduledTime: null,
  },
  {
    id: '7',
    title: 'Predictions Closing Soon!',
    body: 'Submit your predictions before time runs out',
    type: 'Prediction Reminder',
    audience: 'Active Users (30 days)',
    status: 'sent',
    sentCount: 9500,
    deliveredCount: 9380,
    openedCount: 7234,
    openedPercentage: 77.1,
    creator: 'ADMIN_002',
    createdAt: new Date('2026-01-20T13:51:00'),
    scheduledTime: null,
  },
  {
    id: '8',
    title: "You're Now in the Top 100!",
    body: 'Congratulations on reaching the top 100 leaderboard!',
    type: 'Leaderboard Update',
    audience: 'Active Users (30 days)',
    status: 'sent',
    sentCount: 150,
    deliveredCount: 148,
    openedCount: 142,
    openedPercentage: 95.9,
    creator: 'ADMIN_001',
    createdAt: new Date('2026-01-20T10:51:00'),
    scheduledTime: null,
  },
  {
    id: '9',
    title: 'Match Results Are In!',
    body: 'Check out the latest match results and standings',
    type: 'Match Ended',
    audience: 'Active Users (30 days)',
    status: 'sent',
    sentCount: 8200,
    deliveredCount: 8100,
    openedCount: 6496,
    openedPercentage: 80.2,
    creator: 'ADMIN_001',
    createdAt: new Date('2026-01-19T13:51:00'),
    scheduledTime: null,
  },
  {
    id: '10',
    title: 'Your November Reward is Approved',
    body: 'Your reward for November has been approved and will be sent soon',
    type: 'Reward Approved',
    audience: 'Winners',
    status: 'sent',
    sentCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    openedPercentage: 100.0,
    creator: 'ADMIN_001',
    createdAt: new Date('2026-01-19T12:51:00'),
    scheduledTime: null,
  },
  {
    id: '11',
    title: 'System Maintenance Notice',
    body: 'Scheduled maintenance on Sunday 2AM-4AM',
    type: 'System Update',
    audience: 'All Users',
    status: 'sent',
    sentCount: 16230,
    deliveredCount: 16100,
    openedCount: 7986,
    openedPercentage: 49.6,
    creator: 'ADMIN_001',
    createdAt: new Date('2026-01-19T10:00:00'),
    scheduledTime: null,
  },
  {
    id: '12',
    title: 'Referral Bonus Unlocked',
    body: 'You earned 500 SP for referring friends!',
    type: 'Referral Reward',
    audience: 'Winners',
    status: 'sent',
    sentCount: 89,
    deliveredCount: 89,
    openedCount: 86,
    openedPercentage: 96.6,
    creator: 'ADMIN_001',
    createdAt: new Date('2026-01-18T15:45:00'),
    scheduledTime: null,
  },
];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications] = useState(staticNotifications);
  const [filteredNotifications, setFilteredNotifications] = useState(staticNotifications);
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('sent');
  const [typeFilter, setTypeFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('dateNewest');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortAnchor, setSortAnchor] = useState(null);

  // Calculate stats from static data
  const totalSent = staticNotifications.reduce((sum, notif) => sum + (notif.sentCount || 0), 0);
  const totalDelivered = staticNotifications.reduce((sum, notif) => sum + (notif.deliveredCount || 0), 0);
  const totalOpened = staticNotifications.reduce((sum, notif) => sum + (notif.openedCount || 0), 0);
  const scheduledCount = staticNotifications.filter(n => n.status === 'scheduled').length;

  const deliveredRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0.0';
  const openedRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0.0';

  useEffect(() => {
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
    filterAndSortNotifications();
  }, [notifications, searchQuery, selectedStatus, typeFilter, audienceFilter, selectedSort]);


  const columns = [
    {
      id: 'title',
      label: 'Title',
      render: (value, row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 14 }}>
            {value || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      render: (value) => (
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13, fontWeight: 500 }}>
          {value || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'audience',
      label: 'Audience',
      render: (value) => (
        <Typography variant="body2" sx={{ color: colors.brandRed, fontWeight: 600, fontSize: 13 }}>
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
              backgroundColor: `${colors.success}1A`,
              color: colors.success,
              fontWeight: 700,
              fontSize: 11,
              borderRadius: '6px',
              height: 24,
            }}
          />
        );
      },
    },
    {
      id: 'sentCount',
      label: 'Sent',
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
          {row.sentCount?.toLocaleString() || row.totalSent?.toLocaleString() || '0'}
        </Typography>
      ),
    },
    {
      id: 'deliveredCount',
      label: 'Delivered',
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
          {row.deliveredCount?.toLocaleString() || '0'}
        </Typography>
      ),
    },
    {
      id: 'openedPercentage',
      label: 'Opened %',
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: colors.success, fontSize: 14 }}>
          {value?.toFixed(1) || 0}%
        </Typography>
      ),
    },
    {
      id: 'creator',
      label: 'Creator',
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13 }}>
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
        return (
          <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>
            {format(date, 'MMM dd, HH:mm')}
          </Typography>
        );
      },
    },
    {
      id: 'schedule',
      label: 'Scheduled',
      render: (_, row) => {
        const hasSchedule = row.scheduledTime || row.schedule;
        return (
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
            {hasSchedule ? format(hasSchedule?.toDate ? hasSchedule.toDate() : new Date(hasSchedule), 'MMM dd, HH:mm') : '-'}
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
          sx={{
            backgroundColor: `${colors.brandRed}1A`,
            color: colors.brandRed,
            width: 36,
            height: 36,
            border: `1.5px solid ${colors.brandRed}33`,
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: `${colors.brandRed}33`,
            },
          }}
        >
          <MoreVert sx={{ fontSize: 20 }} />
        </IconButton>
      ),
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
                <Send sx={{ fontSize: 24, color: colors.brandWhite, transform: 'rotate(-45deg)' }} />
              </Box>
              <Chip
                label="+12.5%"
                size="small"
                icon={<ArrowUpward sx={{ fontSize: 14 }} />}
                sx={{
                  backgroundColor: `${colors.brandWhite}26`,
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
                label={`+${deliveredRate}%`}
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
                label={`+${openedRate}%`}
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
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        {/* Sent Button */}
        <Button
          variant={selectedStatus === 'sent' ? 'contained' : 'outlined'}
          onClick={() => setSelectedStatus('sent')}
          startIcon={
            <CheckCircle
              sx={{
                fontSize: 18,
                color: selectedStatus === 'sent' ? colors.brandWhite : colors.success,
              }}
            />
          }
          sx={{
            flex: 1,
            borderRadius: '16px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 15,
            px: 3,
            py: 1.75,
            backgroundColor: selectedStatus === 'sent' ? colors.success : colors.brandWhite,
            color: selectedStatus === 'sent' ? colors.brandWhite : colors.textSecondary,
            border: `2px solid ${selectedStatus === 'sent' ? colors.success : colors.divider}`,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: selectedStatus === 'sent' ? colors.success : `${colors.backgroundLight}`,
              boxShadow: 'none',
            },
          }}
        >
          Sent
        </Button>

        {/* Scheduled Button */}
        <Button
          variant="outlined"
          onClick={() => setSelectedStatus('scheduled')}
          startIcon={
            <Schedule
              sx={{
                fontSize: 18,
                color: colors.info,
              }}
            />
          }
          sx={{
            flex: 1,
            borderRadius: '16px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 15,
            px: 3,
            py: 1.75,
            backgroundColor: colors.brandWhite,
            color: colors.textSecondary,
            border: `2px solid ${colors.divider}`,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: `${colors.backgroundLight}`,
              boxShadow: 'none',
            },
          }}
        >
          Scheduled
        </Button>

        {/* Drafts Button */}
        <Button
          variant="outlined"
          onClick={() => setSelectedStatus('draft')}
          startIcon={
            <Description
              sx={{
                fontSize: 18,
                color: colors.warning,
              }}
            />
          }
          sx={{
            flex: 1,
            borderRadius: '16px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 15,
            px: 3,
            py: 1.75,
            backgroundColor: colors.brandWhite,
            color: colors.textSecondary,
            border: `2px solid ${colors.divider}`,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: `${colors.backgroundLight}`,
              boxShadow: 'none',
            },
          }}
        >
          Drafts
        </Button>

        {/* Failed Button */}
        <Button
          variant="outlined"
          onClick={() => setSelectedStatus('failed')}
          startIcon={
            <Error
              sx={{
                fontSize: 18,
                color: colors.error,
              }}
            />
          }
          sx={{
            flex: 1,
            borderRadius: '16px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 15,
            px: 3,
            py: 1.75,
            backgroundColor: colors.brandWhite,
            color: colors.textSecondary,
            border: `2px solid ${colors.divider}`,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: `${colors.backgroundLight}`,
              boxShadow: 'none',
            },
          }}
        >
          Failed
        </Button>
      </Box>

      {/* Search and Action Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search Bar */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              padding: '14px 20px',
              backgroundColor: colors.brandWhite,
              borderRadius: '25px',
              border: `1.5px solid ${colors.divider}40`,
            }}
          >
            <SearchIcon sx={{ fontSize: 22, color: colors.brandRed }} />
            <input
              type="text"
              placeholder="Search by title, message or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                flex: 1,
                fontSize: 14,
                fontFamily: 'inherit',
                color: colors.brandBlack,
                backgroundColor: 'transparent',
              }}
            />
          </Box>
        </Box>

        {/* Date Sort Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowDownward sx={{ fontSize: 18, color: colors.brandRed }} />}
          endIcon={<ArrowDropDown sx={{ fontSize: 18 }} />}
          onClick={(e) => setSortAnchor(e.currentTarget)}
          sx={{
            borderColor: `${colors.brandRed}26`,
            color: colors.brandBlack,
            backgroundColor: `${colors.brandRed}0D`,
            borderRadius: '25px',
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            py: 1.5,
            minWidth: 200,
            '&:hover': {
              borderColor: `${colors.brandRed}40`,
              backgroundColor: `${colors.brandRed}1A`,
            },
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
              boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2)`,
              mt: 0.5,
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

        {/* Create Notification Button */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/notifications/create')}
          sx={{
            background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
            borderRadius: '25px',
            textTransform: 'none',
            fontWeight: 700,
            px: 4,
            py: 1.5,
            fontSize: 15,
            boxShadow: `0 4px 12px ${colors.brandRed}40`,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.brandDarkRed} 0%, ${colors.brandRed} 100%)`,
              boxShadow: `0 6px 16px ${colors.brandRed}50`,
            },
          }}
        >
          Create Notification
        </Button>
      </Box>

      {/* Notifications List Header */}
      <Card
        sx={{
          padding: 2.5,
          mb: 0,
          borderRadius: '16px 16px 0 0',
          backgroundColor: colors.brandWhite,
          border: `1.5px solid ${colors.divider}26`,
          borderBottom: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <Notifications sx={{ fontSize: 24, color: colors.brandWhite }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.25, fontSize: 17 }}>
                Notifications List
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                {filteredNotifications.length} notifications found
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            endIcon={<ArrowDropDown sx={{ fontSize: 18 }} />}
            sx={{
              borderColor: colors.divider,
              color: colors.brandBlack,
              backgroundColor: colors.brandWhite,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              px: 2.5,
              py: 1,
              fontSize: 14,
              '&:hover': {
                borderColor: colors.brandRed,
                backgroundColor: `${colors.brandRed}0D`,
              },
            }}
          >
            {rowsPerPage} / page
          </Button>
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
