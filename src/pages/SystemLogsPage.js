import React, { useState, useEffect } from 'react';
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
  Shield,
  Description,
  CheckCircle,
  Warning,
  Error,
  Info,
  Visibility,
  Lock,
  Settings,
  Person,
  List,
  FilterList,
  ArrowDropDown,
  CalendarToday,
  FileDownload,
  RemoveRedEye,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';

const SystemLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('dateNewest');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [dateMenuAnchor, setDateMenuAnchor] = useState(null);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterAndSortLogs();
  }, [logs, searchQuery, typeFilter, adminFilter, dateRangeFilter, selectedSort]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const logsRef = collection(db, 'systemLogs');
      const q = query(logsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const logsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLogs(logsData);
      setFilteredLogs(logsData);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortLogs = () => {
    let filtered = [...logs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.event?.toLowerCase().includes(query) ||
          log.adminName?.toLowerCase().includes(query) ||
          log.relatedUsername?.toLowerCase().includes(query) ||
          log.logId?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((log) => {
        const type = log.type || log.logType;
        const severity = log.severity || log.severityLevel;
        if (typeFilter === 'critical') {
          return type === 'critical' || severity === 'high' || severity === 'critical';
        } else if (typeFilter === 'security') {
          return type === 'security' || log.event?.toLowerCase().includes('security') || log.event?.toLowerCase().includes('fraud');
        } else if (typeFilter === 'system') {
          return type === 'system' || type === 'info';
        } else if (typeFilter === 'admin') {
          return type === 'admin' || log.event?.toLowerCase().includes('admin');
        }
        return type === typeFilter;
      });
    }

    if (adminFilter !== 'all') {
      filtered = filtered.filter((log) => log.adminId === adminFilter);
    }

    const now = new Date();
    if (dateRangeFilter === 'today') {
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      filtered = filtered.filter((log) => {
        const date = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
        return date >= startOfToday;
      });
    } else if (dateRangeFilter === 'last7Days') {
      const last7Days = new Date(now.setDate(now.getDate() - 7));
      filtered = filtered.filter((log) => {
        const date = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
        return date >= last7Days;
      });
    } else if (dateRangeFilter === 'last30Days') {
      const last30Days = new Date(now.setDate(now.getDate() - 30));
      filtered = filtered.filter((log) => {
        const date = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
        return date >= last30Days;
      });
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
      case 'severityHigh':
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        filtered.sort((a, b) => {
          const typeA = a.type || a.logType || 'info';
          const typeB = b.type || b.logType || 'info';
          return (severityOrder[typeA] || 2) - (severityOrder[typeB] || 2);
        });
        break;
      case 'severityLow':
        const severityOrderLow = { critical: 0, warning: 1, info: 2 };
        filtered.sort((a, b) => {
          const typeA = a.type || a.logType || 'info';
          const typeB = b.type || b.logType || 'info';
          return (severityOrderLow[typeB] || 2) - (severityOrderLow[typeA] || 2);
        });
        break;
      default:
        break;
    }

    setFilteredLogs(filtered);
  };

  const getSeverityChip = (severity, type) => {
    const severityLevel = severity || type || 'normal';
    const severityConfig = {
      high: { label: 'HIGH', color: colors.error },
      critical: { label: 'HIGH', color: colors.error },
      medium: { label: 'MEDIUM', color: colors.warning },
      warning: { label: 'MEDIUM', color: colors.warning },
      low: { label: 'LOW', color: colors.success },
      normal: { label: 'NORMAL', color: colors.info },
      info: { label: 'NORMAL', color: colors.info },
    };

    const config = severityConfig[severityLevel.toLowerCase()] || severityConfig.normal;

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: `${config.color}1A`,
          color: config.color,
          fontWeight: 700,
          fontSize: 11,
          borderRadius: '20px',
          height: 24,
        }}
      />
    );
  };

  const getStatusChip = (status) => {
    const statusValue = status || 'unresolved';
    const isResolved = statusValue === 'acknowledged' || statusValue === 'resolved';
    
    return (
      <Chip
        label={isResolved ? 'ACKNOWLEDGED' : 'UNRESOLVED'}
        size="small"
        sx={{
          backgroundColor: isResolved ? `${colors.info}1A` : `${colors.error}1A`,
          color: isResolved ? colors.info : colors.error,
          fontWeight: 700,
          fontSize: 11,
          borderRadius: '20px',
          height: 24,
        }}
      />
    );
  };

  const getUserChip = (username) => {
    return (
      <Chip
        label={username || 'N/A'}
        size="small"
        sx={{
          backgroundColor: `${colors.error}1A`,
          color: colors.error,
          fontWeight: 600,
          fontSize: 11,
          borderRadius: '20px',
          height: 24,
        }}
      />
    );
  };

  const criticalLogs = logs.filter((l) => (l.type || l.logType) === 'critical' || (l.severity || l.severityLevel) === 'high');
  const securityLogs = logs.filter((l) => (l.type || l.logType) === 'security' || l.event?.toLowerCase().includes('security') || l.event?.toLowerCase().includes('fraud'));
  const unresolvedLogs = logs.filter((l) => {
    const status = l.status || l.logStatus;
    return status !== 'acknowledged' && status !== 'resolved';
  });

  const getDateSortLabel = () => {
    switch (selectedSort) {
      case 'dateNewest':
        return 'Newest First';
      case 'dateOldest':
        return 'Oldest First';
      default:
        return 'Newest First';
    }
  };

  const handleDateMenuClose = (value) => {
    if (value) setDateRangeFilter(value);
    setDateMenuAnchor(null);
  };

  const handleAdminMenuClose = (value) => {
    if (value) setAdminFilter(value);
    setAdminMenuAnchor(null);
  };

  const handleSortMenuClose = (value) => {
    if (value) setSelectedSort(value);
    setSortMenuAnchor(null);
  };

  const columns = [
    {
      id: 'severity',
      label: 'Severity',
      render: (_, row) => getSeverityChip(row.severity || row.severityLevel, row.type || row.logType),
    },
    {
      id: 'event',
      label: 'Event',
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
          {value || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'relatedUsername',
      label: 'User',
      render: (value) => getUserChip(value),
    },
    {
      id: 'adminName',
      label: 'Admin',
      render: (value, row) => {
        const adminName = value || row.adminId || 'System';
        const isAuto = adminName.toLowerCase().includes('auto');
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isAuto && <Settings sx={{ fontSize: 14, color: colors.info }} />}
            <Typography
              variant="body2"
              sx={{
                color: isAuto ? colors.info : colors.brandBlack,
                fontSize: 14,
              }}
            >
              {adminName.length > 20 ? `${adminName.substring(0, 20)}...` : adminName}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Date',
      render: (value) => {
        if (!value) return 'N/A';
        const date = value?.toDate ? value.toDate() : new Date(value);
        return (
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 14 }}>
            {format(date, 'MMM d, yyyy HH:mm')}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => getStatusChip(row.status || row.logStatus),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const isResolved = (row.status || row.logStatus) === 'acknowledged' || (row.status || row.logStatus) === 'resolved';
        return (
          <Button
            variant="contained"
            size="small"
            startIcon={<RemoveRedEye sx={{ fontSize: 16 }} />}
            onClick={(e) => {
              e.stopPropagation();
              // Handle view/resolve action
            }}
            sx={{
              backgroundColor: colors.info,
              color: colors.brandWhite,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 12,
              px: 2,
              py: 0.5,
              '&:hover': {
                backgroundColor: colors.info,
                opacity: 0.9,
              },
            }}
          >
            View
          </Button>
        );
      },
    },
  ];

  const paginatedLogs = filteredLogs.slice(
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
            <Shield sx={{ fontSize: 28, color: colors.brandWhite }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.brandBlack,
              fontSize: { xs: 24, md: 28 },
            }}
          >
            System Logs & Security
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
          Immutable audit trail - Black Box Recorder
        </Typography>
      </Box>

      {/* Security Alerts Section */}
      {unresolvedLogs.length > 0 && (
        <Card
          sx={{
            padding: 2.5,
            mb: 3,
            borderRadius: '16px',
            backgroundColor: `${colors.error}0D`,
            border: `1.5px solid ${colors.error}33`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 0,
                height: 0,
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderBottom: '20px solid',
                borderBottomColor: colors.error,
                position: 'relative',
                '&::after': {
                  content: '"!"',
                  position: 'absolute',
                  top: 4,
                  left: -6,
                  color: colors.brandWhite,
                  fontWeight: 700,
                  fontSize: 14,
                },
              }}
            />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: colors.error,
                  fontSize: 14,
                  textTransform: 'uppercase',
                  mb: 0.5,
                }}
              >
                SECURITY ALERTS
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: colors.brandBlack,
                  fontSize: 13,
                }}
              >
                {unresolvedLogs.length} unresolved critical/security logs require Super Admin attention
              </Typography>
            </Box>
          </Box>
        </Card>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Total Logs */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              borderRadius: '16px',
              boxShadow: `0 4px 12px ${colors.shadow}14`,
              backgroundColor: `${colors.info}0D`,
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
                <Description sx={{ fontSize: 24, color: colors.brandWhite }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.25 }}>
                  {logs.length}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 14 }}>
                  Total Logs
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Critical */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              borderRadius: '16px',
              boxShadow: `0 4px 12px ${colors.shadow}14`,
              backgroundColor: `${colors.error}0D`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  backgroundColor: colors.error,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Error sx={{ fontSize: 24, color: colors.brandWhite }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.25 }}>
                  {criticalLogs.length}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 14 }}>
                  Critical
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Security */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              borderRadius: '16px',
              boxShadow: `0 4px 12px ${colors.shadow}14`,
              backgroundColor: `${colors.warning}0D`,
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
                <Lock sx={{ fontSize: 24, color: colors.brandWhite }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.25 }}>
                  {securityLogs.length}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 14 }}>
                  Security
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Unresolved */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              borderRadius: '16px',
              boxShadow: `0 4px 12px ${colors.shadow}14`,
              backgroundColor: `${colors.error}0D`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  backgroundColor: colors.error,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Warning sx={{ fontSize: 24, color: colors.brandWhite }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.25 }}>
                  {unresolvedLogs.length}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 14 }}>
                  Unresolved
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {[
          { value: 'all', label: 'All Logs', icon: List, color: colors.brandRed },
          { value: 'critical', label: 'Critical', icon: Error, color: colors.error },
          { value: 'security', label: 'Security', icon: Lock, color: colors.warning },
          { value: 'system', label: 'System', icon: Settings, color: colors.info },
          { value: 'admin', label: 'Admin Activity', icon: Person, color: colors.success },
        ].map((filter) => {
          const isSelected = typeFilter === filter.value;
          const Icon = filter.icon;
          return (
            <Button
              key={filter.value}
              variant={isSelected ? 'contained' : 'outlined'}
              onClick={() => setTypeFilter(filter.value)}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                backgroundColor: isSelected ? filter.color : colors.brandWhite,
                color: isSelected ? colors.brandWhite : filter.color,
                border: `1.5px solid ${isSelected ? filter.color : colors.divider}66`,
                '&:hover': {
                  backgroundColor: isSelected ? filter.color : `${colors.divider}0D`,
                },
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  backgroundColor: `${filter.color}${isSelected ? '' : '1A'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}
              >
                <Icon sx={{ fontSize: 14, color: isSelected ? colors.brandWhite : filter.color }} />
              </Box>
              {filter.label}
            </Button>
          );
        })}
      </Box>

      {/* Advanced Filters */}
      <Card
        sx={{
          padding: 2.5,
          mb: 3,
          borderRadius: '16px',
          backgroundColor: colors.brandWhite,
          boxShadow: `0 4px 12px ${colors.shadow}14`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterList sx={{ fontSize: 18, color: colors.brandRed }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, fontSize: 16 }}>
            Advanced Filters
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontSize: 14 }}>
              Date Range
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={(e) => setDateMenuAnchor(e.currentTarget)}
              endIcon={<ArrowDropDown sx={{ color: colors.brandRed }} />}
              sx={{
                borderRadius: '14px',
                textTransform: 'none',
                fontWeight: 600,
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                color: colors.brandBlack,
                borderColor: `${colors.divider}66`,
                backgroundColor: colors.brandWhite,
                '&:hover': {
                  backgroundColor: `${colors.divider}0D`,
                  borderColor: colors.brandRed,
                },
              }}
            >
              {dateRangeFilter === 'all' ? 'All Time' : dateRangeFilter === 'today' ? 'Today' : dateRangeFilter === 'last7Days' ? 'Last 7 Days' : 'Last 30 Days'}
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontSize: 14 }}>
              Admin User
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={(e) => setAdminMenuAnchor(e.currentTarget)}
              endIcon={<ArrowDropDown sx={{ color: colors.brandRed }} />}
              sx={{
                borderRadius: '14px',
                textTransform: 'none',
                fontWeight: 600,
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                color: colors.brandBlack,
                borderColor: `${colors.divider}66`,
                backgroundColor: colors.brandWhite,
                '&:hover': {
                  backgroundColor: `${colors.divider}0D`,
                  borderColor: colors.brandRed,
                },
              }}
            >
              {adminFilter === 'all' ? 'All Admins' : logs.find((l) => l.adminId === adminFilter)?.adminName || adminFilter}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Search and Action Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ flexGrow: 1, minWidth: 300 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search logs by event, admin, or user..."
          />
        </Box>
        <Button
          variant="outlined"
          onClick={(e) => setSortMenuAnchor(e.currentTarget)}
          endIcon={<ArrowDropDown sx={{ color: colors.brandRed }} />}
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
          Date: {getDateSortLabel()}
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownload sx={{ fontSize: 18 }} />}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            backgroundColor: colors.success,
            '&:hover': {
              backgroundColor: colors.success,
              opacity: 0.9,
            },
          }}
        >
          Export
        </Button>
      </Box>

      {/* Audit Trail Header */}
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
            <Description sx={{ fontSize: 18, color: colors.brandWhite }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, fontSize: 16 }}>
            Audit Trail
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 14 }}>
            {filteredLogs.length} logs • Page {page + 1} of {Math.ceil(filteredLogs.length / rowsPerPage) || 1}
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
        data={paginatedLogs}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredLogs.length}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        emptyMessage="No system logs found"
      />

      {/* Date Range Menu */}
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
        <MenuItem onClick={() => handleDateMenuClose('all')}>All Time</MenuItem>
        <MenuItem onClick={() => handleDateMenuClose('today')}>Today</MenuItem>
        <MenuItem onClick={() => handleDateMenuClose('last7Days')}>Last 7 Days</MenuItem>
        <MenuItem onClick={() => handleDateMenuClose('last30Days')}>Last 30 Days</MenuItem>
      </Menu>

      {/* Admin Menu */}
      <Menu
        anchorEl={adminMenuAnchor}
        open={Boolean(adminMenuAnchor)}
        onClose={() => handleAdminMenuClose(null)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={() => handleAdminMenuClose('all')}>All Admins</MenuItem>
        {[...new Set(logs.map((l) => l.adminId).filter(Boolean))].map((adminId) => {
          const log = logs.find((l) => l.adminId === adminId);
          return (
            <MenuItem key={adminId} onClick={() => handleAdminMenuClose(adminId)}>
              {log?.adminName || adminId}
            </MenuItem>
          );
        })}
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => handleSortMenuClose(null)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={() => handleSortMenuClose('dateNewest')}>Newest First</MenuItem>
        <MenuItem onClick={() => handleSortMenuClose('dateOldest')}>Oldest First</MenuItem>
        <MenuItem onClick={() => handleSortMenuClose('severityHigh')}>Severity (High to Low)</MenuItem>
        <MenuItem onClick={() => handleSortMenuClose('severityLow')}>Severity (Low to High)</MenuItem>
      </Menu>
    </Box>
  );
};

export default SystemLogsPage;
