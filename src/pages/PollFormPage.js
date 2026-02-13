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
  Divider,
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
import { getPolls, getPoll, createPoll, updatePoll } from '../services/pollsService';
import { getLeagues } from '../services/leaguesService';
import { getTeams } from '../services/teamsService';

const PollFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [leagues, setLeagues] = useState([]);
  const [leagueFixtures, setLeagueFixtures] = useState([]);
  const [polls, setPolls] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamsError, setTeamsError] = useState('');
  const [selectedFixtures, setSelectedFixtures] = useState([
    { matchNum: 1, teamA: '', teamB: '' },
    { matchNum: 2, teamA: '', teamB: '' },
    { matchNum: 3, teamA: '', teamB: '' },
    { matchNum: 4, teamA: '', teamB: '' },
    { matchNum: 5, teamA: '', teamB: '' },
  ]);

  const [formData, setFormData] = useState({
    leagueId: '',
    startTime: new Date(),
    closeTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days default
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch leagues
        const leaguesResult = await getLeagues({ status: 'Active' });
        if (leaguesResult.success && leaguesResult.data?.leagues) {
          const formattedLeagues = leaguesResult.data.leagues.map(league => ({
            id: league._id || league.league_id,
            name: league.league_name || league.name,
            isActive: league.status === 'Active',
          }));
          setLeagues(formattedLeagues);
        }

        // Fetch all polls to check rules
        const pollsResult = await getPolls();
        if (pollsResult.success && pollsResult.data?.polls) {
          setPolls(pollsResult.data.polls);
        }

        // If editing, fetch the poll data
        if (isEditMode && id) {
          const pollResult = await getPoll(id);
          if (pollResult.success && pollResult.data) {
            const poll = pollResult.data;
            setFormData({
              leagueId: poll.league_id || poll.leagueId,
              startTime: poll.start_time ? new Date(poll.start_time) : new Date(),
              closeTime: poll.close_time ? new Date(poll.close_time) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            });

            // Load fixtures if they exist
            if (poll.fixtures && Array.isArray(poll.fixtures)) {
              const fixtures = poll.fixtures.map((f, index) => ({
                matchNum: f.match_num || f.matchNum || index + 1,
                teamA: String(f.team_a_id || f.teamAId || f.teamA?._id || f.teamA || ''),
                teamB: String(f.team_b_id || f.teamBId || f.teamB?._id || f.teamB || ''),
              }));
              // Ensure we have exactly 5 fixtures
              while (fixtures.length < 5) {
                fixtures.push({ matchNum: fixtures.length + 1, teamA: '', teamB: '' });
              }
              setSelectedFixtures(fixtures.slice(0, 5));
            }
          }
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
    const loadLeagueTeams = async (leagueId) => {
      if (!leagueId) {
        setAvailableTeams([]);
        setLeagueFixtures([]);
        setLoadingTeams(false);
        setTeamsError('');
        return;
      }

      setLoadingTeams(true);
      setTeamsError('');
      setAvailableTeams([]);

      try {
        // Fetch teams for the selected league using teamsService (same pattern as TeamsPage)
        const teamsResult = await getTeams({
          league_id: leagueId,
          status: 'Active'
        });

        if (teamsResult.success && teamsResult.data?.teams) {
          const formattedTeams = teamsResult.data.teams.map(team => ({
            id: team._id || team.team_id,
            name: team.team_name || team.name,
            leagueId: team.league_id || leagueId,
          }));
          setAvailableTeams(formattedTeams);
          setTeamsError('');
        } else {
          setAvailableTeams([]);
          setTeamsError(teamsResult.error || 'No teams found for this league');
        }

        // Clear fixtures as they're not needed for team selection
        setLeagueFixtures([]);
      } catch (error) {
        console.error('Error loading teams:', error);
        setAvailableTeams([]);
        setTeamsError(error.message || 'Failed to load teams');
      } finally {
        setLoadingTeams(false);
      }
    };

    if (formData.leagueId) {
      loadLeagueTeams(formData.leagueId);
    } else {
      setAvailableTeams([]);
      setLeagueFixtures([]);
      setLoadingTeams(false);
      setTeamsError('');
    }
  }, [formData.leagueId]);

  const handleChange = (field, value) => {
    console.log('handleChange called:', { field, value, currentFormData: formData });

    // Ensure closeTime is always after startTime
    if (field === 'startTime' && value) {
      const newStartTime = value instanceof Date ? value : new Date(value);
      const currentCloseTime = formData.closeTime instanceof Date ? formData.closeTime : new Date(formData.closeTime);

      // If new start time is after or equal to close time, adjust close time to be 24 hours after start
      if (newStartTime >= currentCloseTime) {
        const newCloseTime = new Date(newStartTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
        setFormData({ ...formData, startTime: newStartTime, closeTime: newCloseTime });
        return;
      }
    }

    if (field === 'closeTime' && value) {
      const newCloseTime = value instanceof Date ? value : new Date(value);
      const currentStartTime = formData.startTime instanceof Date ? formData.startTime : new Date(formData.startTime);

      // Ensure close time is at least 1 hour after start time
      if (newCloseTime <= currentStartTime) {
        alert('Close time must be after start time. Please select a later date/time.');
        return;
      }
    }

    setFormData({ ...formData, [field]: value });
  };

  const handleTeamSelect = (matchNum, teamType, teamId) => {
    setSelectedFixtures(prev =>
      prev.map(fixture =>
        fixture.matchNum === matchNum
          ? { ...fixture, [teamType]: teamId }
          : fixture
      )
    );
  };

  // Get all teams that are already selected across all fixtures
  const getSelectedTeamIds = (currentMatchNum) => {
    const selectedIds = new Set();
    selectedFixtures.forEach(fixture => {
      if (fixture.matchNum !== currentMatchNum) {
        if (fixture.teamA) selectedIds.add(fixture.teamA);
        if (fixture.teamB) selectedIds.add(fixture.teamB);
      }
    });
    return selectedIds;
  };

  // Check if a team is available for selection in a specific fixture
  const isTeamAvailable = (teamId, fixture, teamType) => {
    if (!teamId) return true; // Empty selection is always allowed

    // Can't select the same team as the opposite team in the same match
    if (teamType === 'teamA' && fixture.teamB === teamId) return false;
    if (teamType === 'teamB' && fixture.teamA === teamId) return false;

    // Can't select a team that's already selected in another fixture
    const selectedInOtherFixtures = getSelectedTeamIds(fixture.matchNum);
    if (selectedInOtherFixtures.has(teamId)) return false;

    return true;
  };

  const validateFixtures = () => {
    // Check all matches have both teams
    const allMatchesComplete = selectedFixtures.every(f => f.teamA && f.teamB);

    // Check no team plays itself in the same match
    const noSelfMatchups = selectedFixtures.every(f => f.teamA !== f.teamB);

    // Check no team is used more than once across all fixtures
    const allSelectedTeams = [];
    selectedFixtures.forEach(f => {
      if (f.teamA) allSelectedTeams.push(f.teamA);
      if (f.teamB) allSelectedTeams.push(f.teamB);
    });
    const uniqueTeams = new Set(allSelectedTeams);
    const noDuplicateTeams = allSelectedTeams.length === uniqueTeams.size;

    // Check exactly 5 matches
    const exactlyFive = selectedFixtures.length === 5;

    return allMatchesComplete && noSelfMatchups && noDuplicateTeams && exactlyFive;
  };

  const handleSave = async () => {
    // Validate league is selected
    if (!formData.leagueId || !formData.leagueId.trim()) {
      alert('Please select a league before saving.');
      return;
    }

    // Validate fixtures first
    if (!validateFixtures()) {
      alert('Please select both teams for all 5 matches before saving.');
      return;
    }

    try {
      setSaving(true);

      // Ensure dates are valid Date objects and closeTime is after startTime
      const startTime = formData.startTime instanceof Date ? formData.startTime : new Date(formData.startTime);
      let closeTime = formData.closeTime instanceof Date ? formData.closeTime : new Date(formData.closeTime);

      // Validate closeTime is after startTime (minimum 1 hour difference)
      if (closeTime <= startTime) {
        alert('Close time must be after start time. Please adjust the dates.');
        setSaving(false);
        return;
      }

      // Ensure minimum 24 hours duration
      const minCloseTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000);
      if (closeTime < minCloseTime) {
        alert('Poll duration must be at least 24 hours. Close time will be adjusted to 24 hours after start time.');
        closeTime = minCloseTime;
      }

      const pollData = {
        leagueId: formData.leagueId,
        startTime: startTime,
        closeTime: closeTime,
        fixtures: selectedFixtures.map(f => ({
          matchNum: f.matchNum,
          teamAId: f.teamA,
          teamAName: availableTeams.find(t => t.id === f.teamA)?.name,
          teamBId: f.teamB,
          teamBName: availableTeams.find(t => t.id === f.teamB)?.name,
        }))
      };

      console.log('Poll data being sent:', pollData); // Debug log
      console.log('Start time:', startTime.toISOString());
      console.log('Close time:', closeTime.toISOString());

      let result;
      if (isEditMode) {
        result = await updatePoll(id, pollData);
      } else {
        result = await createPoll(pollData);
      }

      if (result.success) {
        alert(result.message || (isEditMode ? 'Poll updated successfully!' : 'Poll created successfully!'));
        navigate(constants.routes.polls);
      } else {
        const errorMessage = result.error || result.data?.error?.message || result.data?.message || 'Failed to save poll';
        console.error('Poll save error:', { result, pollData });
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error saving poll:', error);
      alert('Failed to save poll: ' + (error.message || 'Unknown error'));
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
                One poll per league • Max 5 active • Schedule for future or start now
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
                      backgroundColor: colors.brandWhite,
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
                      Teams & Matches (Members will vote for these)
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: colors.textSecondary, mt: 0.5 }}>
                      Each team can be selected only once across all 5 matches.
                    </Typography>
                  </Box>
                  {loadingTeams ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                      <CircularProgress size={32} sx={{ color: colors.brandRed }} />
                      <Typography variant="body2" sx={{ ml: 2, color: colors.textSecondary }}>
                        Loading teams...
                      </Typography>
                    </Box>
                  ) : teamsError ? (
                    <Alert severity="warning" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                        {teamsError}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: 12 }}>
                        Please ensure the league has active teams assigned.
                      </Typography>
                    </Alert>
                  ) : availableTeams.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Alert severity="info" sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                          Matches per poll: Minimum 5, Maximum 5
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: 12 }}>
                          (Only Super Admin can override this limit if required)
                        </Typography>
                      </Alert>

                      {/* Selectable Team Matchups */}
                      {selectedFixtures.map((fixture, index) => (
                        <Card
                          key={fixture.matchNum}
                          elevation={0}
                          sx={{
                            padding: 2,
                            borderRadius: '12px',
                            backgroundColor: colors.brandWhite,
                            border: `1px solid ${colors.divider}`,
                            '&:hover': {
                              borderColor: colors.brandRed,
                              boxShadow: `0 2px 8px ${colors.brandRed}20`,
                            }
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 2 }}>
                            Match {fixture.matchNum}
                          </Typography>

                          {/* Team A (Home) Selection */}
                          <FormControl
                            fullWidth
                            sx={{
                              mb: 1.5,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                backgroundColor: colors.brandWhite,
                              }
                            }}
                          >
                            <InputLabel id={`team-a-label-${fixture.matchNum}`}>Team A (Home)</InputLabel>
                            <Select
                              labelId={`team-a-label-${fixture.matchNum}`}
                              id={`team-a-select-${fixture.matchNum}`}
                              value={fixture.teamA}
                              onChange={(e) => handleTeamSelect(fixture.matchNum, 'teamA', e.target.value)}
                              label="Team A (Home)"
                            >
                              <MenuItem value="">
                                <em>Select Team A</em>
                              </MenuItem>
                              {availableTeams.map((team) => {
                                const isDisabled = !isTeamAvailable(team.id, fixture, 'teamA');
                                return (
                                  <MenuItem
                                    key={team.id}
                                    value={team.id}
                                    disabled={isDisabled}
                                  >
                                    {team.name}
                                    {isDisabled && team.id !== fixture.teamA && (
                                      <Typography component="span" variant="caption" sx={{ ml: 1, color: colors.textSecondary, fontStyle: 'italic' }}>
                                        (Already selected)
                                      </Typography>
                                    )}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>

                          {/* VS Divider */}
                          <Divider sx={{ my: 1 }}>
                            <Chip
                              label="VS"
                              size="small"
                              sx={{
                                fontWeight: 700,
                                bgcolor: colors.brandRed,
                                color: colors.brandWhite,
                                fontSize: 11,
                              }}
                            />
                          </Divider>

                          {/* Team B (Away) Selection */}
                          <FormControl
                            fullWidth
                            sx={{
                              mt: 1.5,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                backgroundColor: colors.brandWhite,
                              }
                            }}
                          >
                            <InputLabel id={`team-b-label-${fixture.matchNum}`}>Team B (Away)</InputLabel>
                            <Select
                              labelId={`team-b-label-${fixture.matchNum}`}
                              id={`team-b-select-${fixture.matchNum}`}
                              value={fixture.teamB}
                              onChange={(e) => handleTeamSelect(fixture.matchNum, 'teamB', e.target.value)}
                              label="Team B (Away)"
                            >
                              <MenuItem value="">
                                <em>Select Team B</em>
                              </MenuItem>
                              {availableTeams.map((team) => {
                                const isDisabled = !isTeamAvailable(team.id, fixture, 'teamB');
                                return (
                                  <MenuItem
                                    key={team.id}
                                    value={team.id}
                                    disabled={isDisabled}
                                  >
                                    {team.name}
                                    {isDisabled && team.id !== fixture.teamB && (
                                      <Typography component="span" variant="caption" sx={{ ml: 1, color: colors.textSecondary, fontStyle: 'italic' }}>
                                        (Already selected)
                                      </Typography>
                                    )}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>

                          {/* Selected Teams Preview */}
                          {fixture.teamA && fixture.teamB && (
                            <Box sx={{ mt: 2, p: 1.5, borderRadius: '8px', bgcolor: `${colors.success}0D`, border: `1px solid ${colors.success}40` }}>
                              <Typography variant="caption" sx={{ color: colors.success, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CheckCircle sx={{ fontSize: 14 }} />
                                Match {fixture.matchNum} Ready
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, mt: 0.5 }}>
                                {availableTeams.find(t => t.id === fixture.teamA)?.name} vs {availableTeams.find(t => t.id === fixture.teamB)?.name}
                              </Typography>
                            </Box>
                          )}
                        </Card>
                      ))}

                      {/* Validation Summary */}
                      {validateFixtures() && (
                        <Alert severity="success" sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                            ✓ All 5 matches configured correctly
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                        No teams available
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: 12 }}>
                        Select a league above to load teams for the poll.
                      </Typography>
                    </Alert>
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
                          backgroundColor: colors.brandWhite,
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
                          backgroundColor: colors.brandWhite,
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
            disabled={saving || !formData.leagueId || !rules.onePollPerLeague || !rules.maxFiveActive || !rules.closeAfterStart || !rules.durationValid || !validateFixtures()}
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
