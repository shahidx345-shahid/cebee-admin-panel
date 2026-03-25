import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  Grid,
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
import { format } from 'date-fns';
import { colors, constants } from '../config/theme';
import UserTableIdentityCell from '../components/common/UserTableIdentityCell';
import { getFixtureUsers } from '../services/predictionsAdminAnalyticsService';

const CENTER_LOGO = 72;

function stripApiLeagueSuffix(name) {
  if (name == null || typeof name !== 'string') return name;
  const s = name.replace(/\s*\(API\s+\d+\)\s*/gi, '').trim();
  return s || name;
}

function matchMetaRoundLabel(fx) {
  if (fx.round != null && String(fx.round).trim()) return String(fx.round).trim();
  if (fx.matchday != null && String(fx.matchday).trim() !== '') return `Matchday ${fx.matchday}`;
  return '';
}

function breakdownStatusLabel(matchStatus, status) {
  const s = String(matchStatus || status || '').toLowerCase();
  if (s === 'completed') return 'FT';
  if (s === 'live') return 'Live';
  if (s === 'halftime') return 'HT';
  return 'NS';
}

function statusChipSx(label) {
  if (label === 'FT') return { backgroundColor: '#E8F5E9', color: '#2E7D32' };
  if (label === 'Live' || label === 'HT') return { backgroundColor: `${colors.brandRed}14`, color: colors.brandRed };
  return { backgroundColor: '#F5F5F5', color: colors.textSecondary };
}

const TeamLogo = ({ url, size = CENTER_LOGO }) => {
  const inner = Math.max(16, size - 14);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: '#fff',
        border: '2px solid #E8E8E8',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
        mx: 'auto',
      }}
    >
      {url ? (
        <Box component="img" src={url} alt="" sx={{ width: inner, height: inner, objectFit: 'contain', display: 'block' }} />
      ) : (
        <SportsSoccer sx={{ fontSize: Math.round(size * 0.42), color: '#BDBDBD' }} />
      )}
    </Box>
  );
};

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
  const statusLabel = breakdownStatusLabel(fixture.matchStatus, fixture.status);
  const kickoffDate = fixture.kickoffTime ? new Date(fixture.kickoffTime) : null;
  const kickoffStr =
    kickoffDate && !Number.isNaN(kickoffDate.getTime()) ? format(kickoffDate, 'EEE d MMM • HH:mm') : '—';
  const leagueLine = fixture.league ? stripApiLeagueSuffix(fixture.league) : '';
  const roundLine = matchMetaRoundLabel(fixture);
  const mid =
    fixture.homeScore != null && fixture.awayScore != null
      ? `${fixture.homeScore} – ${fixture.awayScore}`
      : 'vs';

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
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: `1px solid ${colors.divider}`,
          bgcolor: '#fff',
        }}
      >
        <Box sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: `1px solid ${colors.divider}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  color: colors.brandBlack,
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  lineHeight: 1.35,
                }}
              >
                {kickoffStr}
                {leagueLine ? ` · ${leagueLine}` : ''}
                {roundLine ? ` · ${roundLine}` : ''}
              </Typography>
              {fixture.cmdName ? (
                <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600, mt: 0.5, fontSize: 13 }}>
                  {fixture.cmdName}
                </Typography>
              ) : null}
            </Box>
            <Chip
              label={statusLabel}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: 13,
                height: 30,
                px: 0.75,
                flexShrink: 0,
                ...statusChipSx(statusLabel),
              }}
            />
          </Box>
        </Box>
        <Grid container alignItems="center" justifyContent="center" spacing={{ xs: 2, sm: 3 }} sx={{ px: 2.5, py: 2.5 }}>
          <Grid item xs={5} sm={4} sx={{ textAlign: 'center' }}>
            <Box sx={{ py: 0.5 }}>
              <TeamLogo url={fixture.homeTeamLogo} />
              <Typography
                sx={{
                  fontWeight: 800,
                  color: colors.brandBlack,
                  mt: 1.25,
                  px: { xs: 0.5, sm: 1 },
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                }}
              >
                {fixture.homeTeam || 'TBD'}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mt: 0.35, fontSize: 11, fontWeight: 600 }}>
                Home
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={2} sm={4} sx={{ textAlign: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: colors.brandBlack,
                letterSpacing: '-0.03em',
                fontSize: { xs: '1.5rem', sm: '1.85rem' },
                lineHeight: 1.1,
              }}
            >
              {mid}
            </Typography>
          </Grid>
          <Grid item xs={5} sm={4} sx={{ textAlign: 'center' }}>
            <Box sx={{ py: 0.5 }}>
              <TeamLogo url={fixture.awayTeamLogo} />
              <Typography
                sx={{
                  fontWeight: 800,
                  color: colors.brandBlack,
                  mt: 1.25,
                  px: { xs: 0.5, sm: 1 },
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                }}
              >
                {fixture.awayTeam || 'TBD'}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mt: 0.35, fontSize: 11, fontWeight: 600 }}>
                Away
              </Typography>
            </Box>
          </Grid>
        </Grid>
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
                <TableCell align="left" sx={{ fontWeight: 700, width: '36%' }}>User</TableCell>
                <TableCell align="left" sx={{ fontWeight: 700, width: '10%' }}>
                  <Tooltip title="Submitted prediction slots" placement="top">
                    <span>Preds</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="left" sx={{ fontWeight: 700, width: '14%' }}>Status</TableCell>
                <TableCell align="left" sx={{ fontWeight: 700, width: '12%' }}>
                  <Tooltip title="Prediction accuracy %" placement="top">
                    <span>Acc (%)</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="left" sx={{ fontWeight: 700, width: '12%' }}>
                  <Tooltip title="SP won on this match" placement="top">
                    <span>SP</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="left" sx={{ fontWeight: 700, width: '10%' }}>
                  <Tooltip title="View prediction details" placement="top">
                    <span>View</span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {u.predictionAccuracy != null ? `${u.predictionAccuracy}%` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="left" sx={{ verticalAlign: 'top', borderBottom: `1px solid ${colors.divider}` }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.totalSPWon}</Typography>
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
