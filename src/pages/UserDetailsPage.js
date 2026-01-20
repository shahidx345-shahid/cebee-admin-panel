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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';

const UserDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadUserData();
  }, [id]);

  const generateDummyUserData = (userId) => {
    const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Brazil', 'India', 'Nigeria', 'South Africa', 'Kenya', 'Ghana'];
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
      fraudFlags: [],
      spTotal: 2450,
      spCurrent: 1200,
      cpTotal: 350,
      cpCurrent: 150,
      totalPredictions: 45,
      predictionAccuracy: 68.5,
      totalPolls: 12,
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      spFromPredictions: 1800,
      spFromDailyLogin: 650,
      cpFromReferrals: 200,
      cpFromEngagement: 150,
    };
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      let userData = null;
      
      // Try to load from Firebase
      try {
      const userRef = doc(db, 'users', id);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
          userData = { id: userDoc.id, ...userDoc.data() };
        }
      } catch (error) {
        console.log('Using dummy data:', error);
      }
      
      // Use dummy data if no real data exists
      if (!userData) {
        userData = generateDummyUserData(id);
      }
      
      setUser(userData);
      setActivities([]);
    } catch (error) {
      console.error('Error loading user:', error);
      // Fallback to dummy data
      const dummyData = generateDummyUserData(id);
      setUser(dummyData);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: colors.brandRed }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', padding: 6 }}>
        <Typography variant="h6" sx={{ color: colors.error, mb: 2 }}>
          User not found
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(constants.routes.users)}
          sx={{
            background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  const getAccountStatusChip = () => {
    if (user.isBlocked) {
      return (
        <Chip
          icon={<Cancel />}
          label="Blocked"
          sx={{
            backgroundColor: `${colors.error}1A`,
            color: colors.error,
            fontWeight: 600,
          }}
        />
      );
    }
    if (user.isDeleted || user.isDeactivated) {
      return (
        <Chip
          icon={<Cancel />}
          label="Deactivated"
          sx={{
            backgroundColor: `${colors.textSecondary}1A`,
            color: colors.textSecondary,
            fontWeight: 600,
          }}
        />
      );
    }
    if (user.fraudFlags && user.fraudFlags.length > 0) {
      return (
        <Chip
          icon={<Flag />}
          label="Flagged"
          sx={{
            backgroundColor: `${colors.warning}1A`,
            color: colors.warning,
            fontWeight: 600,
          }}
        />
      );
    }
    if (user.status === 'suspended') {
      return (
        <Chip
          icon={<Cancel />}
          label="Suspended"
          sx={{
            backgroundColor: `${colors.warning}1A`,
            color: colors.warning,
            fontWeight: 600,
          }}
        />
      );
    }
    if (user.isActive) {
      return (
        <Chip
          icon={<CheckCircle />}
          label="Active"
          sx={{
            backgroundColor: `${colors.success}1A`,
            color: colors.success,
            fontWeight: 600,
          }}
        />
      );
    }
    return (
      <Chip
        icon={<Cancel />}
        label="Inactive"
        sx={{
          backgroundColor: `${colors.textSecondary}1A`,
          color: colors.textSecondary,
          fontWeight: 600,
        }}
      />
    );
  };

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

      {/* Read Only Notice */}
      <Alert
        severity="info"
        sx={{ mb: 3, borderRadius: '12px' }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Read-Only Mode
        </Typography>
        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
          User profile and activity logs are view-only. No modifications to SP, rankings, or predictions allowed.
        </Typography>
      </Alert>

      {/* User Info Card */}
      <Card sx={{ padding: 3, mb: 3, borderRadius: '16px' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box
              sx={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${colors.brandRed}4D`,
              }}
            >
              <Person sx={{ fontSize: 64, color: colors.brandWhite }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                  @{user.username || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                  {user.email || 'No email'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {user.country || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  User ID
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.id}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Account Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {getAccountStatusChip()}
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Registration Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.createdAt
                    ? format(user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt), 'MMM dd, yyyy')
                    : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Last Login Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.lastLogin
                    ? format(user.lastLogin?.toDate ? user.lastLogin.toDate() : new Date(user.lastLogin), 'MMM dd, yyyy HH:mm')
                    : user.lastLoginAt
                    ? format(user.lastLoginAt?.toDate ? user.lastLoginAt.toDate() : new Date(user.lastLoginAt), 'MMM dd, yyyy HH:mm')
                    : 'Never'}
                </Typography>
              </Grid>
              {user.fraudFlags && user.fraudFlags.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: colors.textSecondary, mb: 0.5, display: 'block' }}>
                    Flags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {user.fraudFlags.map((flag, index) => (
                      <Chip
                        key={index}
                        icon={<Flag />}
                        label={flag}
                        size="small"
                        sx={{
                          backgroundColor: `${colors.error}1A`,
                          color: colors.error,
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Card>

      {/* Points & Performance */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Points & Performance
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
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
          onChange={() => {}}
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
    </Box>
  );
};

export default UserDetailsPage;
