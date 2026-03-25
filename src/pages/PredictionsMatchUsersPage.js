import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ArrowBack, Visibility, SportsSoccer, ListAlt } from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import UserTableIdentityCell from '../components/common/UserTableIdentityCell';
import { getFixtureUsers } from '../services/predictionsAdminAnalyticsService';

const statusChip = (s) => {
  const c = s === 'Perfect' ? 'success' : s === 'Lost' ? 'error' : s === 'Mixed' ? 'warning' : 'default';
  return <Chip size="small" label={s} color={c} sx={{ fontWeight: 700 }} />;
};

const PredictionsMatchUsersPage = () => {
  const { fixtureId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await getFixtureUsers(fixtureId);
      if (cancelled) return;
      if (r.success) setData(r.data);
      else setErr(r.error || 'Failed');
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [fixtureId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: colors.brandRed }} />
      </Box>
    );
  }
  if (err || !data) {
    return <Alert severity="error" sx={{ borderRadius: '12px' }}>{err || 'Not found'}</Alert>;
  }

  const { fixture, users } = data;
  const ms = String(fixture.matchStatus || fixture.status || '').toLowerCase();
  const statusLabel =
    ms === 'completed' ? 'FT' : ms === 'live' ? 'Live' : ms === 'halftime' ? 'HT' : 'NS';

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', pb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() =>
          fixture.cmdId
            ? navigate(`/predictions/cmd/${encodeURIComponent(fixture.cmdId)}/breakdown`)
            : navigate(constants.routes.predictions)
        }
        sx={{
          mb: 2,
          color: colors.brandRed,
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: '12px',
        }}
      >
        Back to CMD breakdown
      </Button>

      <Card
        sx={{
          mb: 3,
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: `0 6px 14px ${colors.shadow}`,
          border: `1.5px solid ${colors.brandRed}20`,
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 2.5 },
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box
            sx={{
              p: 1.25,
              borderRadius: '14px',
              backgroundColor: `${colors.brandWhite}33`,
            }}
          >
            <SportsSoccer sx={{ fontSize: 28, color: colors.brandWhite }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: colors.brandWhite }}>
              {fixture.matchName}
            </Typography>
            {fixture.cmdName && (
              <Typography variant="body2" sx={{ color: `${colors.brandWhite}E0`, mt: 0.5 }}>
                {fixture.cmdName}
              </Typography>
            )}
          </Box>
          <Chip
            label={statusLabel}
            sx={{
              fontWeight: 800,
              backgroundColor: `${colors.brandWhite}22`,
              color: colors.brandWhite,
              border: `1px solid ${colors.brandWhite}55`,
            }}
          />
        </Box>
      </Card>

      <Card
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: `1.5px solid ${colors.divider}26`,
          boxShadow: `0 4px 12px ${colors.shadow}14`,
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            borderBottom: `1px solid ${colors.divider}`,
          }}
        >
          <Box
            sx={{
              padding: 1.5,
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ListAlt sx={{ fontSize: 22, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Users who predicted
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {users.length} {users.length === 1 ? 'user' : 'users'}
            </Typography>
          </Box>
        </Box>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 0, boxShadow: 'none', overflowX: 'hidden', width: '100%' }}
        >
          <Table
            size="small"
            sx={{
              width: '100%',
              tableLayout: 'fixed',
              '& .MuiTableCell-root': { py: 1, px: 1 },
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: `${colors.backgroundLight}CC` }}>
                <TableCell align="left" sx={{ fontWeight: 700, width: '40%' }}>User</TableCell>
                <TableCell align="left" sx={{ fontWeight: 700, width: '12%' }}>
                  <Tooltip title="Submitted prediction slots" placement="top">
                    <span>Preds</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="left" sx={{ fontWeight: 700, width: '18%' }}>Status</TableCell>
                <TableCell align="left" sx={{ fontWeight: 700, width: '18%' }}>
                  <Tooltip title="Accuracy % and SP won" placement="top">
                    <span>Acc / SP</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="left" sx={{ fontWeight: 700, width: '12%' }}>
                  <Tooltip title="View prediction details" placement="top">
                    <span>View</span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    No predictions yet
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.predictionId} hover>
                    <TableCell
                      align="left"
                      sx={{ verticalAlign: 'top', borderBottom: `1px solid ${colors.divider}`, overflow: 'hidden' }}
                    >
                      <UserTableIdentityCell
                        fullName={u.fullName}
                        username={u.username}
                        email={u.email}
                        isVerified={u.isVerified}
                        compact
                      />
                    </TableCell>
                    <TableCell align="left" sx={{ verticalAlign: 'top', borderBottom: `1px solid ${colors.divider}` }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.totalPredictions}</Typography>
                    </TableCell>
                    <TableCell align="left" sx={{ verticalAlign: 'top', borderBottom: `1px solid ${colors.divider}` }}>
                      <Box sx={{ maxWidth: '100%', '& .MuiChip-root': { maxWidth: '100%' } }}>
                        {statusChip(u.status)}
                      </Box>
                    </TableCell>
                    <TableCell align="left" sx={{ verticalAlign: 'top', borderBottom: `1px solid ${colors.divider}` }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {u.predictionAccuracy != null ? `${u.predictionAccuracy}%` : '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                        {u.totalSPWon} SP
                      </Typography>
                    </TableCell>
                    <TableCell align="left" sx={{ verticalAlign: 'top', borderBottom: `1px solid ${colors.divider}` }}>
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(`/predictions/details/${encodeURIComponent(u.predictionId)}`, {
                              state: { fromFixtureId: fixtureId },
                            })
                          }
                          sx={{ color: colors.brandRed }}
                          aria-label="View prediction details"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default PredictionsMatchUsersPage;
