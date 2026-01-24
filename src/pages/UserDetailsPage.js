import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  CheckCircle,
  Cancel,
  Flag,
  TrendingUp,
  BarChart,
  EmojiEvents,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';


import { format } from 'date-fns';
import { VerifiedUser, Security, Edit, Gavel, TimerOff, AssignmentInd } from '@mui/icons-material';
import { MockDataService } from '../services/mockDataService';

const UserDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [kycData, setKycData] = useState({
    status: 'not_submitted', // not_submitted, pending, verified, rejected, expired
    submittedAt: null,
    verifiedAt: null,
    verifiedBy: null,
    riskLevel: 'none',
    notes: ''
  });

  // KYC Notes State
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteTemp, setNoteTemp] = useState('');

  useEffect(() => {
    if (kycData.notes) setNoteTemp(kycData.notes);
  }, [kycData.notes]);

  const handleSaveNotes = () => {
    handleKycUpdate({ notes: noteTemp });
    setIsEditingNotes(false);
  };

  useEffect(() => {
    loadUserData();
  }, [id]);

  const generateDummyUserData = (userId) => {
    const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Brazil', 'India', 'Nigeria', 'South Africa', 'Kenya', 'Ghana'];
    const isFlagged = Math.random() > 0.8;
    return {
      id: userId,
      username: 'john_doe_0',
      email: 'john_doe_0@example.com',
      fullName: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      country: countries[Math.floor(Math.random() * countries.length)],
      isActive: true,
      isVerified: true,
      isBlocked: false,
      isDeleted: false,
      isDeactivated: false,
      isFlagged: isFlagged,
      flagReason: isFlagged ? 'Multiple failed login attempts from different IPs' : '',
      adminNotes: 'User requires manual review for high withdrawal amounts.',
      fraudFlags: isFlagged ? ['Suspicious IP'] : [],
      spTotal: 2450,
      spCurrent: 1200,
      cpTotal: 350,
      cpCurrent: 150,
      totalPredictions: 45,
      totalReferrals: 23,
      predictionAccuracy: 68.5,
      totalPolls: 12,
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      kycRequestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Demo date
      spFromPredictions: 1800,
      spFromDailyLogin: 650,
      cpFromReferrals: 200,
      cpFromEngagement: 150,
    };
  };

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Fetch KYC data from MockService (parallel to user data loading logic if we had real backend)
      const kyc = await MockDataService.getKycData(id);
      if (kyc) {
        setKycData({
          ...kyc,
          submittedAt: kyc.submittedAt ? new Date(kyc.submittedAt) : null,
          verifiedAt: kyc.verifiedAt ? new Date(kyc.verifiedAt) : null,
        });
      }

      let userData = null;
      // Use dummy data if no real data exists
      if (!userData) {
        userData = generateDummyUserData(id);
      }

      setUser(userData);

      // Demo Log Activities
      setActivities([
        { id: 1, type: 'LOGIN', description: 'User logged in from IP 192.168.1.1', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: 2, type: 'PREDICTION_MADE', description: 'Placed prediction on Arsenal vs Chelsea', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 3, type: 'POLL_VOTE', description: 'Voted in "Player of the Month" poll', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 4, type: 'REWARD_CLAIM', description: 'Claimed Daily Login Bonus (50 SP)', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 5, type: 'KYC_SUBMISSION', description: 'Submitted ID Document for verification', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      ]);
    } catch (error) {
      console.error('Error loading user:', error);
      const dummyData = generateDummyUserData(id);
      setUser(dummyData);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };
  const handleKycUpdate = async (updates) => {
    setKycData((prev) => ({
      ...prev,
      ...updates
    }));
    try {
      await MockDataService.updateKycData(id, updates);
    } catch (error) {
      console.error('Failed to update KYC data:', error);
    }
  };

  const getAccountStatusChip = (user) => {
    if (user.isBlocked) {
      return <Chip label="Blocked" color="error" size="small" sx={{ fontWeight: 700 }} />;
    }
    if (user.isFlagged) {
      return <Chip label="Flagged" color="warning" size="small" sx={{ fontWeight: 700 }} />;
    }
    if (!user.isActive) {
      return <Chip label="Inactive" color="default" size="small" sx={{ fontWeight: 700 }} />;
    }
    return <Chip label="Active" color="success" size="small" sx={{ fontWeight: 700 }} />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: colors.brandRed }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(constants.routes.users)}
        sx={{
          mb: 3,
          color: colors.brandRed,
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: `${colors.brandRed}0D`,
          },
        }}
      >
        Back to Users
      </Button>

      {/* Flagged Banner */}
      {user.isFlagged && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: '12px' }}
          icon={<Flag fontSize="inherit" />}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Account Flagged
          </Typography>
          <Typography variant="caption">
            Reason: {user.flagReason || 'Suspicious Activity detected.'}
          </Typography>
        </Alert>
      )}

      {/* User Info Card - New Layout */}
      <Card sx={{ p: 4, mb: 3, borderRadius: '16px' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${colors.brandRed}4D`,
                mb: 2
              }}
            >
              <Person sx={{ fontSize: 60, color: colors.brandWhite }} />
            </Box>
            {getAccountStatusChip(user)}
            <Typography variant="caption" sx={{ color: colors.textSecondary, mt: 1 }}>ID: {user.id}</Typography>
          </Grid>
          <Grid item xs={12} md={9}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, borderBottom: `1px solid ${colors.divider}`, pb: 1 }}>
              Profile Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 0.5 }}>Full Name</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{user.fullName || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 0.5 }}>Username</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>@{user.username || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 0.5 }}>Email</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{user.email || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 0.5 }}>Country</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{user.country || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 0.5 }}>Registration Date</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user.createdAt ? format(user.createdAt, 'MMM dd, yyyy') : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 0.5 }}>Last Login</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user.lastLogin ? format(user.lastLogin, 'MMM dd, yyyy HH:mm') : 'Never'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>

      {/* Admin Notes */}
      <Card sx={{ p: 3, mb: 3, borderRadius: '16px', bgcolor: '#FFF8F6', border: `1px solid ${colors.brandRed}20` }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <AssignmentInd sx={{ color: colors.brandRed }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.brandRed }}>General Admin Notes</Typography>
        </Box>
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: colors.brandBlack }}>
          {user.adminNotes || 'No verification notes specific to this user.'}
        </Typography>
      </Card>

      {/* KYC Verification Section */}
      <Card sx={{ padding: 3, mb: 3, borderRadius: '16px', border: `1px solid ${colors.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <VerifiedUser sx={{ color: colors.brandRed, fontSize: 24 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>KYC Verification</Typography>
            </Box>
          </Box>
          <Chip
            label={kycData.status.replace('_', ' ').toUpperCase()}
            color={kycData.status === 'verified' ? 'success' : kycData.status === 'rejected' ? 'error' : 'default'}
            sx={{ fontWeight: 700 }}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={6} md={4}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Requested Date</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.kycRequestedAt ? format(user.kycRequestedAt, 'MMM dd, yyyy') : '-'}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Submitted At</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{kycData.submittedAt ? format(kycData.submittedAt, 'MMM dd, yyyy HH:mm') : '-'}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Verified / Rejected At</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{kycData.verifiedAt ? format(kycData.verifiedAt, 'MMM dd, yyyy HH:mm') : '-'}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Verified By</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{kycData.verifiedBy || '-'}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Risk Level</Typography>
                <Chip label={kycData.riskLevel.toUpperCase()} size="small" color={kycData.riskLevel === 'high' ? 'error' : 'default'} sx={{ height: 24, fontSize: 11, fontWeight: 700 }} />
              </Grid>
            </Grid>
            {/* Notes section kept same */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Internal Notes (Admin Only)</Typography>
                {!isEditingNotes ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setIsEditingNotes(true)}
                    startIcon={<Edit sx={{ fontSize: 14 }} />}
                    sx={{ height: 28, minWidth: 'auto', px: 2 }}
                  >
                    Edit
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        setNoteTemp(kycData.notes);
                        setIsEditingNotes(false);
                      }}
                      sx={{ height: 28, color: colors.textSecondary }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSaveNotes}
                      sx={{ height: 28 }}
                    >
                      Save
                    </Button>
                  </Box>
                )}
              </Box>

              {isEditingNotes ? (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={noteTemp}
                  onChange={(e) => setNoteTemp(e.target.value)}
                  placeholder="Enter internal notes, rejection reasons, or manual check details..."
                  sx={{
                    bgcolor: '#FFF',
                    '& .MuiOutlinedInput-root': {
                      fontSize: 14,
                    }
                  }}
                />
              ) : (
                <Typography variant="body2" sx={{
                  p: 1.5,
                  bgcolor: '#F9FAFB',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  minHeight: '60px',
                  color: kycData.notes ? colors.brandBlack : colors.textSecondary,
                  fontStyle: kycData.notes ? 'normal' : 'italic'
                }}>
                  {kycData.notes || 'No notes added.'}
                </Typography>
              )}
            </Box>
          </Grid>
          {/* Actions kept same */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Admin Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="outlined" startIcon={<AssignmentInd />} size="small" onClick={() => handleKycUpdate({ status: 'pending', submittedAt: new Date().toISOString() })}>
                Request KYC
              </Button>
              <Button variant="contained" color="success" startIcon={<CheckCircle />} size="small" onClick={() => handleKycUpdate({ status: 'verified', verifiedAt: new Date().toISOString(), verifiedBy: 'Admin' })}>
                Mark as Verified
              </Button>
              <Button variant="outlined" color="error" startIcon={<Gavel />} size="small" onClick={() => handleKycUpdate({ status: 'rejected', verifiedAt: new Date().toISOString(), verifiedBy: 'Admin' })}>
                Mark as Rejected
              </Button>
              <Button variant="text" color="warning" startIcon={<TimerOff />} size="small" onClick={() => handleKycUpdate({ status: 'expired' })}>
                Mark as Expired
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Points & Performance */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Points & Performance
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Total Referrals ADDED */}
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2,
              background: `linear-gradient(135deg, ${colors.brandRed}1A 0%, ${colors.brandRed}0D 100%)`,
              border: `1.5px solid ${colors.brandRed}33`,
              borderRadius: '16px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <AssignmentInd sx={{ fontSize: 24, color: colors.brandRed }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 12 }}>
                Total Referrals
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandRed }}>
              {user.totalReferrals || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2,
              background: `linear-gradient(135deg, ${colors.brandRed}1A 0%, ${colors.brandRed}0D 100%)`,
              border: `1.5px solid ${colors.brandRed}33`,
              borderRadius: '16px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <TrendingUp sx={{ fontSize: 24, color: colors.brandRed }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 12 }}>
                Total SP Earned
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandRed }}>
              {(user.spTotal || 0).toLocaleString()}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2,
              background: `linear-gradient(135deg, ${colors.brandRed}1A 0%, ${colors.brandRed}0D 100%)`,
              border: `1.5px solid ${colors.brandRed}33`,
              borderRadius: '16px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <TrendingUp sx={{ fontSize: 24, color: colors.brandRed }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 12 }}>
                Current SP Balance
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandRed }}>
              {(user.spCurrent || 0).toLocaleString()}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2,
              background: `linear-gradient(135deg, ${colors.info}1A 0%, ${colors.info}0D 100%)`,
              border: `1.5px solid ${colors.info}33`,
              borderRadius: '16px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <BarChart sx={{ fontSize: 24, color: colors.info }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 12 }}>
                Total CP Earned
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.info }}>
              {(user.cpTotal || 0).toLocaleString()}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2,
              background: `linear-gradient(135deg, ${colors.info}1A 0%, ${colors.info}0D 100%)`,
              border: `1.5px solid ${colors.info}33`,
              borderRadius: '16px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <BarChart sx={{ fontSize: 24, color: colors.info }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 12 }}>
                Current CP Balance
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.info }}>
              {(user.cpCurrent || 0).toLocaleString()}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2,
              background: `linear-gradient(135deg, ${colors.success}1A 0%, ${colors.success}0D 100%)`,
              border: `1.5px solid ${colors.success}33`,
              borderRadius: '16px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <BarChart sx={{ fontSize: 24, color: colors.success }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 12 }}>
                Total Predictions Made
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.success }}>
              {user.totalPredictions || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2,
              background: `linear-gradient(135deg, ${colors.success}1A 0%, ${colors.success}0D 100%)`,
              border: `1.5px solid ${colors.success}33`,
              borderRadius: '16px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <CheckCircle sx={{ fontSize: 24, color: colors.success }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 12 }}>
                Prediction Accuracy %
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.success }}>
              {(user.predictionAccuracy || 0).toFixed(1)}%
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2,
              background: `linear-gradient(135deg, ${colors.warning}1A 0%, ${colors.warning}0D 100%)`,
              border: `1.5px solid ${colors.warning}33`,
              borderRadius: '16px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <EmojiEvents sx={{ fontSize: 24, color: colors.warning }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 12 }}>
                Total Polls Participated
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.warning }}>
              {user.totalPolls || 0}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* SP / CP Breakdown */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        SP / CP Breakdown
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '16px',
              background: colors.brandWhite,
              border: `1.5px solid ${colors.brandRed}26`,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: colors.brandRed }}>
              SP Breakdown
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                  SP from Predictions
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack }}>
                  {(user.spFromPredictions || 0).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                  SP from Daily Login Bonus
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack }}>
                  {(user.spFromDailyLogin || 0).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '16px',
              background: colors.brandWhite,
              border: `1.5px solid ${colors.info}26`,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: colors.info }}>
              CP Breakdown
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                  CP from Referrals
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack }}>
                  {(user.cpFromReferrals || 0).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                  CP from Engagement
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack }}>
                  {(user.cpFromEngagement || 0).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Activity Log */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Activity Log
      </Typography>
      <Card sx={{ padding: 3, borderRadius: '16px' }}>
        <SearchBar
          value=""
          onChange={() => { }}
          placeholder="Search activities..."
          sx={{ mb: 2 }}
        />
        {activities.length === 0 ? (
          <Box sx={{ textAlign: 'center', padding: 4 }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              No activity logs available
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Activity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{format(new Date(activity.timestamp), 'MMM dd, yyyy • HH:mm')}</TableCell>
                    <TableCell>{activity.type}</TableCell>
                    <TableCell>{activity.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box >
  );
};

export default UserDetailsPage;
