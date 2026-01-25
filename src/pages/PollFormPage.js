import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Close,
  BarChart,
  Stadium,
  CalendarToday,
  Schedule,
  Info,
  CheckCircle,
  RadioButtonUnchecked,
  SportsSoccer,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, differenceInHours, differenceInDays } from 'date-fns';

const PollFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [leagues, setLeagues] = useState([]);
  const [leagueFixtures, setLeagueFixtures] = useState([]);
  const [polls, setPolls] = useState([]);

  const [formData, setFormData] = useState({
    leagueId: '',
    startTime: new Date(),
    closeTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days default
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Simulate network
        await new Promise(resolve => setTimeout(resolve, 600));

        // Mock Leagues
        setLeagues([
          { id: 'premier_league', name: 'Premier League', isActive: true },
          { id: 'la_liga', name: 'La Liga', isActive: true },
          { id: 'ligue_1', name: 'Ligue 1', isActive: true },
        ]);

        // Mock Polls
        setPolls([
          { id: '1', leagueId: 'la_liga', status: 'active' },
          { id: '2', leagueId: 'premier_league', status: 'closed' }
        ]);

        if (isEditMode) {
          // Mock existing poll data
          setFormData({
            leagueId: 'premier_league',
            startTime: new Date(),
            closeTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode]);

  useEffect(() => {
    const loadLeagueFixtures = async (leagueId) => {
      if (!leagueId) {
        setLeagueFixtures([]);
        return;
      }
      try {
        // Mock fixtures
        const fixtures = [
          { id: 'f1', homeTeam: 'Team A', awayTeam: 'Team B' },
          { id: 'f2', homeTeam: 'Team C', awayTeam: 'Team D' },
        ];
        setLeagueFixtures(fixtures);
      } catch (error) {
        console.error('Error loading fixtures:', error);
        setLeagueFixtures([]);
      }
    };

    if (formData.leagueId) {
      loadLeagueFixtures(formData.leagueId);
    } else {
      setLeagueFixtures([]);
    }
  }, [formData.leagueId]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Mock save
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Poll saved:', formData);
      alert('Poll saved successfully (Mock)!');

      navigate(constants.routes.polls);
    } catch (error) {
      console.error('Error saving poll:', error);
      alert('Failed to save poll');
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

  const checkPollRules = () => {
    const selectedLeague = leagues.find((l) => l.id === formData.leagueId);
    // Exclude current poll when in edit mode
    const activePolls = polls.filter(
      (p) => (p.status || p.pollStatus) === 'active' && (!isEditMode || p.id !== id)
    );
    const leaguePolls = activePolls.filter((p) => p.leagueId === formData.leagueId);
    const activePollsCount = activePolls.length;
    const durationHours = differenceInHours(formData.closeTime, formData.startTime);
    const durationDays = differenceInDays(formData.closeTime, formData.startTime);

    return {
      onePollPerLeague: !selectedLeague || leaguePolls.length === 0,
      maxFiveActive: activePollsCount < 5,
      closeAfterStart: formData.closeTime > formData.startTime,
      durationValid: durationHours >= 24 && durationHours <= 30 * 24,
      durationHours,
      durationDays,
    };
  };

  const rules = checkPollRules();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', maxWidth: '100%' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton
              onClick={() => navigate(constants.routes.polls)}
              sx={{
                backgroundColor: colors.brandRed,
                color: colors.brandWhite,
                width: 40,
                height: 40,
                '&:hover': {
                  backgroundColor: colors.brandDarkRed,
                },
              }}
            >
              <ArrowBack sx={{ fontSize: 20 }} />
            </IconButton>
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
              <BarChart sx={{ fontSize: 28, color: colors.brandWhite }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: colors.brandBlack,
                  fontSize: { xs: 24, md: 28 },
                  mb: 0.5,
                }}
              >
                {isEditMode ? 'Edit Poll' : 'Create New Poll'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: colors.textSecondary,
                  fontSize: 14,
                }}
              >
                One poll per league • Max 5 active • 24h-30d duration
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Poll Details Section */}
        <Card
          sx={{
            padding: 3,
            borderRadius: '20px',
            boxShadow: `0 4px 12px ${colors.shadow}14`,
            mb: 3,
            backgroundColor: colors.brandWhite,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: colors.brandBlack,
                fontSize: 18,
                mb: 0.5,
              }}
            >
              Poll Details
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.textSecondary,
                fontSize: 14,
              }}
            >
              Configure the poll settings below
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Select League */}
            <Grid item xs={12}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Stadium sx={{ fontSize: 18, color: colors.brandRed }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: colors.brandBlack,
                      fontSize: 14,
                    }}
                  >
                    Select League
                    <Typography
                      component="span"
                      sx={{
                        color: colors.brandRed,
                        ml: 0.5,
                      }}
                    >
                      *
                    </Typography>
                  </Typography>
                </Box>
                <FormControl
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      backgroundColor: `${colors.backgroundLight}80`,
                      '& fieldset': {
                        borderColor: `${colors.divider}66`,
                      },
                      '&:hover fieldset': {
                        borderColor: colors.brandRed,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colors.brandRed,
                      },
                    },
                  }}
                >
                  <Select
                    value={formData.leagueId}
                    onChange={(e) => handleChange('leagueId', e.target.value)}
                    displayEmpty
                    renderValue={(value) => {
                      if (!value) return 'Choose a league';
                      const league = leagues.find((l) => l.id === value);
                      return league?.name || 'Choose a league';
                    }}
                  >
                    {leagues.map((league) => (
                      <MenuItem key={league.id} value={league.id}>
                        {league.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {/* Teams/Matches Display */}
            {formData.leagueId && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    padding: 2,
                    borderRadius: '12px',
                    backgroundColor: `${colors.info}0D`,
                    border: `1px solid ${colors.info}26`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <SportsSoccer sx={{ fontSize: 18, color: colors.info }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
                      Teams / Matches in this Poll
                    </Typography>
                  </Box>
                  {leagueFixtures.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Alert severity="info" sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                          Matches per poll: Minimum 5, Maximum 5
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: 12 }}>
                          (Only Super Admin can override this limit if required)
                        </Typography>
                      </Alert>
                      {leagueFixtures.slice(0, 5).map((fixture) => (
                        <Card
                          key={fixture.id}
                          elevation={0}
                          sx={{
                            padding: 2,
                            borderRadius: '12px',
                            backgroundColor: colors.brandWhite,
                            border: `1px solid ${colors.divider}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            '&:hover': {
                              borderColor: colors.info,
                              backgroundColor: '#F8FAFC'
                            }
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.brandBlack, lineHeight: 1.2, mb: 0.5 }}>
                            {fixture.homeTeam || 'TBD'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                            vs {fixture.awayTeam || 'TBD'}
                          </Typography>
                        </Card>
                      ))}
                      {leagueFixtures.length > 5 && (
                        <Typography variant="caption" sx={{ color: colors.textSecondary, mt: 0.5, textAlign: 'center', display: 'block' }}>
                          + {leagueFixtures.length - 5} more matches
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>
                      No fixtures found for this league. Users will vote on teams from this league.
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}

            {/* Start Date & Time */}
            <Grid item xs={12}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarToday sx={{ fontSize: 18, color: colors.brandRed }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: colors.brandBlack,
                      fontSize: 14,
                    }}
                  >
                    Start Date & Time
                    <Typography
                      component="span"
                      sx={{
                        color: colors.brandRed,
                        ml: 0.5,
                      }}
                    >
                      *
                    </Typography>
                  </Typography>
                </Box>
                <DateTimePicker
                  value={formData.startTime}
                  onChange={(date) => handleChange('startTime', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      placeholder: 'Select start date and time',
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '14px',
                          backgroundColor: `${colors.backgroundLight}80`,
                          '& fieldset': {
                            borderColor: `${colors.divider}66`,
                          },
                          '&:hover fieldset': {
                            borderColor: colors.brandRed,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: colors.brandRed,
                          },
                        },
                      },
                      InputProps: {
                        startAdornment: (
                          <Box sx={{ mr: 1, color: colors.brandRed }}>
                            <Schedule sx={{ fontSize: 18 }} />
                          </Box>
                        ),
                      },
                    },
                  }}
                  format="EEEE, MMM d, yyyy • HH:mm"
                />
              </Box>
            </Grid>

            {/* Close Date & Time */}
            <Grid item xs={12}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarToday sx={{ fontSize: 18, color: colors.brandRed }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: colors.brandBlack,
                      fontSize: 14,
                    }}
                  >
                    Close Date & Time
                    <Typography
                      component="span"
                      sx={{
                        color: colors.brandRed,
                        ml: 0.5,
                      }}
                    >
                      *
                    </Typography>
                  </Typography>
                </Box>
                <DateTimePicker
                  value={formData.closeTime}
                  onChange={(date) => handleChange('closeTime', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      placeholder: 'Select close date and time',
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '14px',
                          backgroundColor: `${colors.backgroundLight}80`,
                          '& fieldset': {
                            borderColor: `${colors.divider}66`,
                          },
                          '&:hover fieldset': {
                            borderColor: colors.brandRed,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: colors.brandRed,
                          },
                        },
                      },
                      InputProps: {
                        startAdornment: (
                          <Box sx={{ mr: 1, color: colors.brandRed }}>
                            <Schedule sx={{ fontSize: 18 }} />
                          </Box>
                        ),
                      },
                    },
                  }}
                  format="EEEE, MMM d, yyyy • HH:mm"
                />
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Poll Rules & Requirements Card */}
        <Card
          sx={{
            padding: 3,
            borderRadius: '20px',
            boxShadow: `0 4px 12px ${colors.shadow}14`,
            mb: 3,
            backgroundColor: `${colors.info}0D`,
            border: `1px solid ${colors.info}33`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: colors.info,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Info sx={{ fontSize: 18, color: colors.brandWhite }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: colors.info,
                fontSize: 16,
              }}
            >
              Poll Rules & Requirements
            </Typography>
          </Box>

          <List sx={{ py: 0 }}>
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {rules.onePollPerLeague ? (
                  <CheckCircle sx={{ fontSize: 20, color: colors.success }} />
                ) : (
                  <RadioButtonUnchecked sx={{ fontSize: 20, color: colors.textSecondary }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Only one active poll per league"
                primaryTypographyProps={{
                  fontSize: 14,
                  color: colors.brandBlack,
                  fontWeight: 500,
                }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {rules.maxFiveActive ? (
                  <CheckCircle sx={{ fontSize: 20, color: colors.success }} />
                ) : (
                  <RadioButtonUnchecked sx={{ fontSize: 20, color: colors.textSecondary }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Maximum of 5 active polls across all leagues"
                primaryTypographyProps={{
                  fontSize: 14,
                  color: colors.brandBlack,
                  fontWeight: 500,
                }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <RadioButtonUnchecked sx={{ fontSize: 20, color: colors.textSecondary }} />
              </ListItemIcon>
              <ListItemText
                primary="Manchester United matches are excluded"
                primaryTypographyProps={{
                  fontSize: 14,
                  color: colors.brandBlack,
                  fontWeight: 500,
                }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {rules.closeAfterStart ? (
                  <CheckCircle sx={{ fontSize: 20, color: colors.success }} />
                ) : (
                  <RadioButtonUnchecked sx={{ fontSize: 20, color: colors.textSecondary }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Close time must be after start time"
                primaryTypographyProps={{
                  fontSize: 14,
                  color: colors.brandBlack,
                  fontWeight: 500,
                }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {rules.durationValid ? (
                  <CheckCircle sx={{ fontSize: 20, color: colors.success }} />
                ) : (
                  <RadioButtonUnchecked sx={{ fontSize: 20, color: colors.textSecondary }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Poll duration: 24 hours - 30 days"
                primaryTypographyProps={{
                  fontSize: 14,
                  color: colors.brandBlack,
                  fontWeight: 500,
                }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircle sx={{ fontSize: 20, color: colors.success }} />
              </ListItemIcon>
              <ListItemText
                primary="Poll must close before match setup begins"
                primaryTypographyProps={{
                  fontSize: 14,
                  color: colors.brandBlack,
                  fontWeight: 500,
                }}
              />
            </ListItem>
          </List>

          {/* Duration Display */}
          {formData.startTime && formData.closeTime && (
            <Alert
              severity={rules.durationValid ? 'info' : 'error'}
              icon={<Schedule />}
              sx={{
                mt: 2,
                borderRadius: '12px',
                backgroundColor: rules.durationValid ? `${colors.info}1A` : `${colors.error}1A`,
                color: rules.durationValid ? colors.info : colors.error,
                '& .MuiAlert-icon': {
                  color: rules.durationValid ? colors.info : colors.error,
                },
                '& .MuiAlert-message': {
                  fontWeight: 600,
                  fontSize: 14,
                },
              }}
            >
              Duration: {rules.durationHours} hours ({rules.durationDays} day{rules.durationDays !== 1 ? 's' : ''})
            </Alert>
          )}
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Close />}
            onClick={() => navigate(constants.routes.polls)}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              color: colors.textSecondary,
              borderColor: colors.divider,
              '&:hover': {
                backgroundColor: `${colors.divider}0D`,
                borderColor: colors.divider,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleSave}
            disabled={saving || !rules.onePollPerLeague || !rules.maxFiveActive || !rules.closeAfterStart || !rules.durationValid}
            sx={{
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.brandDarkRed} 0%, ${colors.brandRed} 100%)`,
              },
              '&.Mui-disabled': {
                background: `${colors.divider}66`,
                color: colors.textSecondary,
              },
            }}
          >
            {saving ? 'Creating...' : isEditMode ? 'Update Poll' : 'Create Poll'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default PollFormPage;
