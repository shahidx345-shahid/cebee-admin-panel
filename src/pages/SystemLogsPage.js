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
  Tooltip,
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
  AccessTime,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';

import { format } from 'date-fns';
import ResolveLogModal from '../components/logs/ResolveLogModal';

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
      // Mock Data matching screenshot
      const mockLogs = [
        {
          id: '1',
          event: 'Content Updated',
          relatedUsername: null,
          adminName: 'Support Admin',
          adminId: 'admin_3',
          createdAt: new Date('2026-01-23T11:10:00'),
          severity: 'low',
          type: 'system',
          status: 'acknowledged'
        },
        {
          id: '2',
          event: 'Login Anomaly Detected',
          relatedUsername: 'traveling_user',
          adminName: 'Auto-Detection System',
          adminId: 'system',
          createdAt: new Date('2026-01-23T10:40:00'),
          severity: 'medium',
          type: 'security',
          status: 'unresolved'
        },
        {
          id: '3',
          event: 'Match Result Updated',
          relatedUsername: null,
          adminName: 'Super Admin',
          adminId: 'admin_1',
          createdAt: new Date('2026-01-23T10:40:00'),
          severity: 'normal',
          type: 'system',
          status: 'acknowledged'
        },
        {
          id: '4',
          event: 'Reward Payout Processed',
          relatedUsername: 'john_predictor',
          adminName: 'Super Admin',
          adminId: 'admin_1',
          createdAt: new Date('2026-01-23T09:40:00'),
          severity: 'high',
          type: 'critical',
          status: 'unresolved'
        },
        {
          id: '5',
          event: 'Settings Changed',
          relatedUsername: null,
          adminName: 'Super Admin',
          adminId: 'admin_1',
          createdAt: new Date('2026-01-23T09:40:00'),
          severity: 'low',
          type: 'system',
          status: 'acknowledged'
        },
        {
          id: '6',
          event: 'Duplicate Identity Detected',
          relatedUsername: 'duplicate_user',
          adminName: 'Auto-Detection System',
          adminId: 'system',
          createdAt: new Date('2026-01-23T08:40:00'),
          severity: 'medium',
          type: 'security',
          status: 'unresolved'
        },
        {
          id: '7',
          event: 'Leaderboard Calculated',
          relatedUsername: null,
          adminName: 'Backend Service',
          adminId: 'system',
          createdAt: new Date('2026-01-23T07:40:00'),
          severity: 'normal',
          type: 'system',
          status: 'acknowledged'
        },
      ];

      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
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
      high: { label: 'HIGH', color: '#EF4444', bgcolor: '#FEE2E2' },
      critical: { label: 'HIGH', color: '#EF4444', bgcolor: '#FEE2E2' },
      medium: { label: 'MEDIUM', color: '#F59E0B', bgcolor: '#FEF3C7' },
      warning: { label: 'MEDIUM', color: '#F59E0B', bgcolor: '#FEF3C7' },
      low: { label: 'LOW', color: '#10B981', bgcolor: '#ECFDF5' }, // Green
      normal: { label: 'NORMAL', color: '#3B82F6', bgcolor: '#EFF6FF' }, // Blue
      info: { label: 'NORMAL', color: '#3B82F6', bgcolor: '#EFF6FF' },
    };

    const config = severityConfig[severityLevel.toLowerCase()] || severityConfig.normal;

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.bgcolor,
          color: config.color,
          fontWeight: 700,
          fontSize: 10,
          borderRadius: '4px',
          height: 22,
          minWidth: 60,
          letterSpacing: 0.5,
        }}
      />
    );
  };

  const getStatusChip = (status) => {
    // Check if status is the whole row object or just the string
    let statusValue = 'unresolved';
    if (typeof status === 'object' && status !== null) {
      statusValue = status.status || status.logStatus || 'unresolved';
    } else {
      statusValue = status || 'unresolved';
    }

    statusValue = statusValue.toLowerCase();
    const isAck = statusValue === 'acknowledged' || statusValue === 'resolved';

    const chip = (
      <Chip
        label={statusValue === 'resolved' ? 'RESOLVED' : (isAck ? 'ACKNOWLEDGED' : 'UNRESOLVED')}
        size="small"
        sx={{
          backgroundColor: statusValue === 'resolved' ? '#DCFCE7' : (isAck ? '#EFF6FF' : '#FEE2E2'), // Green vs Light Blue vs Light Red
          color: statusValue === 'resolved' ? '#166534' : (isAck ? '#3B82F6' : '#EF4444'),
          fontWeight: 700,
          fontSize: 10,
          borderRadius: '4px',
          height: 22,
          minWidth: 90,
          letterSpacing: 0.5,
        }}
      />
    );

    if (statusValue === 'acknowledged') {
      return (
        <Tooltip title="Acknowledged = reviewed but not yet resolved" arrow>
          {chip}
        </Tooltip>
      );
    }

    return chip;
  };

  const getUserChip = (username) => {
    return (
      <Chip
        label={username || 'N/A'}
        size="small"
        sx={{
          backgroundColor: '#FEF2F2',
          color: '#EF4444',
          fontWeight: 600,
          fontSize: 11,
          borderRadius: '4px',
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

  const [selectedLogForResolution, setSelectedLogForResolution] = useState(null);

  const handleOpenResolveModal = (log) => {
    setSelectedLogForResolution(log);
  };

  const handleCloseResolveModal = () => {
    setSelectedLogForResolution(null);
  };

  const handleConfirmResolve = (log, notes) => {
    // Update local state to reflect resolution
    const updatedLogs = logs.map(l => {
      if (l.id === log.id) {
        return {
          ...l,
          status: 'resolved',
          resolutionNotes: notes,
          resolvedAt: new Date(),
          resolvedBy: 'Super Admin' // Mock
        };
      }
      return l;
    });

    setLogs(updatedLogs);
    // Also update filtered logs if needed, but the effect will handle it if logs changes
    // setFilteredLogs ... (useEffect handles this)

    console.log('Log resolved:', log.id, 'Notes:', notes);
    handleCloseResolveModal();
    alert('Log marked as resolved (Phase 1 Mock)');
  };

  const handleExport = () => {
    if (!filteredLogs.length) {
      alert('No logs to export');
      return;
    }

    const headers = ['Log ID', 'Event', 'Severity', 'Status', 'User', 'Admin', 'Timestamp', 'Resolution Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => {
        const date = log.createdAt instanceof Date ? log.createdAt : new Date(log.createdAt);
        return [
          log.id,
          `"${log.event.replace(/"/g, '""')}"`, // Escape quotes
          log.severity || log.severityLevel,
          log.status || log.logStatus || 'unresolved',
          log.relatedUsername || 'N/A',
          log.adminName || log.adminId || 'System',
          format(date, 'yyyy-MM-dd HH:mm:ss'),
          `"${(log.resolutionNotes || '').replace(/"/g, '""')}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `system_logs_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, fontSize: 13 }}>
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
        const isAuto = adminName.toLowerCase().includes('auto') || adminName.toLowerCase().includes('backend');
        if (isAuto) {
          return (
            <Chip
              icon={<Settings sx={{ fontSize: 12, color: '#3B82F6 !important' }} />}
              label={adminName.length > 20 ? `${adminName.substring(0, 20)}...` : adminName}
              size="small"
              sx={{ bgcolor: 'transparent', color: '#3B82F6', fontWeight: 500, fontSize: 13, p: 0, '& .MuiChip-label': { paddingLeft: 0.5 } }}
            />
          );
        }
        return (
          <Typography
            variant="body2"
            sx={{
              color: colors.brandBlack,
              fontSize: 13,
            }}
          >
            {adminName}
          </Typography>
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
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
            {format(date, 'MMM d, yyyy HH:mm')}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => getStatusChip(row),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_, row) => {
        return (
          <Button
            variant="outlined"
            size="small"
            startIcon={<RemoveRedEye sx={{ fontSize: 16 }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenResolveModal(row);
            }}
            sx={{
              backgroundColor: '#EFF6FF',
              color: '#3B82F6',
              border: '1px solid #BFDBFE',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 12,
              px: 2,
              py: 0.5,
              '&:hover': {
                backgroundColor: '#DBEAFE',
                border: '1px solid #93C5FD',
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
            p: 3,
            mb: 4,
            borderRadius: '16px',
            backgroundColor: '#FDF2F2', // Light red background matching screenshot
            border: '1px solid #FECACA', // Light red border
            boxShadow: 'none',
          }}
        >
          {/* Alert Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                backgroundColor: colors.brandRed,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
              }}
            >
              <Warning sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: colors.brandRed,
                  fontSize: 16,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                SECURITY ALERTS
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: colors.textSecondary,
                  fontSize: 14,
                }}
              >
                {unresolvedLogs.length} unresolved critical/security logs require Super Admin attention
              </Typography>
            </Box>
          </Box>

          {/* Alert List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {unresolvedLogs.map((log) => {
              const date = log.createdAt instanceof Date ? log.createdAt : new Date(log.createdAt);
              const isHigh = (log.severity || log.severityLevel) === 'high';
              const badgeColors = isHigh
                ? { bg: '#FFEBEB', text: colors.brandRed } // High: Pinkish red
                : { bg: '#FFFBEB', text: '#D97706' }; // Medium: Yellowish orange

              return (
                <Card
                  key={log.id}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {/* Severity Badge */}
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '6px',
                        backgroundColor: badgeColors.bg,
                        color: badgeColors.text,
                        fontWeight: 700,
                        fontSize: 12,
                        textTransform: 'uppercase',
                        minWidth: 60,
                        textAlign: 'center',
                      }}
                    >
                      {(log.severity || log.severityLevel).toUpperCase()}
                    </Box>

                    {/* Content */}
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
                        {log.event}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                        User: <span style={{ color: colors.textPrimary }}>{log.relatedUsername || 'N/A'}</span> • Admin: <span style={{ color: colors.textPrimary }}>{log.adminName || 'System'}</span> • {format(date, 'MMM dd, HH:mm')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Button */}
                  <Button
                    variant="contained"
                    onClick={() => handleOpenResolveModal(log)}
                    sx={{
                      backgroundColor: colors.brandRed,
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '8px',
                      px: 3,
                      '&:hover': {
                        backgroundColor: colors.brandDarkRed,
                      },
                    }}
                  >
                    Resolve
                  </Button>
                </Card>
              );
            })}
          </Box>
        </Card>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: 'Total Logs',
            count: logs.length,
            icon: Description,
            color: '#3B82F6', // Blue
            bgColor: '#EFF6FF', // Light Blue
          },
          {
            title: 'Critical',
            count: criticalLogs.length,
            icon: Error,
            color: '#EF4444', // Red
            bgColor: '#FEF2F2', // Light Red
          },
          {
            title: 'Security',
            count: securityLogs.length,
            icon: Shield,
            color: '#F59E0B', // Amber
            bgColor: '#FFFBEB', // Light Amber
          },
          {
            title: 'Unresolved',
            count: unresolvedLogs.length,
            icon: AccessTime, // Changed to clock icon
            color: '#EF4444', // Red
            bgColor: '#FEF2F2', // Light Red
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={6} md={3} key={index}>
              <Card
                sx={{
                  p: 4,
                  borderRadius: '16px',
                  bgcolor: stat.bgColor,
                  boxShadow: 'none',
                  border: `1px solid ${stat.color}20`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  height: '100%',
                }}
              >
                <Icon sx={{ fontSize: 32, color: stat.color }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
                    {stat.count}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
                    {stat.title}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Filter Buttons */}
      {/* Filter Buttons Stripe */}
      <Card
        sx={{
          mb: 4,
          p: 1,
          borderRadius: '24px',
          backgroundColor: 'white',
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          width: '100%',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          '::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {[
          { value: 'all', label: 'All Logs', icon: List, color: '#DC2626', lightColor: '#FEF2F2' },
          { value: 'critical', label: 'Critical', icon: Error, color: '#EF4444', lightColor: '#FEF2F2' },
          { value: 'security', label: 'Security', icon: Shield, color: '#F59E0B', lightColor: '#FFFBEB' },
          { value: 'system', label: 'System', icon: Settings, color: '#3B82F6', lightColor: '#EFF6FF' },
          { value: 'admin', label: 'Admin Activity', icon: Person, color: '#10B981', lightColor: '#ECFDF5' },
        ].map((filter) => {
          const isSelected = typeFilter === filter.value;
          const Icon = filter.icon;

          return (
            <Button
              key={filter.value}
              onClick={() => setTypeFilter(filter.value)}
              sx={{
                flex: 1,
                minWidth: { xs: 150, md: 'auto' },
                backgroundColor: isSelected ? filter.color : 'transparent',
                color: isSelected ? 'white' : colors.textPrimary,
                borderRadius: '20px',
                py: 1.5,
                px: 2,
                boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                textTransform: 'none',
                fontSize: 15,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: isSelected ? filter.color : 'rgba(0,0,0,0.02)',
                  opacity: isSelected ? 0.95 : 1,
                },
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : filter.lightColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon sx={{ fontSize: 18, color: isSelected ? 'white' : filter.color }} />
              </Box>
              {filter.label}
            </Button>
          );
        })}
      </Card>

      {/* Advanced Filters */}
      <Card
        sx={{
          p: 3,
          mb: 4,
          borderRadius: '16px',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <FilterList sx={{ fontSize: 20, color: colors.brandRed }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, fontSize: 16 }}>
            Advanced Filters
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontSize: 13, color: colors.textSecondary }}>
              Date Range
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={(e) => setDateMenuAnchor(e.currentTarget)}
              endIcon={<ArrowDropDown sx={{ color: colors.textSecondary }} />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 500,
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                color: colors.brandBlack,
                borderColor: '#E5E7EB',
                backgroundColor: '#F9FAFB',
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                  borderColor: '#D1D5DB',
                },
              }}
            >
              {dateRangeFilter === 'all' ? 'All Time' : dateRangeFilter === 'today' ? 'Today' : dateRangeFilter === 'last7Days' ? 'Last 7 Days' : 'Last 30 Days'}
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontSize: 13, color: colors.textSecondary }}>
              Admin User
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={(e) => setAdminMenuAnchor(e.currentTarget)}
              endIcon={<ArrowDropDown sx={{ color: colors.textSecondary }} />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 500,
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                color: colors.brandBlack,
                borderColor: '#E5E7EB',
                backgroundColor: '#F9FAFB',
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                  borderColor: '#D1D5DB',
                },
              }}
            >
              {adminFilter === 'all' ? 'All Admins' : logs.find((l) => l.adminId === adminFilter)?.adminName || adminFilter}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Search and Action Bar Card */}
      <Card
        sx={{
          p: 2,
          mb: 4,
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          backgroundColor: 'white',
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 300 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search logs by event, admin, or user..."
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#F9FAFB',
                borderRadius: '8px',
                border: 'none',
                '& fieldset': { border: 'none' },
                '&:hover fieldset': { border: 'none' },
                '&.Mui-focused fieldset': { border: 'none' },
              }
            }}
          />
        </Box>
        <Button
          variant="contained"
          onClick={(e) => setSortMenuAnchor(e.currentTarget)}
          endIcon={<ArrowDropDown sx={{ color: colors.brandRed }} />}
          startIcon={
            <Box sx={{
              width: 24, height: 24, borderRadius: '50%', backgroundColor: '#FECACA',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ArrowDropDown sx={{ transform: 'rotate(180deg)', color: '#DC2626', fontSize: 16 }} />
            </Box>
          }
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
            py: 1.5,
            backgroundColor: '#FEF2F2',
            color: colors.brandBlack,
            boxShadow: 'none',
            border: '1px solid #FECACA',
            '&:hover': {
              backgroundColor: '#FEE2E2',
              boxShadow: 'none',
            },
          }}
        >
          Date: {getDateSortLabel()}
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          startIcon={<FileDownload sx={{ fontSize: 18 }} />}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            backgroundColor: '#4CAF50',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#43A047',
              boxShadow: 'none',
            },
          }}
        >
          Export
        </Button>
      </Card>

      {/* Audit Trail Card */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          backgroundColor: 'white',
          overflow: 'hidden',
        }}
      >
        {/* Audit Trail Header */}
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                backgroundColor: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)',
              }}
            >
              <Description sx={{ fontSize: 20, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, fontSize: 18, lineHeight: 1.2 }}>
                Audit Trail
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 14 }}>
                {filteredLogs.length} logs • Page {page + 1} of {Math.ceil(filteredLogs.length / rowsPerPage) || 1}
              </Typography>
            </Box>
          </Box>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{
                borderRadius: '8px',
                fontSize: 14,
                backgroundColor: '#F9FAFB',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
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
      </Card>

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

      <ResolveLogModal
        open={Boolean(selectedLogForResolution)}
        onClose={handleCloseResolveModal}
        log={selectedLogForResolution}
        onResolve={handleConfirmResolve}
      />
    </Box >
  );
};

export default SystemLogsPage;
