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
} from '@mui/material';
import {
  ArrowBack,
  Save,
  SportsSoccer,
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
          }}
        >
          Back to Fixtures
        </Button>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              padding: 1.5,
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '14px',
            }}
          >
            <SportsSoccer sx={{ fontSize: 28, color: colors.brandWhite }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.brandBlack,
              fontSize: { xs: 24, md: 28 },
            }}
          >
            {isEditMode ? 'Edit Fixture' : 'Add New Fixture'}
          </Typography>
        </Box>

        {/* Form */}
        <Card sx={{ padding: 3, borderRadius: '16px' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Home Team"
                value={formData.homeTeam}
                onChange={(e) => handleChange('homeTeam', e.target.value)}
                required
                sx={{ borderRadius: '12px' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Away Team"
                value={formData.awayTeam}
                onChange={(e) => handleChange('awayTeam', e.target.value)}
                required
                sx={{ borderRadius: '12px' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>League</InputLabel>
                <Select
                  value={formData.leagueId}
                  onChange={(e) => handleChange('leagueId', e.target.value)}
                  label="League"
                  sx={{ borderRadius: '12px' }}
                >
                  {leagues.map((league) => (
                    <MenuItem key={league.id} value={league.id}>
                      {league.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Venue"
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                sx={{ borderRadius: '12px' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Kickoff Time"
                value={formData.kickoffTime}
                onChange={(date) => handleChange('kickoffTime', date)}
                fullWidth
                slotProps={{
                  textField: {
                    sx: { borderRadius: '12px' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.matchStatus}
                  onChange={(e) => handleChange('matchStatus', e.target.value)}
                  label="Status"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="live">Live</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
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
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.success}DD 100%)`,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {saving ? 'Saving...' : 'Save Fixture'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default FixtureFormPage;
