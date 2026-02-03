import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Save,
  Add,
  ArrowBack,
  Star,
  People,
  CheckCircle,
  Shield,
  Stadium,
  CalendarToday,
  Send,
  Event as EventIcon,
  RadioButtonChecked,
  RadioButtonUnchecked,
  Info,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const FixtureFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [leagues, setLeagues] = useState([]);
  const [cmds, setCmds] = useState([]);
  const [currentCmd, setCurrentCmd] = useState(null);
  const [showNewCmdForm, setShowNewCmdForm] = useState(false);
  const [newCmdForm, setNewCmdForm] = useState({
    name: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'current',
  });

  const [featureType, setFeatureType] = useState('cebee'); // 'cebee' or 'community'
  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    leagueId: '',
    venue: '',
    kickoffTime: new Date(),
    matchStatus: 'scheduled',
    cmdId: '', // Will be set to current CMd
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        // Simulate network
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock Leagues
        setLeagues([
          { id: 'premier_league', name: 'Premier League', isActive: true },
          { id: 'la_liga', name: 'La Liga', isActive: true },
          { id: 'champions_league', name: 'Champions League', isActive: true },
        ]);

        // Mock CMds - Load existing CMds
        const mockCmds = [
          {
            id: 'cmd_001',
            name: 'CMd-05',
            startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            status: 'current',
            fixtureCount: 12,
          },
          {
            id: 'cmd_002',
            name: 'CMd-04',
            startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            status: 'completed',
            fixtureCount: 15,
          },
          {
            id: 'cmd_003',
            name: 'CMd-03',
            startDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            status: 'completed',
            fixtureCount: 18,
          },
        ];
        setCmds(mockCmds);
        
        // Set current CMd (only one can be current)
        const current = mockCmds.find(cmd => cmd.status === 'current');
        if (current) {
          setCurrentCmd(current);
          setFormData(prev => ({ ...prev, cmdId: current.id }));
        }

        // Mock Fixture Data if Edit Mode
        if (isEditMode) {
          setFormData({
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            leagueId: 'premier_league',
            venue: 'wembley',
            kickoffTime: new Date(),
            matchStatus: 'scheduled',
            cmdId: current?.id || '',
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [id, isEditMode]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreateCmd = () => {
    if (!newCmdForm.name || !newCmdForm.startDate || !newCmdForm.endDate) {
      alert('Please fill all CMd fields');
      return;
    }

    // If setting as current, mark all other CMds as completed
    if (newCmdForm.status === 'current') {
      setCmds(prev => prev.map(cmd => ({ ...cmd, status: 'completed' })));
    }

    const newCmd = {
      id: `cmd_${Date.now()}`,
      name: newCmdForm.name,
      startDate: newCmdForm.startDate,
      endDate: newCmdForm.endDate,
      status: newCmdForm.status,
      fixtureCount: 0,
    };

    setCmds(prev => [...prev, newCmd]);
    
    if (newCmdForm.status === 'current') {
      setCurrentCmd(newCmd);
      setFormData(prev => ({ ...prev, cmdId: newCmd.id }));
    }

    // Reset form
    setNewCmdForm({
      name: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'current',
    });
    setShowNewCmdForm(false);
  };

  const handleSelectCmd = (cmdId) => {
    // If selecting a CMd as current, mark all others as completed
    setCmds(prev => prev.map(cmd => 
      cmd.id === cmdId ? { ...cmd, status: 'current' } : { ...cmd, status: 'completed' }
    ));
    const selectedCmd = cmds.find(cmd => cmd.id === cmdId);
    if (selectedCmd) {
      setCurrentCmd(selectedCmd);
      setFormData(prev => ({ ...prev, cmdId: selectedCmd.id }));
    }
  };

  const handleSave = async () => {
    // Ensure fixture is assigned to current CMd
    if (!formData.cmdId && currentCmd) {
      setFormData(prev => ({ ...prev, cmdId: currentCmd.id }));
    }

    if (!formData.cmdId) {
      alert('No active CMd found. Please create or select a CMd first.');
      return;
    }

    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Fixture saved:', { ...formData, cmdId: formData.cmdId || currentCmd?.id });
      alert('Fixture saved successfully (Mock)');

      navigate(constants.routes.fixtures);
    } catch (error) {
      console.error('Error saving fixture:', error);
      alert('Failed to save fixture');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: colors.brandRed }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', maxWidth: '100%' }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(constants.routes.fixtures)}
          sx={{
            mb: 3,
            color: colors.brandRed,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: `${colors.brandRed}0A`,
            },
          }}
        >
          Back to Fixtures
        </Button>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '16px',
              boxShadow: `0 4px 12px ${colors.brandRed}40`,
            }}
          >
            <Add sx={{ fontSize: 40, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: colors.brandBlack,
                fontSize: { xs: 24, md: 32 },
                mb: 0.5,
              }}
            >
              {isEditMode ? 'Edit Fixture' : 'Add New Fixture'}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: colors.textSecondary,
                fontSize: 16,
              }}
            >
              Create a new match fixture
            </Typography>
          </Box>
        </Box>

        {/* CMd (CeBee Matchday) Management Section */}
        <Card sx={{ padding: 3, borderRadius: '16px', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon sx={{ fontSize: 20, color: colors.brandRed }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                CeBee Matchday (CMd)
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setShowNewCmdForm(!showNewCmdForm)}
              sx={{
                borderColor: colors.brandRed,
                color: colors.brandRed,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '12px',
                '&:hover': {
                  borderColor: colors.brandDarkRed,
                  backgroundColor: `${colors.brandRed}0A`,
                },
              }}
            >
              {showNewCmdForm ? 'Cancel' : 'New CMd'}
            </Button>
          </Box>

          <Alert
            icon={<Info sx={{ color: colors.info }} />}
            sx={{
              mb: 3,
              backgroundColor: `${colors.info}15`,
              border: `1px solid ${colors.info}33`,
              borderRadius: '12px',
              '& .MuiAlert-icon': {
                color: colors.info,
              },
            }}
          >
            <Typography variant="body2" sx={{ color: colors.info, fontWeight: 600, mb: 0.5 }}>
              CMd Assignment
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 12 }}>
              All fixtures are automatically assigned to the Current CMd. Only one CMd can be active at a time.
            </Typography>
          </Alert>

          {/* Current CMd Display */}
          {currentCmd ? (
            <Box
              sx={{
                p: 2.5,
                borderRadius: '12px',
                backgroundColor: `${colors.brandRed}08`,
                border: `2px solid ${colors.brandRed}`,
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      padding: 1,
                      borderRadius: '8px',
                      backgroundColor: colors.brandRed,
                    }}
                  >
                    <RadioButtonChecked sx={{ fontSize: 20, color: colors.brandWhite }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack }}>
                      {currentCmd.name} (Current)
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 12 }}>
                      {format(currentCmd.startDate, 'MMM dd, yyyy')} - {format(currentCmd.endDate, 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 11 }}>
                      {currentCmd.fixtureCount} fixtures
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label="ACTIVE"
                  size="small"
                  sx={{
                    backgroundColor: colors.success,
                    color: colors.brandWhite,
                    fontWeight: 700,
                    fontSize: 10,
                    height: 24,
                  }}
                />
              </Box>
            </Box>
          ) : (
            <Alert
              severity="warning"
              sx={{
                mb: 2,
                borderRadius: '12px',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                No active CMd found. Please create a new CMd to continue.
              </Typography>
            </Alert>
          )}

          {/* Previous CMds List */}
          {cmds.filter(cmd => cmd.status === 'completed').length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: colors.textSecondary }}>
                Previous CMds
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {cmds
                  .filter(cmd => cmd.status === 'completed')
                  .map((cmd) => (
                    <Box
                      key={cmd.id}
                      onClick={() => handleSelectCmd(cmd.id)}
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: colors.brandWhite,
                        border: `1px solid ${colors.divider}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        '&:hover': {
                          borderColor: colors.brandRed,
                          backgroundColor: `${colors.brandRed}05`,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <RadioButtonUnchecked sx={{ fontSize: 18, color: colors.textSecondary }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
                            {cmd.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: 11 }}>
                            {format(cmd.startDate, 'MMM dd')} - {format(cmd.endDate, 'MMM dd, yyyy')} • {cmd.fixtureCount} fixtures
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label="COMPLETED"
                        size="small"
                        sx={{
                          backgroundColor: colors.textSecondary,
                          color: colors.brandWhite,
                          fontWeight: 600,
                          fontSize: 10,
                          height: 22,
                        }}
                      />
                    </Box>
                  ))}
              </Box>
            </Box>
          )}

          {/* New CMd Form */}
          {showNewCmdForm && (
            <Box
              sx={{
                p: 2.5,
                borderRadius: '12px',
                backgroundColor: `${colors.brandRed}05`,
                border: `1.5px solid ${colors.brandRed}33`,
                mt: 2,
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 700, mb: 2, color: colors.brandBlack }}>
                Create New CMd
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="CMd Name"
                    placeholder="e.g., CMd-06"
                    value={newCmdForm.name}
                    onChange={(e) => setNewCmdForm({ ...newCmdForm, name: e.target.value })}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Start Date"
                    value={newCmdForm.startDate}
                    onChange={(date) => setNewCmdForm({ ...newCmdForm, startDate: date })}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          },
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="End Date"
                    value={newCmdForm.endDate}
                    onChange={(date) => setNewCmdForm({ ...newCmdForm, endDate: date })}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          },
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={newCmdForm.status}
                      onChange={(e) => setNewCmdForm({ ...newCmdForm, status: e.target.value })}
                      label="Status"
                      sx={{
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: '12px',
                        },
                      }}
                    >
                      <MenuItem value="current">Current (Active)</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleCreateCmd}
                    sx={{
                      background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                    }}
                  >
                    Create CMd
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Card>

        {/* Feature Type Section */}
        <Card sx={{ padding: 3, borderRadius: '16px', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Star sx={{ fontSize: 20, color: colors.brandRed }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Feature Type
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card
                onClick={() => setFeatureType('cebee')}
                sx={{
                  padding: 2.5,
                  borderRadius: '16px',
                  border: `2px solid ${featureType === 'cebee' ? colors.brandRed : colors.divider}`,
                  backgroundColor: featureType === 'cebee' ? `${colors.brandRed}08` : colors.brandWhite,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: colors.brandRed,
                    backgroundColor: `${colors.brandRed}0D`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box
                    sx={{
                      padding: 1,
                      borderRadius: '8px',
                      backgroundColor: featureType === 'cebee' ? colors.brandRed : colors.textSecondary,
                    }}
                  >
                    <Star sx={{ fontSize: 24, color: colors.brandWhite }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      CeBee Featured
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                      Premium match selected by CeBee
                    </Typography>
                  </Box>
                </Box>
                {featureType === 'cebee' && (
                  <CheckCircle
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      fontSize: 24,
                      color: colors.brandRed,
                    }}
                  />
                )}
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                onClick={() => setFeatureType('community')}
                sx={{
                  padding: 2.5,
                  borderRadius: '16px',
                  border: `2px solid ${featureType === 'community' ? colors.brandRed : colors.divider}`,
                  backgroundColor: featureType === 'community' ? `${colors.brandRed}08` : colors.brandWhite,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: colors.brandRed,
                    backgroundColor: `${colors.brandRed}0D`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box
                    sx={{
                      padding: 1,
                      borderRadius: '8px',
                      backgroundColor: featureType === 'community' ? colors.brandRed : colors.textSecondary,
                    }}
                  >
                    <People sx={{ fontSize: 24, color: colors.brandWhite }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Community Featured
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                      Match voted by community
                    </Typography>
                  </Box>
                </Box>
                {featureType === 'community' && (
                  <CheckCircle
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      fontSize: 24,
                      color: colors.brandRed,
                    }}
                  />
                )}
              </Card>
            </Grid>
          </Grid>
        </Card>

        {/* Team Details Section */}
        <Card sx={{ padding: 3, borderRadius: '16px', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Stadium sx={{ fontSize: 20, color: colors.brandRed }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Team Details
            </Typography>
          </Box>

          {/* Info Banner */}
          <Alert
            icon={<CheckCircle sx={{ color: colors.success }} />}
            sx={{
              mb: 3,
              backgroundColor: `${colors.success}15`,
              border: `1px solid ${colors.success}33`,
              borderRadius: '12px',
              '& .MuiAlert-icon': {
                color: colors.success,
              },
            }}
          >
            <Typography variant="body2" sx={{ color: colors.success, fontWeight: 600 }}>
              {featureType === 'cebee'
                ? 'CeBee Featured - Create fixture from scratch with manual team selection'
                : 'Community Featured - Match voted by community'}
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Home Team"
                placeholder="Enter home team name"
                value={formData.homeTeam}
                onChange={(e) => handleChange('homeTeam', e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Shield sx={{ fontSize: 20, color: colors.brandRed }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Away Team"
                placeholder="Enter away team name"
                value={formData.awayTeam}
                onChange={(e) => handleChange('awayTeam', e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Shield sx={{ fontSize: 20, color: colors.brandRed }} />
                    </InputAdornment>
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
              <FormControl fullWidth>
                <InputLabel>Match Ground / Stadium</InputLabel>
                <Select
                  value={formData.venue || 'other'}
                  onChange={(e) => handleChange('venue', e.target.value)}
                  label="Match Ground / Stadium"
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: '12px',
                    },
                  }}
                >
                  <MenuItem value="other">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Send sx={{ fontSize: 18, color: colors.brandRed }} />
                      Other
                    </Box>
                  </MenuItem>
                  <MenuItem value="wembley">Wembley Stadium</MenuItem>
                  <MenuItem value="old_trafford">Old Trafford</MenuItem>
                  <MenuItem value="anfield">Anfield</MenuItem>
                  <MenuItem value="stamford_bridge">Stamford Bridge</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>League *</InputLabel>
                <Select
                  value={formData.leagueId}
                  onChange={(e) => handleChange('leagueId', e.target.value)}
                  label="League *"
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: '12px',
                    },
                  }}
                >
                  {leagues.map((league) => (
                    <MenuItem key={league.id} value={league.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Stadium sx={{ fontSize: 18, color: colors.brandRed }} />
                        {league.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>

        {/* Kickoff Schedule Section */}
        <Card sx={{ padding: 3, borderRadius: '16px', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CalendarToday sx={{ fontSize: 20, color: colors.brandRed }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Kickoff Schedule
            </Typography>
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Kickoff Date & Time *
                </Typography>
                <Chip
                  label="Required"
                  size="small"
                  sx={{
                    backgroundColor: colors.warning,
                    color: colors.brandBlack,
                    fontWeight: 600,
                    height: 20,
                    fontSize: 10,
                  }}
                />
              </Box>
              <DateTimePicker
                value={formData.kickoffTime}
                onChange={(date) => handleChange('kickoffTime', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      borderRadius: '12px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        border: `2px solid ${colors.brandRed}`,
                        '& fieldset': {
                          borderColor: colors.brandRed,
                        },
                      },
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(constants.routes.fixtures)}
            sx={{
              borderColor: colors.textSecondary,
              color: colors.textSecondary,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '12px',
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            {saving ? 'Creating...' : 'Create Fixture'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default FixtureFormPage;
