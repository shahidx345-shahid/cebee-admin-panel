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
  ArrowBack,
  Save,
  SportsSoccer,
  Add,
  Star,
  People,
  CheckCircle,
  Shield,
  Stadium,
  CalendarToday,
  Send,
  Check,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const FixtureFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [leagues, setLeagues] = useState([]);

  const [featureType, setFeatureType] = useState('cebee'); // 'cebee' or 'community'
  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    leagueId: '',
    venue: '',
    kickoffTime: new Date(),
    matchStatus: 'scheduled',
  });

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await loadLeagues();
      if (isEditMode) {
        await loadFixtureData();
      } else {
        setLoading(false);
      }
    };
    initialize();
  }, [id, isEditMode]);

  const loadLeagues = async () => {
    try {
      const leaguesRef = collection(db, 'leagues');
      const snapshot = await getDocs(leaguesRef);
      const leaguesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeagues(leaguesData.filter((l) => l.isActive));
    } catch (error) {
      console.error('Error loading leagues:', error);
    } finally {
      if (!isEditMode) {
        setLoading(false);
      }
    }
  };

  const loadFixtureData = async () => {
    try {
      setLoading(true);
      const fixtureRef = doc(db, 'fixtures', id);
      const fixtureDoc = await getDoc(fixtureRef);
      if (fixtureDoc.exists()) {
        const data = fixtureDoc.data();
        setFormData({
          homeTeam: data.homeTeam || '',
          awayTeam: data.awayTeam || '',
          leagueId: data.leagueId || '',
          venue: data.venue || '',
          kickoffTime: data.kickoffTime?.toDate ? data.kickoffTime.toDate() : new Date(data.kickoffTime),
          matchStatus: data.matchStatus || data.status || 'scheduled',
        });
      }
    } catch (error) {
      console.error('Error loading fixture:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const fixtureData = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (isEditMode) {
        const fixtureRef = doc(db, 'fixtures', id);
        await updateDoc(fixtureRef, fixtureData);
      } else {
        const fixtureRef = doc(collection(db, 'fixtures'));
        await setDoc(fixtureRef, {
          ...fixtureData,
          createdAt: serverTimestamp(),
        });
      }
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
