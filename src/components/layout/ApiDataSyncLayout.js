/**
 * Layout for API Data & Sync: left sidebar with leagues (grouped by country), right = page content.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Collapse,
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import { getApiLeagues } from '../../services/apiSyncService';
import { colors } from '../../config/theme';
import { constants } from '../../config/theme';

const SIDEBAR_WIDTH = 280;
const currentSeason = new Date().getFullYear();

/** Pinned league API IDs (order = display order at top of sidebar). */
const PINNED_LEAGUE_IDS = [39, 140, 135, 78, 61, 88, 94, 203, 307, 253];

function groupLeaguesByCountry(leagues) {
  const byCountry = {};
  (leagues || []).forEach((l) => {
    const country = l.country || 'Other';
    if (!byCountry[country]) byCountry[country] = [];
    byCountry[country].push(l);
  });
  const order = Object.keys(byCountry).sort((a, b) => a.localeCompare(b));
  return order.map((country) => ({ country, leagues: byCountry[country] }));
}

export default function ApiDataSyncLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: leagueIdParam } = useParams();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCountries, setExpandedCountries] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getApiLeagues({ limit: 500 })
      .then((res) => {
        if (!cancelled && res.success && Array.isArray(res.data)) {
          setLeagues(res.data);
          setExpandedCountries((prev) => {
            const next = { ...prev };
            (res.data || []).forEach((l) => {
              const c = l.country || 'Other';
              if (next[c] === undefined) next[c] = true;
            });
            return next;
          });
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const toggleCountry = (country) => {
    setExpandedCountries((prev) => ({ ...prev, [country]: !prev[country] }));
  };

  const isLeagueDetail = /\/league\/[^/]+$/.test(location.pathname);
  const currentLeagueId = isLeagueDetail ? leagueIdParam : null;

  const searchTrim = search.trim().toLowerCase();
  const leagueDisplayName = (l) => l.name_display || l.league_name || '';
  const filteredLeagues = searchTrim
    ? leagues.filter(
        (l) =>
          leagueDisplayName(l).toLowerCase().includes(searchTrim) ||
          (l.country || '').toLowerCase().includes(searchTrim)
      )
    : leagues;
  const pinnedLeagues = PINNED_LEAGUE_IDS.map((id) => filteredLeagues.find((l) => Number(l.apiLeagueId) === id)).filter(Boolean);
  const restLeagues = filteredLeagues.filter((l) => !PINNED_LEAGUE_IDS.includes(Number(l.apiLeagueId)));
  const groups = groupLeaguesByCountry(restLeagues);

  // Sidebar only on league detail page; All leagues and Team page = full width
  if (!isLeagueDetail) {
    return <Outlet />;
  }

  return (
    <Box sx={{ display: 'flex', width: '100%', minHeight: '100%', gap: 0 }}>
      {/* Left sidebar - leagues by country (only on league detail) */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          borderRight: `1px solid ${colors.divider}`,
          bgcolor: `${colors.brandWhite}08`,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 120px)',
          borderRadius: 0,
        }}
      >
        <Box sx={{ py: 2, px: 2 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1 }}>
            Leagues
          </Typography>
        </Box>
        <Box sx={{ px: 1.5, pb: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search leagues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                borderRadius: 1,
              },
            }}
          />
        </Box>
        <ListItemButton
          selected={false}
          onClick={() => navigate(constants.routes.apiSync)}
          sx={{
            mx: 1,
            borderRadius: 1,
            '&:hover': {
              bgcolor: `${colors.brandRed}0C`,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <SportsSoccer fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="All leagues" primaryTypographyProps={{ fontSize: 14 }} />
        </ListItemButton>
        {pinnedLeagues.length > 0 && (
          <>
            <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, color: 'text.secondary' }}>
                Top leagues
              </Typography>
            </Box>
            <List component="div" disablePadding dense>
              {pinnedLeagues.map((league) => {
                const lid = league._id?.toString() || String(league.apiLeagueId ?? '');
                const selected = currentLeagueId === lid;
                return (
                  <ListItemButton
                    key={lid}
                    selected={selected}
                    onClick={() => navigate(`${constants.routes.apiSync}/league/${lid}`)}
                    sx={{
                      mx: 1,
                      borderRadius: 1,
                      py: 0.6,
                      '&.Mui-selected': {
                        bgcolor: `${colors.brandRed}18`,
                        borderLeft: `3px solid ${colors.brandRed}`,
                        '&:hover': { bgcolor: `${colors.brandRed}22` },
                      },
                    }}
                  >
                    {league.logo ? (
                      <Box component="img" src={league.logo} alt="" sx={{ width: 22, height: 22, mr: 1.5, objectFit: 'contain' }} />
                    ) : (
                      <SportsSoccer sx={{ fontSize: 20, mr: 1.5, color: 'text.secondary' }} />
                    )}
                    <ListItemText
                      primary={league.name_display || league.league_name || lid}
                      primaryTypographyProps={{ fontSize: 13, noWrap: true }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          groups.map(({ country, leagues: countryLeagues }) => {
            const open = expandedCountries[country] !== false;
            return (
              <Box key={country}>
                <ListItemButton
                  onClick={() => toggleCountry(country)}
                  sx={{ py: 0.75, px: 2 }}
                >
                  <ListItemText
                    primary={country.toUpperCase()}
                    primaryTypographyProps={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: 'text.secondary' }}
                  />
                  {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding dense>
                    {countryLeagues.map((league) => {
                      const lid = league._id?.toString() || String(league.apiLeagueId ?? '');
                      const selected = currentLeagueId === lid;
                      return (
                        <ListItemButton
                          key={lid}
                          selected={selected}
                          onClick={() => navigate(`${constants.routes.apiSync}/league/${lid}`)}
                          sx={{
                            pl: 3,
                            py: 0.6,
                            '&.Mui-selected': {
                              bgcolor: `${colors.brandRed}18`,
                              borderLeft: `3px solid ${colors.brandRed}`,
                              '&:hover': { bgcolor: `${colors.brandRed}22` },
                            },
                          }}
                        >
                          {league.logo ? (
                            <Box component="img" src={league.logo} alt="" sx={{ width: 22, height: 22, mr: 1.5, objectFit: 'contain' }} />
                          ) : (
                            <SportsSoccer sx={{ fontSize: 20, mr: 1.5, color: 'text.secondary' }} />
                          )}
                          <ListItemText
                            primary={league.name_display || league.league_name || lid}
                            primaryTypographyProps={{ fontSize: 13, noWrap: true }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          })
        )}
      </Box>
      {/* Main content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
