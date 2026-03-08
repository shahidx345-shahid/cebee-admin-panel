/**
 * Team Page – Data Browser. Team info (logo, name, league, country) + squad with photo, name, shirt #, position, nationality, status + pagination.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TablePagination,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import NavigateNext from '@mui/icons-material/NavigateNext';
import Sync from '@mui/icons-material/Sync';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import Groups from '@mui/icons-material/Groups';
import Person from '@mui/icons-material/Person';
import { getTeam } from '../services/teamsService';
import { getApiPlayers, syncPlayersFromApi } from '../services/apiSyncService';
import { colors } from '../config/theme';
import { constants } from '../config/theme';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const POSITION_ORDER = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Attacker'];
function groupPlayersByPosition(players) {
  const byPos = new Map();
  for (const p of players) {
    const pos = (p.position || '').trim() || 'Other';
    if (!byPos.has(pos)) byPos.set(pos, []);
    byPos.get(pos).push(p);
  }
  const ordered = [];
  for (const pos of POSITION_ORDER) {
    if (byPos.has(pos)) {
      ordered.push({ position: pos, players: byPos.get(pos) });
      byPos.delete(pos);
    }
  }
  byPos.forEach((pls, pos) => ordered.push({ position: pos, players: pls }));
  return ordered;
}

export default function DataBrowserTeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [playersLoading, setPlayersLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Data flow: On load → from DB only. On Sync Players → API → save to DB → refetch from DB → display.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTeam(id)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          const t = res.data?.team ?? res.data;
          setTeam(t);
        } else {
          setError(res.error || 'Team not found');
        }
      })
      .catch((e) => { if (!cancelled) setError(e.message || 'Failed to load team'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const loadPlayers = (pageNum = page + 1, limitNum = rowsPerPage) => {
    if (!id) return;
    setPlayersLoading(true);
    getApiPlayers(id, { page: pageNum, limit: limitNum })
      .then((res) => {
        if (res.success && res.data) {
          setPlayers(Array.isArray(res.data.players) ? res.data.players : []);
          setPagination(res.data.pagination || { page: 1, limit: limitNum, total: 0, pages: 0 });
        } else {
          setPlayers([]);
        }
      })
      .finally(() => setPlayersLoading(false));
  };

  useEffect(() => {
    if (!id) return;
    loadPlayers(page + 1, rowsPerPage);
  }, [id, page, rowsPerPage]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleSyncPlayers = async () => {
    const teamId = team?.apiTeamId ?? team?.team_id ?? id;
    if (teamId == null) {
      setError('Team has no API id; cannot sync players.');
      return;
    }
    setSyncing(true);
    setMessage(null);
    setError(null);
    const res = await syncPlayersFromApi(teamId);
    setSyncing(false);
    if (res.success) {
      setMessage(res.message || 'Syncing from API and saving to DB. Refreshing squad…');
      loadPlayers(1, rowsPerPage);
      setPage(0);
    } else setError(res.error);
  };

  const handleBack = () => {
    const { leagueId, fixtureId, tab } = location.state || {};
    if (fixtureId != null && leagueId != null) {
      navigate(`${constants.routes.apiSync}/league/${leagueId}/fixture/${fixtureId}`);
    } else if (leagueId != null) {
      navigate(`${constants.routes.apiSync}/league/${leagueId}${tab ? `?tab=${tab}` : ''}`);
    } else {
      navigate(-1);
    }
  };

  if (loading && !team) {
    return (
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        {error ? <Alert severity="error">{error}</Alert> : <CircularProgress />}
      </Box>
    );
  }

  if (error && !team) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} startIcon={<ArrowBack />} onClick={handleBack}>Back</Button>
      </Box>
    );
  }

  const teamName = team?.team_name ?? team?.name ?? '—';
  const leagueNameRaw = team?.league?.name_display ?? team?.league?.league_name ?? team?.league_name ?? '—';
  // Strip "(API 253)" or similar from league name so we show e.g. "MLS" only
  const leagueName = typeof leagueNameRaw === 'string' ? leagueNameRaw.replace(/\s*\(API\s+\d+\)\s*/gi, '').trim() || leagueNameRaw : leagueNameRaw;
  const country = team?.country ?? team?.league?.country ?? '—';

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Button startIcon={<ArrowBack />} onClick={handleBack} size="small" sx={{ mb: 2 }}>
        Back
      </Button>
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" sx={{ color: 'text.secondary' }} />}
        sx={{ mb: 2.5, '& .MuiBreadcrumbs-li': { display: 'flex', alignItems: 'center' } }}
      >
        <Link
          component="button"
          variant="body2"
          onClick={handleBack}
          sx={{ color: colors.brandRed, cursor: 'pointer', textDecoration: 'none', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
        >
          API Data & Sync
        </Link>
        <Typography variant="body2" color="text.primary" fontWeight={500}>
          {teamName}
        </Typography>
      </Breadcrumbs>

      {message && (
        <Alert severity="success" onClose={() => setMessage(null)} sx={{ mb: 2, borderRadius: 2 }}>{message}</Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
      )}

      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${colors.divider}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${colors.divider}`,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {team?.logo ? (
              <Box component="img" src={team.logo} alt="" sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5 }} />
            ) : (
              <Groups sx={{ fontSize: 40, color: 'text.secondary' }} />
            )}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>{teamName}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
              League: {leagueName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Country: {country}
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          border: `1px solid ${colors.divider}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            p: 2,
            bgcolor: 'grey.50',
            borderBottom: `1px solid ${colors.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
              Squad
            </Typography>
            {pagination.total != null && pagination.total > 0 && (
              <Typography variant="body2" color="text.secondary">
                {pagination.total} player{pagination.total !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            size="medium"
            startIcon={syncing ? <CircularProgress size={18} color="inherit" /> : <Sync />}
            onClick={handleSyncPlayers}
            disabled={syncing || (team?.apiTeamId == null && team?.team_id == null)}
            sx={{
              bgcolor: colors.brandRed,
              '&:hover': { filter: 'brightness(0.92)' },
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
            }}
          >
            {syncing ? 'Syncing…' : 'Sync Players'}
          </Button>
        </Box>

        {playersLoading ? (
          <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={40} sx={{ color: colors.brandRed }} />
            <Typography variant="body2" color="text.secondary">Loading squad…</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="medium" sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: `${colors.brandRed}12` }}>
                    <TableCell sx={{ fontWeight: 600, width: 72, py: 1.5, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 88, py: 1.5, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Photo</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 56, py: 1.5, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Age</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 72, py: 1.5, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Shirt #</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Position</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.8125rem', whiteSpace: 'nowrap' }} title="Football API squad endpoint does not return nationality; shows — when missing">Nationality</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 100, py: 1.5, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {players.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                          <Groups sx={{ fontSize: 48, color: 'text.disabled' }} />
                          <Typography variant="body2" color="text.secondary">
                            No players in squad yet.
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Click &quot;Sync Players&quot; to fetch from the Football API.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    groupPlayersByPosition(players).map(({ position, players: groupPlayers }) => (
                      <React.Fragment key={position}>
                        <TableRow sx={{ bgcolor: 'grey.100', borderBottom: `2px solid ${colors.divider}` }}>
                          <TableCell colSpan={8} sx={{ py: 1.5, fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>
                            {position}
                          </TableCell>
                        </TableRow>
                        {groupPlayers.map((p, idx) => (
                          <TableRow
                            key={p._id ?? p.id ?? p.name ?? `${position}-${idx}`}
                            sx={{
                              '&:hover': { bgcolor: 'action.hover' },
                              '&:nth-of-type(even)': { bgcolor: 'grey.50' },
                              '&:nth-of-type(even):hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            <TableCell sx={{ py: 1.5, fontFamily: 'monospace', fontSize: '0.8125rem', color: 'text.secondary' }}>{p.id ?? p.apiPlayerId ?? '—'}</TableCell>
                            <TableCell sx={{ py: 1.5 }}>
                              <Box sx={{ position: 'relative', width: 52, height: 52 }}>
                                <Box
                                  sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: '50%',
                                    bgcolor: 'action.hover',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    display: 'flex',
                                  }}
                                >
                                  <Person sx={{ color: 'text.secondary', fontSize: 28 }} />
                                </Box>
                                {p.photo && (
                                  <Box
                                    component="img"
                                    src={p.photo}
                                    alt=""
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: 52,
                                      height: 52,
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                    }}
                                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500, py: 1.5 }}>{p.name ?? p.player_name ?? '—'}</TableCell>
                            <TableCell sx={{ py: 1.5 }}>{p.age != null ? p.age : '—'}</TableCell>
                            <TableCell sx={{ py: 1.5 }}>{p.number ?? p.shirt_number ?? '—'}</TableCell>
                            <TableCell sx={{ py: 1.5, color: 'text.secondary' }}>{p.position ?? '—'}</TableCell>
                            <TableCell sx={{ py: 1.5 }}>{p.nationality ?? '—'}</TableCell>
                            <TableCell sx={{ py: 1.5 }}>
                              <Typography
                                component="span"
                                variant="caption"
                                sx={{
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  bgcolor: p.status === 'active' ? 'rgba(76, 175, 80, 0.12)' : 'action.hover',
                                  color: p.status === 'active' ? '#2e7d32' : 'text.secondary',
                                  fontWeight: 500,
                                }}
                              >
                                {p.status ?? '—'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={pagination.total ?? 0}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage="Rows per page:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`}
              sx={{
                borderTop: `1px solid ${colors.divider}`,
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '0.875rem' },
              }}
            />
          </>
        )}
      </Card>
    </Box>
  );
}
