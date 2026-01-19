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

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', id);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() });
        // Load activities would go here
        setActivities([]);
      }
    } catch (error) {
      console.error('Error loading user:', error);
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

  const getStatusChip = () => {
    if (user.fraudFlags && user.fraudFlags.length > 0) {
      return (
        <Chip
          icon={<Flag />}
          label="Flagged"
          sx={{
            backgroundColor: `${colors.error}1A`,
            color: colors.error,
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
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {user.username || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                  {user.email || 'No email'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {getStatusChip()}
                </Box>
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
                  Country
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.country || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Joined
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.createdAt
                    ? format(user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt), 'MMM dd, yyyy')
                    : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Last Login
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.lastLoginAt
                    ? format(user.lastLoginAt?.toDate ? user.lastLoginAt.toDate() : new Date(user.lastLoginAt), 'MMM dd, yyyy')
                    : 'Never'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>

      {/* Performance Summary */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Performance Summary
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: 'SP Total',
            value: (user.spTotal || 0).toLocaleString(),
            icon: TrendingUp,
            color: colors.brandRed,
          },
          {
            label: 'Total Predictions',
            value: user.totalPredictions || 0,
            icon: BarChart,
            color: colors.info,
          },
          {
            label: 'Correct Predictions',
            value: user.correctPredictions || 0,
            icon: CheckCircle,
            color: colors.success,
          },
          {
            label: 'Rank',
            value: user.rank || 'N/A',
            icon: EmojiEvents,
            color: colors.warning,
          },
        ].map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card
              sx={{
                padding: 2,
                background: `linear-gradient(135deg, ${stat.color}1A 0%, ${stat.color}0D 100%)`,
                border: `1.5px solid ${stat.color}33`,
                borderRadius: '16px',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                {React.createElement(stat.icon, {
                  sx: { fontSize: 24, color: stat.color },
                })}
                <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 12 }}>
                  {stat.label}
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                {stat.value}
              </Typography>
            </Card>
          </Grid>
        ))}
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
