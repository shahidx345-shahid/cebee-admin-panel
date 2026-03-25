import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
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
  Collapse,
} from '@mui/material';
import {
  ArrowForward,
  People,
  SportsSoccer,
  Refresh,
  Visibility,
  PlayArrow,
  CheckCircle,
  Event as EventIcon,
  ListAlt,
  Assessment,
  ExpandMore,
} from '@mui/icons-material';
import { colors } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import UserTableIdentityCell from '../components/common/UserTableIdentityCell';
import {
  getAdminCmdsList,
  getPredictionsAdminOverview,
} from '../services/predictionsAdminAnalyticsService';

const statMini = (label, value, sub) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, display: 'block', mb: 0.25 }}>
      {label}
    </Typography>
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1,
        py: 0.5,
        borderRadius: '8px',
        backgroundColor: '#FFE5E5',
        color: colors.brandRed,
        fontWeight: 700,
        fontSize: 13,
        maxWidth: '100%',
      }}
      component="span"
    >
      <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: colors.brandRed, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
    {sub != null && (
      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mt: 0.25 }}>
        {sub}
      </Typography>
    )}
  </Box>
);

/** Highest total SP by a single user in scope; shows handle + SP when known. */
const statTopUser = (s) => {
  const sp = s?.highestSP ?? 0;
  const sub = 'Highest total SP earned by one user in this scope';
  if (sp <= 0) {
    return statMini('Top User', '—', sub);
  }
  const handle =
    s?.topUserUsername && String(s.topUserUsername).trim() && s.topUserUsername !== '—'
      ? String(s.topUserUsername).trim()
      : null;
  const name =
    s?.topUserFullName && String(s.topUserFullName).trim() && s.topUserFullName !== '—'
      ? String(s.topUserFullName).trim()
      : null;
  const who = handle || name || 'User';
  return statMini('Top User', `${who} — ${sp} SP`, sub);
};

const PredictionsOverviewPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('ongoing');
  const [cmdOptions, setCmdOptions] = useState([]);
  const [selectedCmdIds, setSelectedCmdIds] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  /** Which per-CMD cards are expanded when multiple CMDs are explicitly selected (collapsed by default). */
  const [expandedCmdIds, setExpandedCmdIds] = useState(() => new Set());

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchDraft), 450);
    return () => clearTimeout(t);
  }, [searchDraft]);

  const explicitMultiCmdFilter = selectedCmdIds.length > 1;

  useEffect(() => {
    setExpandedCmdIds(new Set());
  }, [selectedCmdIds, explicitMultiCmdFilter, phase]);

  const loadCmdOptions = useCallback(async () => {
    const r = await getAdminCmdsList({ phase });
    if (r.success && r.data?.cmds) setCmdOptions(r.data.cmds);
  }, [phase]);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = {
      phase,
      ...(selectedCmdIds.length ? { cmdIds: selectedCmdIds.join(',') } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    };
    const r = await getPredictionsAdminOverview(params);
    if (r.success && r.data) setOverview(r.data);
    else setError(r.error || 'Failed to load overview');
    setLoading(false);
  }, [phase, selectedCmdIds, dateFrom, dateTo, search, refreshKey]);

  useEffect(() => {
    loadCmdOptions();
  }, [loadCmdOptions]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const multiCmd = overview?.multiCmd;
  const cmdCount = (overview?.cmds || []).length;
  const combinedStats = overview?.combinedStats;
  const showCombinedSummary = explicitMultiCmdFilter && combinedStats != null;

  const toggleCmdExpanded = (cmdId) => {
    setExpandedCmdIds((prev) => {
      const next = new Set(prev);
      if (next.has(cmdId)) next.delete(cmdId);
      else next.add(cmdId);
      return next;
    });
  };

  const phaseTabs = [
    { value: 'ongoing', label: 'Ongoing predictions', icon: PlayArrow, color: colors.brandRed },
    { value: 'completed', label: 'Completed predictions', icon: CheckCircle, color: colors.success },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: colors.brandBlack,
            fontSize: { xs: 24, md: 28 },
          }}
        >
          Predictions Management
        </Typography>
        <Tooltip title="Reload data from server">
          <IconButton onClick={() => setRefreshKey((k) => k + 1)} sx={{ color: colors.brandRed }} aria-label="Refresh">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
        CeBee Matchday Cycle (CMD) → matches → users → prediction details. One CMD shows user status; multiple CMDs show
        historical stats only (status &quot;—&quot;).
      </Typography>

      <Alert
        severity="info"
        icon={<Visibility sx={{ color: colors.info }} />}
        sx={{
          mb: 3,
          borderRadius: '12px',
          backgroundColor: `${colors.info}12`,
          border: `1px solid ${colors.info}33`,
          '& .MuiAlert-message': { width: '100%' },
        }}
      >
        <Typography variant="body2" sx={{ color: colors.brandBlack }}>
          <strong>Phase:</strong> Ongoing / Completed CMDs from the database. <strong>Filters:</strong> CMD multi-select, date
          range (prediction time), user search affects only the <strong>user table</strong> — CMD card stats stay full-cycle.{' '}
          <strong>Multiple CMDs selected:</strong> combined summary at the top, per-CMD cards collapsed by default, prediction
          status in the table is &quot;—&quot;. <strong>Real-time:</strong> use refresh; live push is not wired yet.
        </Typography>
      </Alert>

      {/* Phase — connected style (Fixture Management status tabs) */}
      <Card
        sx={{
          mb: 3,
          borderRadius: { xs: '16px', md: '20px' },
          backgroundColor: colors.brandWhite,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          padding: 0,
          maxWidth: '100%',
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', gap: 0 }}>
          {phaseTabs.map((tab) => {
            const isSelected = phase === tab.value;
            const Icon = tab.icon;
            return (
              <Button
                key={tab.value}
                onClick={() => setPhase(tab.value)}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: isSelected ? 2 : 1.75, md: isSelected ? 3 : 2.5 },
                  minHeight: { xs: 54, md: 64 },
                  borderRadius: 0,
                  backgroundColor: isSelected ? tab.color : 'transparent',
                  color: isSelected ? colors.brandWhite : colors.textSecondary,
                  border: 'none',
                  boxShadow: isSelected ? `0 2px 8px ${tab.color}40` : 'none',
                  position: 'relative',
                  margin: isSelected ? '4px' : '0',
                  fontSize: { xs: 13, sm: 14, md: 15 },
                  '&:first-of-type': {
                    borderTopLeftRadius: { xs: '16px', md: '20px' },
                    borderBottomLeftRadius: { xs: '16px', md: '20px' },
                    marginLeft: isSelected ? '4px' : '0',
                  },
                  '&:last-of-type': {
                    borderTopRightRadius: { xs: '16px', md: '20px' },
                    borderBottomRightRadius: { xs: '16px', md: '20px' },
                    marginRight: isSelected ? '4px' : '0',
                  },
                  '&:hover': {
                    backgroundColor: isSelected ? tab.color : `${tab.color}0D`,
                    boxShadow: isSelected ? `0 2px 8px ${tab.color}40` : 'none',
                  },
                }}
              >
                <Icon
                  sx={{
                    fontSize: { xs: 18, md: 20 },
                    mr: { xs: 0.75, md: 1 },
                    color: isSelected ? colors.brandWhite : tab.color,
                    flexShrink: 0,
                  }}
                />
                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tab.label}
                </Box>
              </Button>
            );
          })}
        </Box>
      </Card>

      {/* Scope & filters — CMd filter card pattern */}
      <Card
        sx={{
          mb: 3,
          borderRadius: '16px',
          backgroundColor: colors.brandWhite,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          padding: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <EventIcon sx={{ fontSize: 20, color: colors.brandRed }} />
          <Typography variant="body1" sx={{ fontWeight: 600, color: colors.brandBlack }}>
            Filters: CMD scope, dates &amp; user search
          </Typography>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="cmd-multi-label">CMD (multi)</InputLabel>
              <Select
                labelId="cmd-multi-label"
                multiple
                value={selectedCmdIds}
                onChange={(e) =>
                  setSelectedCmdIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
                }
                input={<OutlinedInput label="CMD (multi)" />}
                renderValue={(sel) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {sel.map((id) => {
                      const c = cmdOptions.find((x) => x.cmdId === id);
                      return <Chip key={id} size="small" label={c?.name || id} />;
                    })}
                  </Box>
                )}
                sx={{
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: `${colors.divider}66` },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.brandRed },
                }}
              >
                {cmdOptions.map((c) => (
                  <MenuItem key={c.cmdId} value={c.cmdId}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Date from"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '& fieldset': { borderColor: `${colors.divider}66` },
                  '&:hover fieldset': { borderColor: colors.brandRed },
                },
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Date to"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '& fieldset': { borderColor: `${colors.divider}66` },
                  '&:hover fieldset': { borderColor: colors.brandRed },
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <SearchBar
              value={searchDraft}
              onChange={setSearchDraft}
              placeholder="User search (name, username, email) — table only"
            />
          </Grid>
        </Grid>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: colors.brandRed }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {error}
        </Alert>
      ) : (
        <>
          {showCombinedSummary && (
            <Card
              sx={{
                width: '100%',
                mb: 3,
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: `0 8px 24px ${colors.brandRed}22`,
                border: `2px solid ${colors.brandRed}35`,
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
                  px: { xs: 2, sm: 2.5, md: 3 },
                  py: { xs: 2, md: 2.25 },
                  color: colors.brandWhite,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: '14px',
                      backgroundColor: `${colors.brandWhite}33`,
                    }}
                  >
                    <Assessment sx={{ fontSize: 28, color: colors.brandWhite }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: colors.brandWhite }}>
                      CMD Summary ({selectedCmdIds.length} Cycles Selected)
                    </Typography>
                    <Typography variant="caption" sx={{ color: `${colors.brandWhite}E0`, display: 'block', mt: 0.5 }}>
                      Combined metrics across selected CMDs — unique users, one union of predictions &amp; matches (not averages of
                      per-CMD cards).
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <CardContent sx={{ pt: 2.5, pb: 2.5, px: { xs: 2, sm: 3 } }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Total users', combinedStats.totalUsers)}</Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>
                    {statMini('Participation rate', `${combinedStats.participationRate ?? 0}%`, `of ${overview?.totalAppUsers ?? 0} app users`)}
                  </Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Total predictions', combinedStats.totalPredictions)}</Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Total matches', combinedStats.totalMatches)}</Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Prediction accuracy', `${combinedStats.predictionAccuracy ?? 0}%`, 'all evaluated slots')}</Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>
                    {statMini('Avg accuracy / match', combinedStats.avgAccuracyPerMatch != null ? `${combinedStats.avgAccuracyPerMatch}%` : '—', 'mean over matches')}
                  </Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Total SP won', combinedStats.totalSPWon ?? 0)}</Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Predictions won', combinedStats.totalPredictionsWon ?? 0, 'correct slots')}</Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Predictions lost', combinedStats.totalPredictionsLost ?? 0, 'incorrect slots')}</Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Perfect count', combinedStats.totalPerfectCount ?? 0, 'user×match perfect')}</Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Avg pred. / user', combinedStats.avgPredictionsPerUser ?? 0)}</Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Avg SP / user', combinedStats.avgSPPerUser ?? 0)}</Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>{statTopUser(combinedStats)}</Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {!showCombinedSummary && (
            <Card
              sx={{
                padding: 2.5,
                mb: 3,
                borderRadius: '16px',
                background: colors.brandWhite,
                border: `1.5px solid ${colors.divider}26`,
                boxShadow: `0 4px 12px ${colors.shadow}14`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                  <SportsSoccer sx={{ fontSize: 24, color: colors.brandWhite }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    CMD overview
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {cmdCount} {cmdCount === 1 ? 'cycle' : 'cycles'} in this phase
                  </Typography>
                </Box>
              </Box>
            </Card>
          )}

          {explicitMultiCmdFilter && (
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.textSecondary, mb: 1.5, px: 0.5 }}>
              Per-CMD detail (expand to view stats)
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4, width: '100%' }}>
            {(overview?.cmds || []).map((cmd) => {
              const s = cmd.stats || {};
              const goBreakdown = (e) => {
                if (e) e.stopPropagation();
                navigate(`/predictions/cmd/${encodeURIComponent(cmd.cmdId)}/breakdown`);
              };
              const isExpanded = !explicitMultiCmdFilter || expandedCmdIds.has(cmd.cmdId);
              return (
                <Card
                  key={cmd.cmdId}
                  sx={{
                    width: '100%',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 6px 14px rgba(0, 0, 0, 0.08)',
                    border: `1.5px solid ${colors.brandRed}20`,
                  }}
                >
                  <Box
                    role={explicitMultiCmdFilter ? 'button' : undefined}
                    tabIndex={explicitMultiCmdFilter ? 0 : undefined}
                    onClick={
                      explicitMultiCmdFilter
                        ? () => toggleCmdExpanded(cmd.cmdId)
                        : undefined
                    }
                    onKeyDown={
                      explicitMultiCmdFilter
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleCmdExpanded(cmd.cmdId);
                            }
                          }
                        : undefined
                    }
                    sx={{
                      background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
                      px: { xs: 2, sm: 2.5, md: 3 },
                      py: { xs: 2, md: 2.25 },
                      color: colors.brandWhite,
                      cursor: explicitMultiCmdFilter ? 'pointer' : 'default',
                      outline: 'none',
                      '&:focus-visible': explicitMultiCmdFilter ? { boxShadow: `inset 0 0 0 2px ${colors.brandWhite}` } : {},
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'stretch', md: 'center' },
                        gap: { xs: 2, md: 2 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1, minWidth: 0 }}>
                        {explicitMultiCmdFilter && (
                          <ExpandMore
                            sx={{
                              fontSize: 28,
                              color: colors.brandWhite,
                              flexShrink: 0,
                              mt: 0.25,
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                            }}
                          />
                        )}
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: '14px',
                            backgroundColor: `${colors.brandWhite}33`,
                            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.12)',
                            flexShrink: 0,
                          }}
                        >
                          <SportsSoccer sx={{ fontSize: 26, color: colors.brandWhite }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: colors.brandWhite, lineHeight: 1.25 }}>
                            {cmd.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: `${colors.brandWhite}E0`, display: 'block', mt: 0.5 }}>
                            CMD id: {cmd.cmdId}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          flexShrink: 0,
                          flexWrap: 'wrap',
                          justifyContent: { xs: 'flex-start', md: 'flex-end' },
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Chip
                          size="small"
                          label={cmd.status || '—'}
                          sx={{
                            fontWeight: 700,
                            backgroundColor: `${colors.brandWhite}22`,
                            color: colors.brandWhite,
                            border: `1px solid ${colors.brandWhite}55`,
                          }}
                        />
                        <Button
                          variant="contained"
                          endIcon={<ArrowForward />}
                          onClick={goBreakdown}
                          sx={{
                            display: { xs: 'none', md: 'inline-flex' },
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            py: 1,
                            px: 2.5,
                            backgroundColor: colors.brandWhite,
                            color: colors.brandRed,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            '&:hover': { backgroundColor: `${colors.brandWhite}E6`, color: colors.brandDarkRed },
                          }}
                        >
                          View breakdown
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit={false}>
                    <CardContent sx={{ pt: { xs: 2, md: 2.5 }, pb: 2.5, px: { xs: 2, sm: 3 } }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Total users', s.totalUsers)}</Grid>
                        <Grid item xs={6} sm={4} md={3} lg={2}>
                          {statMini('Participation rate', `${s.participationRate ?? 0}%`, `of ${overview?.totalAppUsers ?? 0} app users`)}
                        </Grid>
                        <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Total predictions', s.totalPredictions)}</Grid>
                        <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Total matches', s.totalMatches)}</Grid>
                        <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Prediction accuracy', `${s.predictionAccuracy ?? 0}%`, 'all evaluated slots')}</Grid>
                        <Grid item xs={6} sm={4} md={3} lg={2}>
                          {statMini('Avg accuracy / match', s.avgAccuracyPerMatch != null ? `${s.avgAccuracyPerMatch}%` : '—', 'mean over matches')}
                        </Grid>
                        <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Total SP won', s.totalSPWon ?? 0)}</Grid>
                        <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Predictions won', s.totalPredictionsWon ?? 0, 'correct slots')}</Grid>
                        <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Predictions lost', s.totalPredictionsLost ?? 0, 'incorrect slots')}</Grid>
                        <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Perfect count', s.totalPerfectCount ?? 0, 'user×match perfect')}</Grid>
                        <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Avg pred. / user', s.avgPredictionsPerUser ?? 0)}</Grid>
                        <Grid item xs={6} sm={4} md={3} lg={2}>{statMini('Avg SP / user', s.avgSPPerUser ?? 0)}</Grid>
                        <Grid item xs={6} sm={4} md={3} lg={2}>{statTopUser(s)}</Grid>
                      </Grid>
                      <Button
                        variant="contained"
                        fullWidth
                        endIcon={<ArrowForward />}
                        onClick={goBreakdown}
                        sx={{
                          display: { xs: 'flex', md: 'none' },
                          mt: 2.5,
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontWeight: 700,
                          py: 1.25,
                          background: `linear-gradient(135deg, ${colors.brandRed}, ${colors.brandDarkRed})`,
                          boxShadow: `0 4px 12px ${colors.brandRed}40`,
                        }}
                      >
                        View breakdown
                      </Button>
                    </CardContent>
                  </Collapse>
                </Card>
              );
            })}
          </Box>

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
                bgcolor: colors.brandWhite,
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
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <People sx={{ fontSize: 22, color: colors.brandRed }} />
                  CMD user table
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {(overview?.users || []).length} {(overview?.users || []).length === 1 ? 'user' : 'users'} in this filter
                </Typography>
              </Box>
              {(multiCmd || explicitMultiCmdFilter) && (
                <Chip size="small" label="Multi-CMD: status N/A" color="warning" sx={{ fontWeight: 700 }} />
              )}
            </Box>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: 0,
                border: 'none',
                boxShadow: 'none',
                overflowX: 'hidden',
                width: '100%',
              }}
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
                    <TableCell align="left" sx={{ fontWeight: 700, width: '34%' }}>
                      User
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 700, width: '11%' }}>
                      <Tooltip title="Matches participated / Total predictions (rows)" placement="top">
                        <span>M / P</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 700, width: '10%' }}>
                      <Tooltip title="Correct prediction slots (won)" placement="top">
                        <span>Won</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 700, width: '15%' }}>
                      {multiCmd ? 'Status —' : 'Status'}
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 700, width: '16%' }}>
                      <Tooltip title="Accuracy % and total SP won" placement="top">
                        <span>Acc / SP</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="left" sx={{ fontWeight: 700, width: '14%' }}>
                      <Tooltip title="Perfect (user × match)" placement="top">
                        <span>Perfect</span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(overview?.users || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: colors.textSecondary }}>
                        No users in this filter
                      </TableCell>
                    </TableRow>
                  ) : (
                    overview.users.map((u) => (
                      <TableRow key={String(u.userId)} hover>
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
                          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {u.matchesParticipated}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                            {u.totalPredictions}
                          </Typography>
                        </TableCell>
                        <TableCell align="left" sx={{ verticalAlign: 'top', borderBottom: `1px solid ${colors.divider}` }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.totalPredictionsWon}</Typography>
                        </TableCell>
                        <TableCell align="left" sx={{ verticalAlign: 'top', borderBottom: `1px solid ${colors.divider}` }}>
                          {multiCmd || u.predictionStatus === '—' ? (
                            <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                              —
                            </Typography>
                          ) : (
                            <Chip
                              size="small"
                              label={u.predictionStatus}
                              sx={{ fontWeight: 700, maxWidth: '100%' }}
                              color={
                                u.predictionStatus === 'Pending'
                                  ? 'default'
                                  : u.predictionStatus === 'Perfect'
                                    ? 'success'
                                    : u.predictionStatus === 'Lost'
                                      ? 'error'
                                      : 'warning'
                              }
                            />
                          )}
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
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.perfectCount}</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}
    </Box>
  );
};

export default PredictionsOverviewPage;
