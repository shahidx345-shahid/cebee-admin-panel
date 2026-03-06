/**
 * API Data & Sync Center – Leagues (Data Browser).
 * Displays leagues from DB with server-side pagination and search for fast load. Click row → League Detail.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TablePagination,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import Sync from '@mui/icons-material/Sync';
import MoreVert from '@mui/icons-material/MoreVert';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import { getApiLeagues, syncLeaguesFromApi, setLeagueUse, setLeagueOrder } from '../services/apiSyncService';
import { colors } from '../config/theme';
import { constants } from '../config/theme';

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100, 150];
const currentSeason = new Date().getFullYear();
const SEARCH_DEBOUNCE_MS = 300;

export default function DataBrowserLeaguesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuLeague, setMenuLeague] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [orderInput, setOrderInput] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search and reset to first page when query changes
  useEffect(() => {
    const t = setTimeout(() => {
      const q = searchInput.trim();
      setSearchQuery(q);
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch one page from server (fast: limit/skip + optional q)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const skip = page * rowsPerPage;
    getApiLeagues({ limit: rowsPerPage, skip, q: searchQuery || undefined })
      .then((res) => {
        if (cancelled) return;
        if (res.success && Array.isArray(res.data)) {
          setLeagues(res.data);
          setTotalCount(res.total != null ? res.total : res.data.length);
        } else {
          setError(res.error || 'Failed to load leagues');
        }
      })
      .catch((e) => { if (!cancelled) setError(e.message || 'Failed to load leagues'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, rowsPerPage, searchQuery]);

  const displayList = leagues;

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (league) => {
    const id = league._id?.toString() || league.apiLeagueId;
    if (id) navigate(`${constants.routes.apiSync}/league/${id}`);
  };

  const handleSyncLeagues = async () => {
    setSyncing(true);
    setMessage(null);
    setError(null);
    const res = await syncLeaguesFromApi(); // API → save to DB
    setSyncing(false);
    if (res.success) {
      setMessage(res.message || 'Leagues synced. Refreshing from DB…');
      refetchLeagues();
    } else setError(res.error);
  };

  const openMenu = (event, league) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuLeague(league);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuLeague(null);
  };
  const handleSetUse = async (use) => {
    if (!menuLeague) return;
    const leagueId = menuLeague._id?.toString?.() || menuLeague._id;
    if (!leagueId) return;
    closeMenu();
    setMessage(null);
    setError(null);
    const res = await setLeagueUse(leagueId, use);
    if (res.success) {
      setMessage(use ? 'League set to Use.' : 'League set to Don\'t use.');
      refetchLeagues();
    } else setError(res.error || 'Failed to update');
  };

  const refetchLeagues = () => {
    getApiLeagues({ limit: rowsPerPage, skip: page * rowsPerPage, q: searchQuery || undefined }).then((r) => {
      if (r.success && Array.isArray(r.data)) {
        setLeagues(r.data);
        setTotalCount(r.total != null ? r.total : r.data.length);
      }
    });
  };

  const startEditOrder = (e, league) => {
    e.stopPropagation();
    const id = league._id?.toString?.() || league._id;
    setEditingOrderId(id);
    setOrderInput(league.displayOrder != null ? String(league.displayOrder) : '');
  };
  const cancelEditOrder = () => {
    setEditingOrderId(null);
    setOrderInput('');
  };
  const saveOrder = async (leagueId) => {
    const order = parseInt(orderInput, 10);
    if (Number.isNaN(order) || order < 0) {
      setError('Order must be 0 or greater');
      return;
    }
    setEditingOrderId(null);
    setOrderInput('');
    setMessage(null);
    setError(null);
    const res = await setLeagueOrder(leagueId, order);
    if (res.success) {
      setMessage('Order updated.');
      refetchLeagues();
    } else setError(res.error || 'Failed to update order');
  };
  const handleOrderBlur = (leagueId) => {
    if (editingOrderId !== String(leagueId)) return;
    if (orderInput.trim() === '') {
      cancelEditOrder();
      return;
    }
    saveOrder(leagueId);
  };
  const handleOrderKeyDown = (e, leagueId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveOrder(leagueId);
    }
    if (e.key === 'Escape') cancelEditOrder();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: colors.textPrimary }}>
        API Data & Sync Center
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        API → Database → Admin Data Browser. All data from DB; no manual ID input. Browse: Leagues → League (Overview, Teams, Fixtures, Standings) → Team (squad). Use Sync to update from API.
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search leagues by name or country..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
        <Button
          startIcon={<Sync />}
          onClick={handleSyncLeagues}
          disabled={syncing}
          size="medium"
        >
          {syncing ? 'Syncing…' : 'Sync leagues from API'}
        </Button>
        {!searchQuery && (
          <Typography variant="caption" color="text.secondary">
            Leagues by priority (top = main). Use search to filter. Data from DB only; Sync updates from API.
          </Typography>
        )}
      </Box>

      {message && <Alert severity="success" onClose={() => setMessage(null)} sx={{ mb: 2 }}>{message}</Alert>}

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" height={56} sx={{ flex: '1 1 100%', maxWidth: '100%' }} />
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${colors.divider}`, borderRadius: 2 }}>
          <Table size="medium">
            <TableHead>
              <TableRow sx={{ bgcolor: `${colors.brandRed}0D` }}>
                <TableCell sx={{ fontWeight: 600 }}>League</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Country</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Season</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Order</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Supported</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Active</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Use</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 88, whiteSpace: 'nowrap' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    {searchQuery ? 'No leagues match your search.' : 'No leagues in database. Sync leagues from API first.'}
                  </TableCell>
                </TableRow>
              ) : (
                displayList.map((league) => (
                  <TableRow
                    key={league._id?.toString() || league.apiLeagueId || league.league_name}
                    hover
                    onClick={() => handleRowClick(league)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: `${colors.brandRed}0A` },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {league.logo ? (
                          <Box
                            component="img"
                            src={league.logo}
                            alt=""
                            sx={{ width: 28, height: 28, objectFit: 'contain' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <SportsSoccer sx={{ color: colors.textHint, fontSize: 28 }} />
                        )}
                        <Typography variant="body2" fontWeight={500}>
                          {league.name_display || league.league_name || '—'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{league.country || '—'}</TableCell>
                    <TableCell>{currentSeason}</TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      {editingOrderId === (league._id?.toString?.() || league._id) ? (
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ min: 0, step: 1 }}
                          value={orderInput}
                          onChange={(e) => setOrderInput(e.target.value)}
                          onBlur={() => handleOrderBlur(league._id?.toString?.() || league._id)}
                          onKeyDown={(e) => handleOrderKeyDown(e, league._id?.toString?.() || league._id)}
                          autoFocus
                          sx={{ width: 64 }}
                        />
                      ) : (
                        <Typography
                          component="span"
                          variant="body2"
                          onClick={(e) => startEditOrder(e, league)}
                          sx={{ cursor: 'pointer', textDecoration: 'underline', '&:hover': { color: 'primary.main' } }}
                        >
                          {league.displayOrder != null ? league.displayOrder : '—'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">{league.is_supported ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="center">{league.is_active ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="center">{league.useInApp !== false ? 'Use' : "Don't use"}</TableCell>
                    <TableCell align="center" sx={{ minWidth: 88 }} onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        aria-label="League actions"
                        onClick={(e) => openMenu(e, league)}
                        sx={{ color: colors.textSecondary }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            labelRowsPerPage="Rows per page:"
            showFirstButton
            showLastButton
          />
        </TableContainer>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            const league = menuLeague;
            closeMenu();
            if (league) {
              const id = league._id?.toString?.() || league._id;
              setEditingOrderId(id);
              setOrderInput(league.displayOrder != null ? String(league.displayOrder) : '');
            }
          }}
        >
          Set order (0, 1, 2…)
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (!menuLeague) return;
            const leagueId = menuLeague._id?.toString?.() || menuLeague._id;
            closeMenu();
            setMessage(null);
            setError(null);
            const res = await setLeagueOrder(leagueId, null);
            if (res.success) {
              setMessage('Order cleared.');
              refetchLeagues();
            } else setError(res.error || 'Failed to clear order');
          }}
          disabled={menuLeague?.displayOrder == null}
        >
          Clear order
        </MenuItem>
        <MenuItem
          onClick={() => handleSetUse(true)}
          disabled={menuLeague?.useInApp !== false}
        >
          Set to Use
        </MenuItem>
        <MenuItem
          onClick={() => handleSetUse(false)}
          disabled={menuLeague?.useInApp === false}
        >
          Set to Don't use
        </MenuItem>
      </Menu>
    </Box>
  );
}
