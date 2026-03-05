import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Stack,
  Breadcrumbs,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from '@mui/material';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import Groups from '@mui/icons-material/Groups';
import Person from '@mui/icons-material/Person';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import Event from '@mui/icons-material/Event';
import NavigateNext from '@mui/icons-material/NavigateNext';
import MoreVert from '@mui/icons-material/MoreVert';
import People from '@mui/icons-material/People';
import {
  getApiLeagues,
  getApiTeams,
  getApiPlayers,
  getApiStandings,
  getApiFixtures,
  syncLeaguesFromApi,
  setLeagueUse,
  syncTeamsFromApi,
  syncPlayersFromApi,
} from '../services/apiSyncService';
import { colors } from '../config/theme';

const VIEW_LEAGUES = 'leagues';
const VIEW_TEAMS = 'teams';
const VIEW_PLAYERS = 'players';
const VIEW_STANDINGS = 'standings';
const VIEW_FIXTURES = 'fixtures';
const currentYear = new Date().getFullYear();

/** Coerce any value to a string so React never receives an object as a child (avoids "Objects are not valid as a React child"). */
function toCellValue(v) {
  if (v == null) return '-';
  if (typeof v === 'string' || typeof v === 'number') return v;
  if (typeof v === 'object' && v !== null && 'name' in v) return toCellValue(v.name);
  return String(v);
}

/** Ensure value is safe to render as React child (string or number). Use for message, error, labels. */
function safeStr(v) {
  if (v == null || v === '') return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (typeof v === 'object' && v !== null && 'message' in v) return safeStr(v.message);
  if (typeof v === 'object' && v !== null && 'name' in v) return safeStr(v.name);
  return String(v);
}

const ApiSyncPage = () => {
  const [view, setView] = useState(VIEW_LEAGUES);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [standings, setStandings] = useState([]);
  const [fixtures, setFixtures] = useState([]);

  const [leagueId, setLeagueId] = useState('');
  const [season, setSeason] = useState(String(currentYear));
  const [teamId, setTeamId] = useState('');
  const [selectedLeagueName, setSelectedLeagueName] = useState('');
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [fixtureDate, setFixtureDate] = useState('');
  const [fixtureStatus, setFixtureStatus] = useState('');
  const [syncingLeagues, setSyncingLeagues] = useState(false);
  const [leaguesPage, setLeaguesPage] = useState(0);
  const [leaguesRowsPerPage, setLeaguesRowsPerPage] = useState(50);
  const [leagueMenuAnchor, setLeagueMenuAnchor] = useState(null);
  const [selectedLeagueRow, setSelectedLeagueRow] = useState(null);
  const [teamMenuAnchor, setTeamMenuAnchor] = useState(null);
  const [selectedTeamRow, setSelectedTeamRow] = useState(null);
  const [searchLeagues, setSearchLeagues] = useState('');
  const [searchTeams, setSearchTeams] = useState('');
  const [searchPlayers, setSearchPlayers] = useState('');
  const [teamsPage, setTeamsPage] = useState(0);
  const [teamsRowsPerPage, setTeamsRowsPerPage] = useState(50);

  const clearMsg = () => {
    setMessage(null);
    setError(null);
  };

  // On mount: load all leagues from DB (auto-load when you open the page).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getApiLeagues()
      .then((res) => {
        if (!cancelled && res.success && Array.isArray(res.data)) {
          setLeagues(res.data);
          setLeaguesPage(0);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Keep page in range when leagues length or rowsPerPage changes
  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(leagues.length / leaguesRowsPerPage) - 1);
    if (leaguesPage > maxPage) setLeaguesPage(maxPage);
  }, [leagues.length, leaguesRowsPerPage, leaguesPage]);

  // Keep teams page in range when teams length or rowsPerPage changes
  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(teams.length / teamsRowsPerPage) - 1);
    if (teamsPage > maxPage) setTeamsPage(maxPage);
  }, [teams.length, teamsRowsPerPage, teamsPage]);

  const loadLeagues = async () => {
    setLoading(true);
    clearMsg();
    const res = await getApiLeagues();
    setLoading(false);
    if (res.success) setLeagues(res.data || []);
    else setError(safeStr(res.error) || 'Failed to load leagues');
  };

  const loadTeams = async (leagueIdParam, seasonParam) => {
    const lid = (leagueIdParam != null && leagueIdParam !== '') ? String(leagueIdParam) : leagueId;
    const s = (seasonParam != null && seasonParam !== '') ? String(seasonParam) : season;
    if (!lid.trim() || !s.trim()) {
      setError('League ID and Season are required');
      return;
    }
    setLoading(true);
    clearMsg();
    const res = await getApiTeams(lid.trim(), s.trim());
    setLoading(false);
    if (res.success) {
      setTeams(res.data || []);
      setTeamsPage(0);
    } else setError(safeStr(res.error) || 'Failed to load teams');
  };

  const loadPlayers = async (teamIdParam) => {
    const tid = (teamIdParam != null && teamIdParam !== '') ? String(teamIdParam) : teamId;
    if (!tid.trim()) {
      setError('API Team ID is required');
      return;
    }
    setLoading(true);
    clearMsg();
    const res = await getApiPlayers(tid.trim());
    setLoading(false);
    if (res.success) {
      const list = res.data || [];
      setPlayers(Array.isArray(list) ? list : []);
    } else {
      setError(safeStr(res.error) || 'Failed to load players');
    }
  };

  const loadStandings = async () => {
    if (!leagueId.trim() || !season.trim()) {
      setError('League ID and Season are required');
      return;
    }
    setLoading(true);
    clearMsg();
    const res = await getApiStandings(leagueId.trim(), season.trim());
    setLoading(false);
    if (res.success) {
      const raw = res.data ?? [];
      const list = Array.isArray(raw) ? raw : (raw?.standings ? raw.standings : []);
      const firstLeague = list[0];
      const group0 = firstLeague?.league?.standings?.[0] ?? firstLeague?.standings?.[0] ?? firstLeague?.standings;
      const table = Array.isArray(group0) ? group0 : (Array.isArray(list) ? list : []);
      setStandings(table);
    } else {
      setError(safeStr(res.error) || 'Failed to load standings');
    }
  };

  const loadFixtures = async (fromApi = false) => {
    if (!leagueId.trim() || !season.trim()) {
      setError('League ID and Season are required');
      return;
    }
    setLoading(true);
    clearMsg();
    const res = await getApiFixtures({
      league: leagueId.trim(),
      season: season.trim(),
      date: fixtureDate.trim() || undefined,
      status: fixtureStatus.trim() || undefined,
      source: fromApi ? 'api' : undefined,
    });
    setLoading(false);
    if (res.success) setFixtures(res.data || []);
    else setError(safeStr(res.error) || 'Failed to load fixtures');
  };

  const renderTable = (rows, columns, options = {}) => {
    const { onRowClick, getRowId, selectedId, clickable, maxHeight = 440 } = options;
    return (
      <TableContainer
        component={Paper}
        sx={{
          maxHeight,
          overflow: 'auto',
          overflowX: 'auto',
          overscrollBehavior: 'contain',
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} sx={col.minWidth ? { minWidth: col.minWidth } : undefined}>{col.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!rows || rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No data. Use the filters above and click Load.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => {
                const id = getRowId ? getRowId(row) : row.id ?? row.league?.id ?? i;
                const selected = selectedId != null && String(id) === String(selectedId);
                return (
                  <TableRow
                    key={getRowId ? String(id) : i}
                    hover={clickable}
                    onClick={clickable && onRowClick ? () => onRowClick(row) : undefined}
                    sx={{
                      cursor: clickable && onRowClick ? 'pointer' : 'default',
                      bgcolor: selected ? `${colors.brandRed}18` : undefined,
                      '&:hover': clickable && onRowClick ? { bgcolor: `${colors.brandRed}0D` } : undefined,
                    }}
                  >
                    {columns.map((col) => {
                      const cellContent = col.render ? col.render(row) : (row[col.key] ?? '-');
                      return (
                        <TableCell key={col.key} sx={col.minWidth ? { minWidth: col.minWidth } : undefined}>
                          {React.isValidElement(cellContent) ? cellContent : toCellValue(cellContent)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const playersRows = Array.isArray(players)
    ? players.flatMap((p) => (p && Array.isArray(p.players) ? p.players : p && p.name ? [p] : []))
    : [];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>API Data & Sync Center</Typography>

      {safeStr(message) && (
        <Alert severity="success" onClose={clearMsg} sx={{ mb: 2 }}>
          {safeStr(message)}
        </Alert>
      )}
      {safeStr(error) && (
        <Alert severity="error" onClose={clearMsg} sx={{ mb: 2 }}>
          {safeStr(error)}
        </Alert>
      )}

      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 140px)',
          minHeight: 520,
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            p: 2.5,
          }}
        >
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              flexShrink: 0,
              p: 0.5,
              borderRadius: 2,
              bgcolor: 'action.hover',
              width: 'fit-content',
              mb: 2,
            }}
          >
            <Button size="small" variant={view === VIEW_LEAGUES ? 'contained' : 'text'} startIcon={<SportsSoccer />} onClick={() => setView(VIEW_LEAGUES)} sx={{ minWidth: 'auto', borderRadius: 1.5, px: 1.5 }}>Leagues</Button>
            <Button size="small" variant={view === VIEW_TEAMS ? 'contained' : 'text'} startIcon={<Groups />} onClick={() => setView(VIEW_TEAMS)} sx={{ minWidth: 'auto', borderRadius: 1.5, px: 1.5 }}>Teams</Button>
            <Button size="small" variant={view === VIEW_PLAYERS ? 'contained' : 'text'} startIcon={<Person />} onClick={() => setView(VIEW_PLAYERS)} sx={{ minWidth: 'auto', borderRadius: 1.5, px: 1.5 }}>Players</Button>
            <Button size="small" variant={view === VIEW_STANDINGS ? 'contained' : 'text'} startIcon={<EmojiEvents />} onClick={() => setView(VIEW_STANDINGS)} sx={{ minWidth: 'auto', borderRadius: 1.5, px: 1.5 }}>Standings</Button>
            <Button size="small" variant={view === VIEW_FIXTURES ? 'contained' : 'text'} startIcon={<Event />} onClick={() => setView(VIEW_FIXTURES)} sx={{ minWidth: 'auto', borderRadius: 1.5, px: 1.5 }}>Fixtures</Button>
          </Stack>
          {view === VIEW_LEAGUES && (
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexShrink: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>Leagues</Typography>
                <Chip label="⋮ on a row → View Teams" size="small" sx={{ fontWeight: 500, bgcolor: 'action.selected', color: 'text.secondary' }} />
              </Box>
              {leagues.length === 0 && !loading && (
                <Alert severity="info" sx={{ mb: 2, flexShrink: 0 }}>No leagues yet. Use &quot;Sync from API&quot; to fetch and save (30–60 s).</Alert>
              )}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  mb: 2,
                  flexShrink: 0,
                  p: 1.5,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'grey.50',
                }}
              >
                <TextField
                  size="small"
                  placeholder="Search by name or ID..."
                  value={searchLeagues}
                  onChange={(e) => setSearchLeagues(e.target.value)}
                  sx={{ minWidth: 240, bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  inputProps={{ 'aria-label': 'Search leagues by name or ID' }}
                />
                <Button
                  variant="outlined"
                  disabled={syncingLeagues || loading}
                  onClick={async () => {
                    clearMsg();
                    setSyncingLeagues(true);
                    try {
                      const res = await syncLeaguesFromApi();
                      if (res.success) {
                        setMessage(safeStr(res.message) || 'Sync completed.');
                        setLoading(true);
                        const loadRes = await getApiLeagues();
                        if (loadRes.success && Array.isArray(loadRes.data)) {
                          setLeagues(loadRes.data);
                          setLeaguesPage(0);
                        }
                        setLoading(false);
                      } else {
                        setError(safeStr(res.error) || 'Sync failed');
                      }
                    } finally {
                      setSyncingLeagues(false);
                    }
                  }}
                  sx={{ borderRadius: 1, borderColor: colors.brandRed, color: colors.brandRed, '&:hover': { borderColor: colors.brandDarkRed || '#a00', bgcolor: `${colors.brandRed}08` } }}
                >
                  {syncingLeagues ? <CircularProgress size={20} color="inherit" /> : 'Sync from API'}
                </Button>
                {!loading && leagues.length > 0 && !searchLeagues.trim() && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {leagues.length.toLocaleString()} leagues · scroll and paginate below
                  </Typography>
                )}
                {searchLeagues.trim() && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {(() => {
                      const q = searchLeagues.trim().toLowerCase();
                      const filtered = leagues.filter((row) => {
                        const id = String(row.apiLeagueId ?? row.league?.id ?? row.id ?? row._id ?? '');
                        const name = String(row.league_name ?? row.league?.name ?? row.name ?? '');
                        const code = String(row.league_code ?? row.league?.code ?? row.code ?? '');
                        const country = String(row.country ?? row.league?.country ?? '');
                        return id.toLowerCase().includes(q) || name.toLowerCase().includes(q) || code.toLowerCase().includes(q) || country.toLowerCase().includes(q);
                      });
                      return filtered.length;
                    })()} matches (no pagination)
                  </Typography>
                )}
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', overflowX: 'auto', maxWidth: '100%' }}>
                {(() => {
                  const q = searchLeagues.trim().toLowerCase();
                  const leaguesFiltered = q
                    ? leagues.filter((row) => {
                        const id = String(row.apiLeagueId ?? row.league?.id ?? row.id ?? row._id ?? '');
                        const name = String(row.league_name ?? row.league?.name ?? row.name ?? '');
                        const code = String(row.league_code ?? row.league?.code ?? row.code ?? '');
                        const country = String(row.country ?? row.league?.country ?? '');
                        return id.toLowerCase().includes(q) || name.toLowerCase().includes(q) || code.toLowerCase().includes(q) || country.toLowerCase().includes(q);
                      })
                    : leagues;
                  const page = leaguesPage;
                  const rowsPerPage = leaguesRowsPerPage;
                  const usePagination = !q;
                  const start = usePagination ? page * rowsPerPage : 0;
                  const end = usePagination ? start + rowsPerPage : leaguesFiltered.length;
                  const leaguesPaginated = leaguesFiltered.slice(start, end);
                  return (
                    <TableContainer component={Paper} sx={{ overflowX: 'auto', overflowY: 'visible', maxWidth: '100%', display: 'block', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                      <Table size="small" sx={{ minWidth: 800 }}>
                        <TableHead>
                          <TableRow>
                            {[
                              { key: 'logo', label: 'Logo', width: 56 },
                              { key: 'id', label: 'ID', width: 100 },
                              { key: 'name', label: 'League', width: 220 },
                              { key: 'code', label: 'Code', width: 70 },
                              { key: 'country', label: 'Country', width: 100 },
                              { key: 'type', label: 'Type', width: 100 },
                              { key: 'use', label: 'Use', width: 90 },
                              { key: 'actions', label: 'Actions', width: 64 },
                            ].map((col) => (
                              <TableCell key={col.key} sx={{ width: col.width, minWidth: col.width, whiteSpace: 'nowrap' }}>{col.label}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {!leaguesPaginated.length ? (
                            <TableRow>
                              <TableCell colSpan={8} align="center">No data.</TableCell>
                            </TableRow>
                          ) : (
                            leaguesPaginated.map((row) => {
                              const id = row.apiLeagueId ?? row.league?.id ?? row.id ?? row._id;
                              const selected = leagueId != null && String(id) === String(leagueId);
                              const logoUrl = row.logo || (row.league && row.league.logo) || null;
                              const name = toCellValue(row.league_name ?? row.league?.name ?? row.name);
                              return (
                                <TableRow
                                  key={String(id)}
                                  hover
                                  sx={{
                                    bgcolor: selected ? `${colors.brandRed}18` : undefined,
                                  }}
                                >
                                  <TableCell sx={{ width: 56, minWidth: 56, py: 0.75 }}>
                                    {logoUrl ? (
                                      <Box component="img" src={logoUrl} alt="" sx={{ width: 28, height: 28, objectFit: 'contain', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                    ) : (
                                      '-'
                                    )}
                                  </TableCell>
                                  <TableCell sx={{ width: 100, minWidth: 100 }}>{toCellValue(row.apiLeagueId ?? row.league?.id ?? row.id ?? row._id)}</TableCell>
                                  <TableCell sx={{ width: 220, minWidth: 220 }}>{name}</TableCell>
                                  <TableCell sx={{ width: 70, minWidth: 70 }}>{toCellValue(row.league_code)}</TableCell>
                                  <TableCell sx={{ width: 100, minWidth: 100 }}>{toCellValue(typeof row.country === 'string' ? row.country : (row.country?.name ?? row.country))}</TableCell>
                                  <TableCell sx={{ width: 100, minWidth: 100 }}>{toCellValue(row.leagueType)}</TableCell>
                                  <TableCell sx={{ width: 90, minWidth: 90 }}>{row.useInApp !== false ? 'Use' : "Don't use"}</TableCell>
                                  <TableCell sx={{ width: 64, minWidth: 64 }} onClick={(e) => e.stopPropagation()}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setLeagueMenuAnchor(e.currentTarget);
                                        setSelectedLeagueRow(row);
                                      }}
                                      sx={{
                                        backgroundColor: colors.brandRed,
                                        color: '#fff',
                                        width: 32,
                                        height: 32,
                                        '&:hover': { backgroundColor: colors.brandDarkRed || '#a00' },
                                      }}
                                    >
                                      <MoreVert sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  );
                })()}
              </Box>
              {leagues.length > 0 && !searchLeagues.trim() && (
                <TablePagination
                  component="div"
                  count={leagues.length}
                  page={leaguesPage}
                  onPageChange={(_, newPage) => setLeaguesPage(newPage)}
                  rowsPerPage={leaguesRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setLeaguesRowsPerPage(parseInt(e.target.value, 10));
                    setLeaguesPage(0);
                  }}
                  rowsPerPageOptions={[25, 50, 100, 200]}
                  labelRowsPerPage="Rows per page:"
                  showFirstButton
                  showLastButton
                  sx={{ flexShrink: 0, borderTop: 1, borderColor: 'divider' }}
                />
              )}

              <Menu
                anchorEl={leagueMenuAnchor}
                open={Boolean(leagueMenuAnchor)}
                onClose={() => { setLeagueMenuAnchor(null); setSelectedLeagueRow(null); }}
                PaperProps={{ sx: { borderRadius: '12px', minWidth: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', py: 0.5 } }}
              >
                <MenuItem
                  onClick={() => {
                    if (selectedLeagueRow) {
                      const id = selectedLeagueRow.apiLeagueId ?? selectedLeagueRow.league?.id ?? selectedLeagueRow.id ?? selectedLeagueRow._id;
                      const name = toCellValue(selectedLeagueRow.league_name ?? selectedLeagueRow.league?.name ?? selectedLeagueRow.name);
                      setLeagueId(String(id));
                      setSelectedLeagueName(name);
                      setView(VIEW_TEAMS);
                      loadTeams(String(id), season);
                    }
                    setLeagueMenuAnchor(null);
                    setSelectedLeagueRow(null);
                  }}
                  sx={{ py: 1.5, '&:hover': { backgroundColor: '#DBEAFE' } }}
                >
                  <Groups sx={{ fontSize: 18, color: '#3B82F6', mr: 1.5 }} />
                  <Typography sx={{ fontWeight: 600 }}>View Teams</Typography>
                </MenuItem>
                <MenuItem
                  disabled={selectedLeagueRow?.useInApp === true}
                  onClick={async () => {
                    const row = selectedLeagueRow;
                    setLeagueMenuAnchor(null);
                    if (!row?._id) return;
                    const res = await setLeagueUse(row._id, true);
                    if (res.success) { setMessage('League set to Use.'); setLoading(true); const r = await getApiLeagues(); if (r.success && Array.isArray(r.data)) setLeagues(r.data); setLoading(false); }
                    else setError(res.error || 'Failed');
                  }}
                  sx={{ py: 1.5 }}
                >
                  <Typography sx={{ fontWeight: 600 }}>Use</Typography>
                </MenuItem>
                <MenuItem
                  disabled={selectedLeagueRow?.useInApp === false}
                  onClick={async () => {
                    const row = selectedLeagueRow;
                    setLeagueMenuAnchor(null);
                    if (!row?._id) return;
                    const res = await setLeagueUse(row._id, false);
                    if (res.success) { setMessage('League set to Don\'t use.'); setLoading(true); const r = await getApiLeagues(); if (r.success && Array.isArray(r.data)) setLeagues(r.data); setLoading(false); }
                    else setError(res.error || 'Failed');
                  }}
                  sx={{ py: 1.5 }}
                >
                  <Typography sx={{ fontWeight: 600 }}>Don't use</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}

          {view === VIEW_TEAMS && (
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <Breadcrumbs sx={{ mb: 2, flexShrink: 0 }} separator={<NavigateNext fontSize="small" />}>
                <Typography component="button" variant="body2" color="inherit" onClick={() => setView(VIEW_LEAGUES)} sx={{ cursor: 'pointer', border: 0, background: 'none', '&:hover': { textDecoration: 'underline' } }}>Leagues</Typography>
                <Typography color="text.primary">Teams</Typography>
              </Breadcrumbs>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, flexShrink: 0 }}>
                League: {leagueId ? (safeStr(selectedLeagueName) || leagueId) : 'Select a league from Leagues (click View Teams)'}. Season: {season}.
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                League ID and season are set automatically when you click &quot;View Teams&quot; on a league. Use the action below to sync from API or load teams.
              </Typography>
              {teams.length === 0 && !loading && leagueId && season && (
                <Alert severity="info" sx={{ mb: 2, flexShrink: 0 }}>No teams for this league/season. Click &quot;Sync from API&quot; to fetch, or &quot;Load Teams&quot; to refresh.</Alert>
              )}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                <TextField size="small" label="League ID" value={leagueId} onChange={(e) => setLeagueId(e.target.value)} placeholder="e.g. 39" sx={{ width: 110 }} />
                <TextField size="small" label="Season" value={season} onChange={(e) => setSeason(e.target.value)} placeholder={String(currentYear)} sx={{ width: 90 }} />
                <TextField
                  size="small"
                  placeholder="Search by name or ID..."
                  value={searchTeams}
                  onChange={(e) => setSearchTeams(e.target.value)}
                  sx={{ minWidth: 220 }}
                  inputProps={{ 'aria-label': 'Search teams by name or ID' }}
                />
                <Button variant="contained" onClick={() => loadTeams()} disabled={loading}>Load Teams</Button>
                <Button
                  variant="outlined"
                  onClick={async () => {
                    if (!leagueId.trim() || !season.trim()) { setError('League and Season are required'); return; }
                    clearMsg();
                    const res = await syncTeamsFromApi(leagueId.trim(), season.trim());
                    if (res.success) {
                      setMessage(safeStr(res.message) || 'Sync started.');
                      setTimeout(() => loadTeams(), 4000);
                    } else {
                      setError(safeStr(res.error) || 'Sync failed');
                    }
                  }}
                >
                  Sync from API
                </Button>
                {!loading && teams.length > 0 && !searchTeams.trim() && (
                  <Typography variant="body2" color="text.secondary">
                    {teams.length.toLocaleString()} teams — use pagination below to see all
                  </Typography>
                )}
                {searchTeams.trim() && (
                  <Typography variant="body2" color="text.secondary">
                    Showing {teams.filter((r) => {
                      const q = searchTeams.trim().toLowerCase();
                      const id = String(r.team?.id ?? r.id ?? '');
                      const name = String(r.team?.name ?? r.name ?? '');
                      return id.toLowerCase().includes(q) || name.toLowerCase().includes(q);
                    }).length} matches (whole data, no pagination)
                  </Typography>
                )}
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', overflowX: 'auto', maxWidth: '100%' }}>
                {(() => {
                  const q = searchTeams.trim().toLowerCase();
                  const teamsFiltered = q
                    ? teams.filter((r) => {
                        const id = String(r.team?.id ?? r.id ?? '');
                        const name = String(r.team?.name ?? r.name ?? '');
                        return id.toLowerCase().includes(q) || name.toLowerCase().includes(q);
                      })
                    : teams;
                  const page = teamsPage;
                  const rowsPerPage = teamsRowsPerPage;
                  const usePagination = !q;
                  const start = usePagination ? page * rowsPerPage : 0;
                  const end = usePagination ? start + rowsPerPage : teamsFiltered.length;
                  const teamsPaginated = teamsFiltered.slice(start, end);
                  return (
                    <TableContainer component={Paper} sx={{ overflowX: 'auto', overflowY: 'visible', maxWidth: '100%', display: 'block' }}>
                      <Table size="small" sx={{ minWidth: 450 }}>
                        <TableHead>
                          <TableRow>
                            {[
                              { key: 'logo', label: 'Logo', width: 56 },
                              { key: 'id', label: 'Team ID', minWidth: 80 },
                              { key: 'name', label: 'Name', minWidth: 200 },
                              { key: 'actions', label: 'Actions', width: 56 },
                            ].map((col) => (
                              <TableCell key={col.key} sx={{ minWidth: col.minWidth, width: col.width }}>{col.label}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {!teamsPaginated.length ? (
                            <TableRow>
                              <TableCell colSpan={4} align="center">No data. Use the filters above and click Load Teams.</TableCell>
                            </TableRow>
                          ) : (
                            teamsPaginated.map((row) => {
                              const logoUrl = row.team?.logo ?? row.logo ?? null;
                              const teamId = row.team?.id ?? row.id;
                              const teamName = toCellValue(row.team?.name ?? row.name);
                              return (
                                <TableRow key={String(teamId)} hover>
                                  <TableCell sx={{ width: 56, py: 0.75 }}>
                                    {logoUrl ? (
                                      <Box component="img" src={logoUrl} alt="" sx={{ width: 28, height: 28, objectFit: 'contain', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                    ) : (
                                      '-'
                                    )}
                                  </TableCell>
                                  <TableCell sx={{ minWidth: 80 }}>{toCellValue(teamId)}</TableCell>
                                  <TableCell sx={{ minWidth: 200 }}>{teamName}</TableCell>
                                  <TableCell sx={{ width: 56 }} onClick={(e) => e.stopPropagation()}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTeamMenuAnchor(e.currentTarget);
                                        setSelectedTeamRow(row);
                                      }}
                                      sx={{
                                        backgroundColor: colors.brandRed,
                                        color: '#fff',
                                        width: 32,
                                        height: 32,
                                        '&:hover': { backgroundColor: colors.brandDarkRed || '#a00' },
                                      }}
                                    >
                                      <MoreVert sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  );
                })()}
              </Box>
              {teams.length > 0 && !searchTeams.trim() && (
                <TablePagination
                  component="div"
                  count={teams.length}
                  page={teamsPage}
                  onPageChange={(_, newPage) => setTeamsPage(newPage)}
                  rowsPerPage={teamsRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setTeamsRowsPerPage(parseInt(e.target.value, 10));
                    setTeamsPage(0);
                  }}
                  rowsPerPageOptions={[25, 50, 100, 200]}
                  labelRowsPerPage="Rows per page:"
                  showFirstButton
                  showLastButton
                  sx={{ flexShrink: 0, borderTop: 1, borderColor: 'divider' }}
                />
              )}

              <Menu
                anchorEl={teamMenuAnchor}
                open={Boolean(teamMenuAnchor)}
                onClose={() => { setTeamMenuAnchor(null); setSelectedTeamRow(null); }}
                PaperProps={{ sx: { borderRadius: '12px', minWidth: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', py: 0.5 } }}
              >
                <MenuItem
                  onClick={() => {
                    if (selectedTeamRow) {
                      const id = String(selectedTeamRow.team?.id ?? selectedTeamRow.id ?? '');
                      setTeamId(id);
                      setSelectedTeamName(toCellValue(selectedTeamRow.team?.name ?? selectedTeamRow.name));
                      setView(VIEW_PLAYERS);
                      loadPlayers(id);
                    }
                    setTeamMenuAnchor(null);
                    setSelectedTeamRow(null);
                  }}
                  sx={{ py: 1.5, '&:hover': { backgroundColor: '#DBEAFE' } }}
                >
                  <People sx={{ fontSize: 18, color: '#3B82F6', mr: 1.5 }} />
                  <Typography sx={{ fontWeight: 600 }}>View Players</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}

          {view === VIEW_PLAYERS && (
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <Breadcrumbs sx={{ mb: 2, flexShrink: 0 }} separator={<NavigateNext fontSize="small" />}>
                <Typography component="button" variant="body2" color="inherit" onClick={() => setView(VIEW_LEAGUES)} sx={{ cursor: 'pointer', border: 0, background: 'none', '&:hover': { textDecoration: 'underline' } }}>Leagues</Typography>
                <Typography component="button" variant="body2" color="inherit" onClick={() => setView(VIEW_TEAMS)} sx={{ cursor: 'pointer', border: 0, background: 'none', '&:hover': { textDecoration: 'underline' } }}>Teams</Typography>
                <Typography color="text.primary">Players</Typography>
              </Breadcrumbs>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, flexShrink: 0 }}>
                Team: {teamId ? (safeStr(selectedTeamName) || teamId) : 'Select a team from Teams (click View Players)'}.
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                Team ID is set automatically when you click &quot;View Players&quot; on a team; players load automatically. Use the buttons below to refresh or sync from API.
              </Typography>
              {playersRows.length === 0 && !loading && teamId && (
                <Alert severity="info" sx={{ mb: 2, flexShrink: 0 }}>No players for this team. Click &quot;Sync from API&quot; to fetch, or &quot;Load Players&quot; to refresh.</Alert>
              )}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                <TextField size="small" label="API Team ID" value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder="e.g. 33" sx={{ width: 130 }} />
                <TextField
                  size="small"
                  placeholder="Search by name or ID..."
                  value={searchPlayers}
                  onChange={(e) => setSearchPlayers(e.target.value)}
                  sx={{ minWidth: 220 }}
                  inputProps={{ 'aria-label': 'Search players by name or ID' }}
                />
                <Button variant="contained" onClick={() => loadPlayers()} disabled={loading}>Load Players</Button>
                <Button
                  variant="outlined"
                  onClick={async () => {
                    if (!teamId.trim()) { setError('API Team ID is required'); return; }
                    clearMsg();
                    const res = await syncPlayersFromApi(teamId.trim());
                    if (res.success) {
                      setMessage(safeStr(res.message) || 'Sync started.');
                      setTimeout(() => loadPlayers(), 4000);
                    } else {
                      setError(safeStr(res.error) || 'Sync failed');
                    }
                  }}
                >
                  Sync from API
                </Button>
                {searchPlayers.trim() && (
                  <Typography variant="body2" color="text.secondary">
                    Showing {playersRows.filter((r) => {
                      const q = searchPlayers.trim().toLowerCase();
                      const id = String(r.id ?? r.player?.id ?? '');
                      const name = String(r.name ?? r.player?.name ?? '');
                      const number = String(r.number ?? r.player?.number ?? '');
                      const position = String(r.position ?? r.player?.position ?? '');
                      return id.toLowerCase().includes(q) || name.toLowerCase().includes(q) || number.toLowerCase().includes(q) || position.toLowerCase().includes(q);
                    }).length} matches (whole data, no pagination)
                  </Typography>
                )}
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                {renderTable(
                  searchPlayers.trim()
                    ? playersRows.filter((r) => {
                        const q = searchPlayers.trim().toLowerCase();
                        const id = String(r.id ?? r.player?.id ?? '');
                        const name = String(r.name ?? r.player?.name ?? '');
                        const number = String(r.number ?? r.player?.number ?? '');
                        const position = String(r.position ?? r.player?.position ?? '');
                        return id.toLowerCase().includes(q) || name.toLowerCase().includes(q) || number.toLowerCase().includes(q) || position.toLowerCase().includes(q);
                      })
                    : playersRows,
                  [
                    { key: 'name', label: 'Name', render: (r) => toCellValue(r.name) },
                    { key: 'position', label: 'Position', render: (r) => toCellValue(r.position) },
                    { key: 'number', label: 'Number', render: (r) => toCellValue(r.number) },
                  ],
                  { maxHeight: 'none' }
                )}
              </Box>
            </Box>
          )}

          {view === VIEW_STANDINGS && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Uses League and Season from the context above. Table standings for the selected league.</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                <TextField size="small" label="League ID" value={leagueId} onChange={(e) => setLeagueId(e.target.value)} placeholder="e.g. 39" sx={{ width: 110 }} />
                <TextField size="small" label="Season" value={season} onChange={(e) => setSeason(e.target.value)} placeholder={String(currentYear)} sx={{ width: 90 }} />
                <Button variant="contained" onClick={loadStandings} disabled={loading}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Load Standings'}
                </Button>
              </Box>
              {renderTable(standings, [
                { key: 'rank', label: 'Rank', render: (r) => r.rank ?? '-' },
                { key: 'team', label: 'Team', render: (r) => r.team?.name ?? r.name ?? '-' },
                { key: 'points', label: 'Pts', render: (r) => r.points ?? '-' },
                { key: 'goalsDiff', label: 'GD', render: (r) => r.goalsDiff ?? '-' },
                { key: 'form', label: 'Form', render: (r) => r.form ?? '-' },
              ])}
            </Box>
          )}

          {view === VIEW_FIXTURES && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                By default data is from the database (fast). &quot;Load Fixtures&quot; shows stored fixtures for this league/season. Use &quot;Load from API&quot; to fetch the full list from the Football API. Optionally filter by Date or Status (FT, NS, LIVE).
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                <TextField size="small" label="League ID" value={leagueId} onChange={(e) => setLeagueId(e.target.value)} placeholder="e.g. 39" sx={{ width: 110 }} />
                <TextField size="small" label="Season" value={season} onChange={(e) => setSeason(e.target.value)} placeholder={String(currentYear)} sx={{ width: 90 }} />
                <TextField size="small" label="Date (YYYY-MM-DD)" value={fixtureDate} onChange={(e) => setFixtureDate(e.target.value)} placeholder="optional" sx={{ width: 160 }} />
                <TextField size="small" label="Status" value={fixtureStatus} onChange={(e) => setFixtureStatus(e.target.value)} placeholder="FT, NS, LIVE" sx={{ width: 100 }} />
                <Button variant="contained" onClick={() => loadFixtures(false)} disabled={loading}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Load Fixtures'}
                </Button>
                <Button variant="outlined" onClick={() => loadFixtures(true)} disabled={loading}>
                  Load from API
                </Button>
              </Box>
              {renderTable(fixtures, [
                { key: 'id', label: 'ID', render: (r) => r.fixture?.id ?? r.id ?? '-' },
                { key: 'date', label: 'Date', render: (r) => (r.fixture?.date ?? r.date) ? new Date(r.fixture?.date ?? r.date).toLocaleString() : '-' },
                { key: 'status', label: 'Status', render: (r) => r.fixture?.status?.short ?? r.status ?? '-' },
                { key: 'home', label: 'Home', render: (r) => r.teams?.home?.name ?? r.homeTeam?.name ?? '-' },
                { key: 'away', label: 'Away', render: (r) => r.teams?.away?.name ?? r.awayTeam?.name ?? '-' },
                { key: 'score', label: 'Score', render: (r) => {
                  const h = r.goals?.home ?? r.score?.home;
                  const a = r.goals?.away ?? r.score?.away;
                  return (h != null && a != null) ? `${h} - ${a}` : '-';
                }},
              ])}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApiSyncPage;
