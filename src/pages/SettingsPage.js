import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
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
    releaseNotes: 'Initial release',
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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsRef = doc(db, 'settings', 'app');
      const settingsDoc = await getDoc(settingsRef);
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSettings({
          ...settings,
          ...data,
          maintenanceStartedAt: data.maintenanceStartedAt?.toDate?.() || null,
          lastVersionUpdate: data.lastVersionUpdate?.toDate?.() || null,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    setSaveDialogOpen(true);
  };

  const performSave = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'app');
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp(),
        lastModified: serverTimestamp(),
        lastModifiedBy: 'Admin', // TODO: Get from auth context
      });
      setHasUnsavedChanges(false);
      setSaveDialogOpen(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  const handleToggleMaintenance = () => {
    setMaintenanceDialogOpen(true);
  };

  const performToggleMaintenance = async () => {
    const isEnablingMaintenance = settings.platformStatus === 'online';
    const newStatus = isEnablingMaintenance ? 'maintenance' : 'online';
    
    const updatedSettings = {
      ...settings,
      platformStatus: newStatus,
    };

    if (isEnablingMaintenance) {
      updatedSettings.maintenanceStartedAt = new Date();
      updatedSettings.maintenanceStartedBy = 'Admin'; // TODO: Get from auth context
    } else {
      updatedSettings.maintenanceStartedAt = null;
      updatedSettings.maintenanceStartedBy = null;
    }

    setSettings(updatedSettings);
    setHasUnsavedChanges(true);
    setMaintenanceDialogOpen(false);
    
    alert(isEnablingMaintenance ? 'Maintenance mode enabled' : 'Platform is now online');
  };

  const handleReset = () => {
    setResetDialogOpen(true);
  };

  const performReset = () => {
    setSettings({
      platformStatus: 'online',
      appName: 'CeBee Predict',
      maintenanceTitle: MAINTENANCE_DEFAULTS.defaultTitle,
      maintenanceMessage: MAINTENANCE_DEFAULTS.defaultMessage,
      maintenanceStartedAt: null,
      maintenanceStartedBy: null,
      dateFormat: 'ddMmYyyy',
      timeFormat: 'hour12',
      androidAppVersion: '1.0.0',
      iosAppVersion: '1.0.0',
      releaseNotes: 'Initial release',
      lastVersionUpdate: null,
      displayTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    setHasUnsavedChanges(true);
    setResetDialogOpen(false);
    alert('Settings reset to defaults (logged)');
  };

  const handleResetMaintenanceMessage = () => {
    setSettings({
      ...settings,
      maintenanceTitle: MAINTENANCE_DEFAULTS.defaultTitle,
      maintenanceMessage: MAINTENANCE_DEFAULTS.defaultMessage,
    });
    setHasUnsavedChanges(true);
  };

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdates(true);
    // Simulate checking for updates
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsCheckingUpdates(false);
    alert('Update check completed');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: colors.brandRed }} />
      </Box>
    );
  }

  const isMaintenanceMode = settings.platformStatus === 'maintenance';

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
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
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          padding: 2,
          backgroundColor: colors.brandWhite,
          borderBottom: `1px solid ${colors.divider}33`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              padding: 1.25,
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '12px',
            }}
          >
            <Settings sx={{ fontSize: 22, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: colors.brandBlack,
                  fontSize: { xs: 24, md: 28 },
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
                    fontSize: 10,
                    height: 20,
                  }}
                />
              )}
            </Box>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 14 }}>
              Configure platform status, app settings, and preferences
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isSuperAdmin && (
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleReset}
              sx={{
                borderColor: colors.warning,
                color: colors.warning,
                borderWidth: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '12px',
              }}
            >
              Reset
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            sx={{
              background: `linear-gradient(135deg, #0D9488 0%, #0D9488DD 100%)`,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              '&:disabled': {
                backgroundColor: `${colors.success}4D`,
              },
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <Alert
          severity="warning"
          sx={{ mb: 3, borderRadius: '14px', border: `1.5px solid ${colors.warning}4D` }}
          icon={<Warning />}
        >
          You have unsaved changes. Don't forget to save!
        </Alert>
      )}

      {/* Platform Status Section */}
      <Card
        sx={{
          padding: 3,
          borderRadius: '20px',
          border: `1.5px solid ${colors.divider}33`,
          mb: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              padding: 1.25,
              backgroundColor: isMaintenanceMode ? colors.warning : colors.success,
              borderRadius: '12px',
            }}
          >
            <Public sx={{ fontSize: 22, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Platform Status
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Control platform availability and maintenance mode
            </Typography>
          </Box>
        </Box>

        {/* Current Status Display */}
        <Box
          sx={{
            padding: 2.5,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${
              isMaintenanceMode ? colors.warning : colors.success
            }26 0%, ${isMaintenanceMode ? colors.warning : colors.success}0D 100%)`,
            border: `2px solid ${isMaintenanceMode ? colors.warning : colors.success}4D`,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  padding: 1.5,
                  backgroundColor: isMaintenanceMode ? colors.warning : colors.success,
                  borderRadius: '12px',
                }}
              >
                {isMaintenanceMode ? (
                  <Block sx={{ fontSize: 24, color: colors.brandWhite }} />
                ) : (
                  <CheckCircleOutline sx={{ fontSize: 24, color: colors.brandWhite }} />
                )}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                  Current Status
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: isMaintenanceMode ? colors.warning : colors.success,
                    fontSize: 20,
                  }}
                >
                  {isMaintenanceMode ? 'MAINTENANCE MODE' : 'ONLINE'}
                </Typography>
                {isMaintenanceMode && settings.maintenanceStartedAt && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: colors.warning, fontSize: 12 }}>
                      Started: {format(new Date(settings.maintenanceStartedAt), 'MMM dd, yyyy HH:mm')}
                      {settings.maintenanceStartedBy && ` by ${settings.maintenanceStartedBy}`}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            {isSuperAdmin && (
              <Button
                variant="contained"
                startIcon={isMaintenanceMode ? <CheckCircleOutline /> : <Block />}
                onClick={handleToggleMaintenance}
                sx={{
                  background: `linear-gradient(135deg, ${
                    isMaintenanceMode ? colors.success : colors.warning
                  } 0%, ${isMaintenanceMode ? colors.success : colors.warning}E6 100%)`,
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '12px',
                  px: 2.5,
                }}
              >
                {isMaintenanceMode ? 'Go Online' : 'Enable Maintenance'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Maintenance Active Banner */}
        {isMaintenanceMode && (
          <Box
            sx={{
              padding: 2,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.error}1A 0%, ${colors.warning}0D 100%)`,
              border: `2px solid ${colors.error}4D`,
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box
                sx={{
                  padding: 1,
                  backgroundColor: colors.error,
                  borderRadius: '8px',
                }}
              >
                <Warning sx={{ fontSize: 18, color: colors.brandWhite }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, color: colors.error, fontSize: 14, mb: 0.5 }}>
                  MAINTENANCE MODE ACTIVE
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                  All user logins and registrations are currently blocked.
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Maintenance Message Editor (Super Admin only) */}
        {isSuperAdmin && (
          <Box
            sx={{
              padding: 2.5,
              borderRadius: '16px',
              backgroundColor: `${colors.backgroundLight}4D`,
              border: `1px solid ${colors.divider}33`,
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description sx={{ fontSize: 20, color: colors.brandRed }} />
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16 }}>
                  Maintenance Message
                </Typography>
              </Box>
              <Chip
                label="Super Admin Only"
                size="small"
                sx={{
                  backgroundColor: `${colors.brandRed}1A`,
                  color: colors.brandRed,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontSize: 13 }}>
                Title
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter maintenance title..."
                value={settings.maintenanceTitle}
                onChange={(e) => handleChange('maintenanceTitle', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: colors.brandWhite,
                  },
                }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontSize: 13 }}>
                Message Body
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter maintenance message..."
                value={settings.maintenanceMessage}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: colors.brandWhite,
                  },
                }}
              />
            </Box>
            <Button
              variant="text"
              startIcon={<Refresh />}
              onClick={handleResetMaintenanceMessage}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: colors.textSecondary,
                fontSize: 13,
              }}
            >
              Reset to Default
            </Button>
          </Box>
        )}

        {/* Timezone Info */}
        <Box
          sx={{
            padding: 2,
            borderRadius: '12px',
            backgroundColor: `${colors.info}14`,
            border: `1px solid ${colors.info}33`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AccessTime sx={{ fontSize: 20, color: colors.info }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>
                Timezone Handling
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                Display: Device timezone ({settings.displayTimezone}) | Storage: UTC
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* General Settings Section */}
      <Card
        sx={{
          padding: 3,
          borderRadius: '20px',
          border: `1.5px solid ${colors.divider}33`,
          mb: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              padding: 1.25,
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '12px',
            }}
          >
            <Settings sx={{ fontSize: 22, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              General Settings
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Configure basic app settings and preferences
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="App Name"
              value={settings.appName}
              onChange={(e) => handleChange('appName', e.target.value)}
              disabled={!isSuperAdmin}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Date Format</InputLabel>
              <Select
                value={settings.dateFormat}
                label="Date Format"
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="ddMmYyyy">DD/MM/YYYY</MenuItem>
                <MenuItem value="mmDdYyyy">MM/DD/YYYY</MenuItem>
                <MenuItem value="yyyyMmDd">YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Time Format</InputLabel>
              <Select
                value={settings.timeFormat}
                label="Time Format"
                onChange={(e) => handleChange('timeFormat', e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="hour12">12-hour (AM/PM)</MenuItem>
                <MenuItem value="hour24">24-hour</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* App Updates Section */}
      <Card
        sx={{
          padding: 3,
          borderRadius: '20px',
          border: `1.5px solid ${colors.divider}33`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              padding: 1.25,
              background: `linear-gradient(135deg, ${colors.info} 0%, ${colors.info}DD 100%)`,
              borderRadius: '12px',
            }}
          >
            <PowerSettingsNew sx={{ fontSize: 22, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              App Updates
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Manage application updates and versioning
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="iOS Version"
              value={settings.iosAppVersion}
              onChange={(e) => handleChange('iosAppVersion', e.target.value)}
              placeholder="Enter iOS version (e.g., 1.2.3)"
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: colors.info }}>
                    <PhoneIphone sx={{ fontSize: 18 }} />
                  </Box>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Android Version"
              value={settings.androidAppVersion}
              onChange={(e) => handleChange('androidAppVersion', e.target.value)}
              placeholder="Enter Android version (e.g., 1.2.3)"
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: colors.success }}>
                    <PhoneAndroid sx={{ fontSize: 18 }} />
                  </Box>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                padding: 2,
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${colors.backgroundLight}4D 0%, ${colors.backgroundLight}1A 100%)`,
                border: `1.5px solid ${colors.divider}26`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description sx={{ fontSize: 18, color: colors.brandRed }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>
                    Release Notes
                  </Typography>
                </Box>
                {settings.lastVersionUpdate && (
                  <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 12 }}>
                    Updated: {format(new Date(settings.lastVersionUpdate), 'MMM dd, yyyy')}
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  maxHeight: 200,
                  overflow: 'auto',
                  padding: 1.5,
                  backgroundColor: colors.brandWhite,
                  borderRadius: '8px',
                }}
              >
                <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 14, lineHeight: 1.6 }}>
                  {settings.releaseNotes || 'No release notes available'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              startIcon={isCheckingUpdates ? <CircularProgress size={16} sx={{ color: colors.brandWhite }} /> : <PowerSettingsNew />}
              onClick={handleCheckForUpdates}
              disabled={isCheckingUpdates}
              sx={{
                background: `linear-gradient(135deg, ${colors.info} 0%, ${colors.info}DD 100%)`,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '12px',
                py: 1.5,
              }}
            >
              {isCheckingUpdates ? 'Checking for Updates...' : 'Check for Updates'}
            </Button>
          </Grid>
        </Grid>
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
        <DialogActions sx={{ padding: 2.5, gap: 1, backgroundColor: `${colors.backgroundLight}4D` }}>
          <Button
            onClick={() => setSaveDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: colors.textSecondary,
              color: colors.textSecondary,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '12px',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={performSave}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.success}DD 100%)`,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '12px',
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
        <DialogActions sx={{ padding: 2.5, gap: 1, backgroundColor: `${colors.backgroundLight}4D` }}>
          <Button
            onClick={() => setResetDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: colors.textSecondary,
              color: colors.textSecondary,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '12px',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={performReset}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${colors.warning} 0%, ${colors.warning}DD 100%)`,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '12px',
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
            background: `linear-gradient(135deg, ${
              isMaintenanceMode ? colors.success : colors.warning
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
        <DialogActions sx={{ padding: 2.5, gap: 1, backgroundColor: `${colors.backgroundLight}4D` }}>
          <Button
            onClick={() => setMaintenanceDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: colors.textSecondary,
              color: colors.textSecondary,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '12px',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={performToggleMaintenance}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${
                isMaintenanceMode ? colors.success : colors.warning
              } 0%, ${isMaintenanceMode ? colors.success : colors.warning}DD 100%)`,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '12px',
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
