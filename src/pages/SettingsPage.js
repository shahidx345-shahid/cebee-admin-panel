import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogContent,
  DialogActions,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Settings,
  PowerSettingsNew,
  Warning,
  CheckCircle,
  Save,
  Refresh,
  Public,
  CalendarToday,
  AccessTime,
  PhoneAndroid,
  PhoneIphone,
  Description,
  Block,
  CheckCircleOutline,
  Info,
  SystemUpdate,
  Build,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import { format } from 'date-fns';

const MAINTENANCE_DEFAULTS = {
  defaultTitle: 'Under Maintenance',
  defaultMessage: 'We are currently performing scheduled maintenance. The app will be back online shortly. Thank you for your patience.',
};

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    platformStatus: 'online', // 'online' or 'maintenance'
    appName: 'CeBee Predict',
    maintenanceTitle: MAINTENANCE_DEFAULTS.defaultTitle,
    maintenanceMessage: MAINTENANCE_DEFAULTS.defaultMessage,
    maintenanceStartedAt: null,
    maintenanceStartedBy: null,
    dateFormat: 'ddMmYyyy', // 'ddMmYyyy', 'mmDdYyyy', 'yyyyMmDd'
    timeFormat: 'hour12', // 'hour12' or 'hour24'
    androidAppVersion: '1.0.0',
    iosAppVersion: '1.0.0',
    releaseNotes: `### Version 1.2.3 - Released on Jan 15, 2025

**New Features:**
- Enhanced prediction interface
- Improved leaderboard performance
- New notification system

**Bug Fixes:**
- Fixed SP calculation edge cases`,
    lastVersionUpdate: null,
    displayTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      // Simulating network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Data is already in initial state, no need to set anything
      // This prevents unnecessary re-renders
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = useCallback((field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    setSaveDialogOpen(true);
  }, []);

  const performSave = useCallback(async () => {
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      setHasUnsavedChanges(false);
      setSaveDialogOpen(false);
      alert('Settings saved successfully! (Local Mock)');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  }, []);

  const handleToggleMaintenance = useCallback(() => {
    setMaintenanceDialogOpen(true);
  }, []);

  const performToggleMaintenance = useCallback(async () => {
    setSettings(prev => {
      const isEnablingMaintenance = prev.platformStatus === 'online';
      const newStatus = isEnablingMaintenance ? 'maintenance' : 'online';

      const updatedSettings = {
        ...prev,
        platformStatus: newStatus,
      };

      if (isEnablingMaintenance) {
        updatedSettings.maintenanceStartedAt = new Date();
        updatedSettings.maintenanceStartedBy = 'Admin';
      } else {
        updatedSettings.maintenanceStartedAt = null;
        updatedSettings.maintenanceStartedBy = null;
      }

      // Mock System Log
      console.log(`[SYSTEM LOG] Maintenance mode ${isEnablingMaintenance ? 'ENABLED' : 'DISABLED'} by Super Admin at ${new Date().toISOString()}`);

      setTimeout(() => {
        alert(isEnablingMaintenance ? 'Maintenance mode enabled' : 'Platform is now online');
      }, 0);

      return updatedSettings;
    });
    
    setHasUnsavedChanges(true);
    setMaintenanceDialogOpen(false);
  }, []);

  const handleReset = useCallback(() => {
    setResetDialogOpen(true);
  }, []);

  const performReset = useCallback(() => {
    // Reset Button Scope: Only affects date format, time format, and timezone handling
    // Platform status, app name, and maintenance message are NOT reset
    setSettings(prev => ({
      ...prev,
      dateFormat: 'ddMmYyyy',
      timeFormat: 'hour12',
      displayTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }));
    setHasUnsavedChanges(true);
    setResetDialogOpen(false);
    console.log(`[SYSTEM LOG] Date/Time settings reset to defaults by Super Admin at ${new Date().toISOString()}`);
    alert('Date/Time settings reset to defaults (logged)');
  }, []);

  const handleResetMaintenanceMessage = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      maintenanceTitle: MAINTENANCE_DEFAULTS.defaultTitle,
      maintenanceMessage: MAINTENANCE_DEFAULTS.defaultMessage,
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleCheckForUpdates = useCallback(async () => {
    setIsCheckingUpdates(true);
    // Simulate checking for updates
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsCheckingUpdates(false);
    alert('Update check completed');
  }, []);

  const isMaintenanceMode = useMemo(() => {
    return settings.platformStatus === 'maintenance';
  }, [settings.platformStatus]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: colors.brandRed }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Super Admin Info Banner */}
      <Box
        sx={{
          width: '100%',
          padding: 1.5,
          background: `${colors.info}1A`,
          color: colors.info,
          mb: 2,
          borderRadius: '12px',
          border: `1px solid ${colors.info}33`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <Info sx={{ fontSize: 18 }} />
          <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
            Settings page is accessible to Super Admins only.
          </Typography>
        </Box>
      </Box>

      {/* Maintenance Mode Active Banner */}
      {isMaintenanceMode && (
        <Box
          sx={{
            width: '100%',
            padding: 2,
            background: `linear-gradient(135deg, ${colors.warning} 0%, ${colors.warning}E6 100%)`,
            color: colors.brandWhite,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ fontSize: 18 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 13, letterSpacing: 0.5 }}>
              MAINTENANCE MODE ACTIVE
            </Typography>
            <Typography sx={{ ml: 1, fontSize: 12 }}>
              • All user access blocked
            </Typography>
          </Box>
        </Box>
      )}

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 3,
          padding: { xs: 1.5, md: 2 },
          backgroundColor: colors.brandWhite,
          borderBottom: `1px solid ${colors.divider}33`,
          gap: { xs: 2, md: 0 },
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, md: 1.5 },
          maxWidth: '100%',
          overflow: 'hidden',
          flex: 1,
        }}>
          <Box
            sx={{
              padding: { xs: 1, md: 1.25 },
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: { xs: '10px', md: '12px' },
              flexShrink: 0,
            }}
          >
            <Settings sx={{ fontSize: { xs: 20, md: 22 }, color: colors.brandWhite }} />
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flexWrap: 'wrap',
            }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: colors.brandBlack,
                  fontSize: { xs: 20, sm: 24, md: 28 },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                Settings
              </Typography>
              {isSuperAdmin && (
                <Chip
                  label="Super Admin"
                  size="small"
                  sx={{
                    backgroundColor: `${colors.brandRed}1A`,
                    color: colors.brandRed,
                    fontWeight: 700,
                    fontSize: { xs: 9, md: 10 },
                    height: { xs: 18, md: 20 },
                    flexShrink: 0,
                  }}
                />
              )}
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: colors.textSecondary, 
                fontSize: { xs: 12, md: 14 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: { xs: 'normal', md: 'nowrap' },
                lineHeight: 1.4,
              }}
            >
              Configure platform status, app settings, and preferences
            </Typography>
          </Box>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, md: 1 },
          width: { xs: '100%', md: 'auto' },
          flexWrap: { xs: 'wrap', md: 'nowrap' },
        }}>
          {isSuperAdmin && (
            <Button
              variant="outlined"
              startIcon={<Refresh sx={{ fontSize: { xs: 18, md: 20 } }} />}
              onClick={handleReset}
              sx={{
                flex: { xs: '1 1 auto', md: '0 0 auto' },
                minWidth: { xs: 'auto', md: 'auto' },
                borderColor: '#FE9C0A',
                color: '#FE9C0A',
                borderWidth: 1.5,
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: { xs: '10px', md: '12px' },
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 1.25 },
                fontSize: { xs: 13, md: 14 },
                whiteSpace: 'nowrap',
                '&:hover': {
                  borderColor: '#D97706',
                  backgroundColor: '#FFFBEB'
                }
              }}
            >
              Reset
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<CheckCircle sx={{ fontSize: { xs: 18, md: 20 } }} />}
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            sx={{
              flex: { xs: '1 1 auto', md: '0 0 auto' },
              minWidth: { xs: 'auto', md: 'auto' },
              backgroundColor: '#C9E7CA !important',
              color: '#065F46',
              borderRadius: { xs: '10px', md: '12px' },
              textTransform: 'none',
              fontWeight: 700,
              px: { xs: 2, md: 3 },
              py: { xs: 1, md: 1.25 },
              fontSize: { xs: 13, md: 14 },
              boxShadow: 'none',
              whiteSpace: 'nowrap',
              '&:disabled': {
                backgroundColor: '#E5E7EB !important',
                color: '#9CA3AF !important'
              },
              '&:hover': {
                backgroundColor: '#B4E0B6 !important',
                boxShadow: 'none'
              }
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: '16px',
            backgroundColor: '#FFF7ED', // Light orange background
            border: '1.5px solid #FFEDD5', // Light orange border
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: '#F59E0B' // Orange text
          }}
        >
          <Warning sx={{ fontSize: 20 }} />
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
            You have unsaved changes. Don't forget to save!
          </Typography>
        </Box>
      )}

      {/* Platform Status Card */}
      <Card
        sx={{
          padding: { xs: 2, md: 3 },
          borderRadius: { xs: '16px', md: '20px' },
          border: `1.5px solid ${colors.divider}33`,
          mb: 2.5,
          backgroundColor: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, md: 1.5 }, 
          mb: { xs: 3, md: 4 },
          flexWrap: 'wrap',
        }}>
          <Box
            sx={{
              width: { xs: 36, md: 40 },
              height: { xs: 36, md: 40 },
              borderRadius: { xs: '10px', md: '12px' },
              background: '#22C55E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(34, 197, 94, 0.3)',
              flexShrink: 0,
            }}
          >
            <Public sx={{ fontSize: { xs: 20, md: 24 }, color: 'white' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: 16, md: 18 }, 
                color: colors.brandBlack,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Platform Status
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: colors.textSecondary, 
                fontSize: { xs: 12, md: 14 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: { xs: 'normal', md: 'nowrap' },
                lineHeight: 1.4,
              }}
            >
              Control platform availability and maintenance mode
            </Typography>
          </Box>
        </Box>

        {/* Current Status Strip */}
        <Box
          sx={{
            padding: { xs: 1.5, md: 2 },
            borderRadius: { xs: '12px', md: '16px' },
            backgroundColor: isMaintenanceMode ? '#FFFBEB' : '#ECFDF5',
            border: `1px solid ${isMaintenanceMode ? '#FCD34D' : '#6EE7B7'}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 2, sm: 0 },
            mb: 4,
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, md: 1.5 }, 
              mb: 0.5,
              flexWrap: 'wrap',
            }}>
              <Box sx={{
                width: { xs: 28, md: 32 },
                height: { xs: 28, md: 32 },
                borderRadius: { xs: '6px', md: '8px' },
                backgroundColor: isMaintenanceMode ? '#F59E0B' : '#22C55E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {isMaintenanceMode ? <Block sx={{ color: 'white', fontSize: { xs: 16, md: 18 } }} /> : <CheckCircle sx={{ color: 'white', fontSize: { xs: 16, md: 18 } }} />}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: colors.textSecondary, 
                    fontSize: { xs: 11, md: 12 }, 
                    fontWeight: 600, 
                    display: 'block',
                  }}
                >
                  Current Status
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: 16, md: 18 }, 
                    color: isMaintenanceMode ? '#B45309' : '#15803D',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isMaintenanceMode ? 'MAINTENANCE MODE' : 'ONLINE'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {isSuperAdmin && (
            <Button
              variant="contained"
              onClick={handleToggleMaintenance}
              startIcon={<Build sx={{ fontSize: { xs: 18, md: 20 } }} />}
              sx={{
                flexShrink: 0,
                width: { xs: '100%', sm: 'auto' },
                backgroundColor: '#FE9C0A !important',
                color: 'white',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: { xs: '10px', md: '12px' },
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 1 },
                fontSize: { xs: 13, md: 14 },
                boxShadow: '0 4px 6px -1px rgba(254, 156, 10, 0.3)',
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: '#F59E0B !important'
                }
              }}
            >
              {isMaintenanceMode ? 'Go Online' : 'Enable Maintenance'}
            </Button>
          )}

        </Box>

        {/* Maintenance Message Inputs */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Description sx={{ fontSize: 20, color: '#EF4444' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15, color: colors.brandBlack }}>
              Maintenance Message
            </Typography>
            <Chip label="Super Admin Only" size="small" sx={{ bgcolor: '#FEE2E2', color: '#EF4444', fontWeight: 700, fontSize: 10, height: 20 }} />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: colors.brandBlack }}>
              Title
            </Typography>
            <TextField
              fullWidth
              value={settings.maintenanceTitle}
              onChange={(e) => handleChange('maintenanceTitle', e.target.value)}
              placeholder="Under Maintenance"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#FAFAFA' // Very light gray bg
                }
              }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: colors.brandBlack }}>
              Message Body
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={settings.maintenanceMessage}
              onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
              placeholder="We are currently performing scheduled maintenance..."
              helperText="Message is only shown when maintenance mode is active."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#FAFAFA'
                }
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* General Settings Section */}
      <Card
        sx={{
          padding: { xs: 2, md: 3 },
          borderRadius: { xs: '16px', md: '20px' },
          border: `1.5px solid ${colors.divider}33`,
          mb: 2.5,
          backgroundColor: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, md: 1.5 }, 
          mb: { xs: 3, md: 4 },
          flexWrap: 'wrap',
        }}>
          <Box
            sx={{
              width: { xs: 36, md: 40 },
              height: { xs: 36, md: 40 },
              borderRadius: { xs: '10px', md: '12px' },
              background: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)',
              flexShrink: 0,
            }}
          >
            <Settings sx={{ fontSize: { xs: 20, md: 24 }, color: 'white' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: 16, md: 18 }, 
                color: colors.brandBlack,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              General Settings
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: colors.textSecondary, 
                fontSize: { xs: 12, md: 14 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: { xs: 'normal', md: 'nowrap' },
                lineHeight: 1.4,
              }}
            >
              Configure basic app settings and preferences
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px', backgroundColor: '#FEE2E2',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <PhoneAndroid sx={{ fontSize: 18, color: '#DC2626' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15, color: colors.brandBlack }}>
                App Name
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                Display name for the admin panel
              </Typography>
            </Box>
          </Box>
          <TextField
            fullWidth
            value={settings.appName}
            onChange={(e) => handleChange('appName', e.target.value)}
            disabled={!isSuperAdmin}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                borderColor: '#FECACA', // Light red border
                '& fieldset': { borderColor: '#FECACA' },
                '&:hover fieldset': { borderColor: '#FCA5A5' },
                '&.Mui-focused fieldset': { borderColor: '#DC2626' },
                backgroundColor: 'white',
              },
              '& .MuiInputBase-input': {
                padding: '14px 16px',
                fontSize: 15,
                fontWeight: 500
              }
            }}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px', backgroundColor: '#ECFDF5',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Public sx={{ fontSize: 18, color: '#059669' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15, color: colors.brandBlack }}>
                Platform Status
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                Current status of the platform
              </Typography>
            </Box>
          </Box>

          <FormControl fullWidth>
            <Select
              value={settings.platformStatus}
              onChange={(e) => {
                // Direct state update for UI, logic handled by perform/save usually but complying with requested UI structure
                handleChange('platformStatus', e.target.value);
              }}
              disabled={!isSuperAdmin}
              sx={{
                borderRadius: '12px',
                backgroundColor: settings.platformStatus === 'online' ? '#ECFDF5' : '#FFFBEB',
                color: settings.platformStatus === 'online' ? '#065F46' : '#92400E',
                fontWeight: 600,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiSelect-icon': { color: 'inherit' }
              }}
            >
              <MenuItem value="online">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                  Online
                </Box>
              </MenuItem>
              <MenuItem value="maintenance">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                  Maintenance
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px', backgroundColor: '#FFEDD5',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CalendarToday sx={{ fontSize: 18, color: '#F97316' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15, color: colors.brandBlack }}>
                Date Format
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                How dates are displayed throughout the app
              </Typography>
            </Box>
          </Box>
          <FormControl fullWidth>
            <Select
              value={settings.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              sx={{
                borderRadius: '12px',
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#FED7AA' }, // Light orange border
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FDBA74' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F97316' },
              }}
            >
              <MenuItem value="ddMmYyyy">DD/MM/YYYY</MenuItem>
              <MenuItem value="mmDdYyyy">MM/DD/YYYY</MenuItem>
              <MenuItem value="yyyyMmDd">YYYY-MM-DD</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px', backgroundColor: '#DBEAFE',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AccessTime sx={{ fontSize: 18, color: '#3B82F6' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15, color: colors.brandBlack }}>
                Time Format
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                How time is displayed throughout the app
              </Typography>
            </Box>
          </Box>
          <FormControl fullWidth>
            <Select
              value={settings.timeFormat}
              onChange={(e) => handleChange('timeFormat', e.target.value)}
              sx={{
                borderRadius: '12px',
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#BFDBFE' }, // Light blue border
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#93C5FD' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
              }}
            >
              <MenuItem value="hour12">12-hour (AM/PM)</MenuItem>
              <MenuItem value="hour24">24-hour</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Timezone Handling */}
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px', backgroundColor: '#F3E8FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Public sx={{ fontSize: 18, color: '#9333EA' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15, color: colors.brandBlack }}>
                Timezone Handling
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                Display time uses the user’s device timezone while system storage uses UTC.
              </Typography>
            </Box>
          </Box>
          <TextField
            fullWidth
            value={settings.displayTimezone || 'UTC'}
            disabled
            helperText="System Default (UTC) - Auto-detected from user device on client-side"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#F3F4F6'
              }
            }}
          />
        </Box>
      </Card>

      {/* App Updates Section */}
      <Card
        sx={{
          padding: { xs: 2, md: 3 },
          borderRadius: { xs: '16px', md: '20px' },
          border: `1.5px solid ${colors.divider}33`,
          backgroundColor: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, md: 1.5 }, 
          mb: { xs: 3, md: 4 },
          flexWrap: 'wrap',
        }}>
          <Box
            sx={{
              width: { xs: 36, md: 40 },
              height: { xs: 36, md: 40 },
              borderRadius: { xs: '10px', md: '12px' },
              background: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
              flexShrink: 0,
            }}
          >
            <SystemUpdate sx={{ fontSize: { xs: 20, md: 24 }, color: 'white' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: 16, md: 18 }, 
                color: colors.brandBlack,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              App Updates
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: colors.textSecondary, 
                fontSize: { xs: 12, md: 14 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: { xs: 'normal', md: 'nowrap' },
                lineHeight: 1.4,
              }}
            >
              Manage application updates and versioning
            </Typography>
          </Box>
        </Box>

        {/* iOS Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px', backgroundColor: '#DBEAFE',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <PhoneIphone sx={{ fontSize: 18, color: '#3B82F6' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15, color: colors.brandBlack }}>
                iOS Version
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                Current version for iOS app
              </Typography>
            </Box>
          </Box>
          <TextField
            fullWidth
            value={settings.iosAppVersion}
            disabled
            helperText="Syncs with deployments. Not editable in Admin Panel."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                borderColor: '#BFDBFE',
                backgroundColor: '#F3F4F6', // Grayed out
              },
            }}
          />
        </Box>

        {/* Android Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px', backgroundColor: '#DCFCE7',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <PhoneAndroid sx={{ fontSize: 18, color: '#22C55E' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15, color: colors.brandBlack }}>
                Android Version
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                Current version for Android app
              </Typography>
            </Box>
          </Box>
          <TextField
            fullWidth
            value={settings.androidAppVersion}
            disabled
            helperText="Syncs with deployments. Not editable in Admin Panel."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                borderColor: '#86EFAC',
                backgroundColor: '#F3F4F6', // Grayed out
              },
            }}
          />
        </Box>

        {/* Release Notes */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Description sx={{ fontSize: 20, color: '#EF4444' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15, color: colors.brandBlack }}>
                Release Notes
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              Updated: {format(new Date('2026-01-18'), 'MMM dd, yyyy')}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mb: 1, color: colors.info, fontWeight: 500 }}>
            Display only. Managed in Content & App Updates.
          </Typography>
          <Box
            sx={{
              padding: 3,
              backgroundColor: '#F9FAFB', // Neutral Gray Background
              borderRadius: '12px',
              border: '1px solid #E5E7EB', // Neutral Gray Border
              maxHeight: '300px',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#FCA5A5',
                borderRadius: '3px',
              },
            }}
          >
            <Typography variant="body2" component="div" sx={{ color: colors.textSecondary, fontSize: 14, whiteSpace: 'pre-line' }}>
              {settings.releaseNotes ? settings.releaseNotes :
                `### Version 1.2.3 - Released on Jan 15, 2025

**New Features:**
- Enhanced prediction interface
- Improved leaderboard performance
- New notification system

**Bug Fixes:**
- Fixed SP calculation edge cases`}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          fullWidth
          startIcon={isCheckingUpdates ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Refresh />}
          onClick={handleCheckForUpdates}
          disabled={isCheckingUpdates}
          sx={{
            background: '#3B82F6',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '12px',
            py: 1.5,
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
            '&:hover': {
              background: '#2563EB',
            }
          }}
        >
          {isCheckingUpdates ? 'Checking for Updates...' : 'Check for Updates'}
        </Button>
      </Card>

      {/* Save Confirmation Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.success}E6 100%)`,
            padding: 3,
            color: colors.brandWhite,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                padding: 1.5,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
              }}
            >
              <CheckCircle sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Confirm Save Changes
            </Typography>
          </Box>
        </Box>
        <DialogContent sx={{ padding: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
            Are you sure you want to save all changes?
          </Typography>
          <Alert
            severity="info"
            icon={<Description />}
            sx={{
              backgroundColor: `${colors.info}1A`,
              border: `1px solid ${colors.info}33`,
            }}
          >
            <Typography variant="caption">
              All changes will be logged with admin ID, timestamp, and fields changed.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ 
          padding: { xs: 2, md: 2.5 }, 
          gap: { xs: 1, md: 1 }, 
          backgroundColor: `${colors.backgroundLight}4D`,
          flexDirection: { xs: 'column', sm: 'row' },
        }}>
          <Button
            onClick={() => setSaveDialogOpen(false)}
            variant="outlined"
            sx={{
              width: { xs: '100%', sm: 'auto' },
              borderColor: colors.textSecondary,
              color: colors.textSecondary,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: { xs: '10px', md: '12px' },
              order: { xs: 2, sm: 1 },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={performSave}
            variant="contained"
            sx={{
              width: { xs: '100%', sm: 'auto' },
              background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.success}DD 100%)`,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: { xs: '10px', md: '12px' },
              order: { xs: 1, sm: 2 },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.warning} 0%, ${colors.warning}E6 100%)`,
            padding: 3,
            color: colors.brandWhite,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                padding: 1.5,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
              }}
            >
              <Warning sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Reset to Defaults
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 13 }}>
                Super Admin Action
              </Typography>
            </Box>
          </Box>
        </Box>
        <DialogContent sx={{ padding: 3 }}>
          <Alert
            severity="error"
            icon={<Warning />}
            sx={{
              mb: 2.5,
              backgroundColor: `${colors.error}1A`,
              border: `1px solid ${colors.error}4D`,
            }}
          >
            <Typography variant="body2">
              This will restore all settings to system-defined default values. This action cannot be undone and will be logged as a critical system action.
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Settings that will be reset:
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography sx={{ fontSize: 14, color: colors.textSecondary }}>→</Typography>
              <Typography variant="body2" sx={{ fontSize: 13 }}>
                Platform Status: <strong>Online</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography sx={{ fontSize: 14, color: colors.textSecondary }}>→</Typography>
              <Typography variant="body2" sx={{ fontSize: 13 }}>
                Time Format: <strong>12-hour</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography sx={{ fontSize: 14, color: colors.textSecondary }}>→</Typography>
              <Typography variant="body2" sx={{ fontSize: 13 }}>
                Date Format: <strong>DD/MM/YYYY</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography sx={{ fontSize: 14, color: colors.textSecondary }}>→</Typography>
              <Typography variant="body2" sx={{ fontSize: 13 }}>
                Maintenance Message: <strong>Default message</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 14, color: colors.textSecondary }}>→</Typography>
              <Typography variant="body2" sx={{ fontSize: 13 }}>
                App Versions: <strong>1.0.0</strong>
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          padding: { xs: 2, md: 2.5 }, 
          gap: { xs: 1, md: 1 }, 
          backgroundColor: `${colors.backgroundLight}4D`,
          flexDirection: { xs: 'column', sm: 'row' },
        }}>
          <Button
            onClick={() => setResetDialogOpen(false)}
            variant="outlined"
            sx={{
              width: { xs: '100%', sm: 'auto' },
              borderColor: colors.textSecondary,
              color: colors.textSecondary,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: { xs: '10px', md: '12px' },
              order: { xs: 2, sm: 1 },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={performReset}
            variant="contained"
            sx={{
              width: { xs: '100%', sm: 'auto' },
              background: `linear-gradient(135deg, ${colors.warning} 0%, ${colors.warning}DD 100%)`,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: { xs: '10px', md: '12px' },
              order: { xs: 1, sm: 2 },
            }}
          >
            Reset to Defaults
          </Button>
        </DialogActions>
      </Dialog>

      {/* Maintenance Mode Toggle Dialog */}
      <Dialog
        open={maintenanceDialogOpen}
        onClose={() => setMaintenanceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${isMaintenanceMode ? colors.success : colors.warning
              } 0%, ${isMaintenanceMode ? colors.success : colors.warning}E6 100%)`,
            padding: 3,
            color: colors.brandWhite,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                padding: 1.5,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
              }}
            >
              <Warning sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {isMaintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 13 }}>
                Super Admin Action Required
              </Typography>
            </Box>
          </Box>
        </Box>
        <DialogContent sx={{ padding: 3 }}>
          <Alert
            severity="error"
            icon={<Warning />}
            sx={{
              mb: 2.5,
              backgroundColor: `${colors.error}1A`,
              border: `1px solid ${colors.error}4D`,
            }}
          >
            <Typography variant="body2">
              {isMaintenanceMode
                ? 'This action will immediately restore access for ALL users. Make sure all maintenance work is complete before proceeding.'
                : 'This action will immediately block ALL users from logging in or registering. Users will see the maintenance screen on app launch with no navigation allowed.'}
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Action Summary:
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Info sx={{ fontSize: 16, color: colors.textSecondary }} />
              <Typography variant="body2" sx={{ fontSize: 14 }}>
                {isMaintenanceMode ? 'Restore user logins' : 'Block all user logins'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Info sx={{ fontSize: 16, color: colors.textSecondary }} />
              <Typography variant="body2" sx={{ fontSize: 14 }}>
                {isMaintenanceMode ? 'Allow registrations' : 'Block all registrations'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Info sx={{ fontSize: 16, color: colors.textSecondary }} />
              <Typography variant="body2" sx={{ fontSize: 14 }}>
                This action will be logged
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info sx={{ fontSize: 16, color: colors.textSecondary }} />
              <Typography variant="body2" sx={{ fontSize: 14 }}>
                Affects all users immediately
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          padding: { xs: 2, md: 2.5 }, 
          gap: { xs: 1, md: 1 }, 
          backgroundColor: `${colors.backgroundLight}4D`,
          flexDirection: { xs: 'column', sm: 'row' },
        }}>
          <Button
            onClick={() => setMaintenanceDialogOpen(false)}
            variant="outlined"
            sx={{
              width: { xs: '100%', sm: 'auto' },
              borderColor: colors.textSecondary,
              color: colors.textSecondary,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: { xs: '10px', md: '12px' },
              order: { xs: 2, sm: 1 },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={performToggleMaintenance}
            variant="contained"
            sx={{
              width: { xs: '100%', sm: 'auto' },
              background: `linear-gradient(135deg, ${isMaintenanceMode ? colors.success : colors.warning
                } 0%, ${isMaintenanceMode ? colors.success : colors.warning}DD 100%)`,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: { xs: '10px', md: '12px' },
              order: { xs: 1, sm: 2 },
            }}
          >
            {isMaintenanceMode ? 'Go Online' : 'Enable Maintenance'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
