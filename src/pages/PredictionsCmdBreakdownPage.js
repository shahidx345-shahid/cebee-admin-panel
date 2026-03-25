import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Star,
  SportsSoccer,
  Whatshot,
  EmojiEvents,
  KeyboardArrowRight,
  ExpandMore,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { colors, constants } from '../config/theme';
import { getCmdBreakdown } from '../services/predictionsAdminAnalyticsService';

const LIST_LOGO = 44;
/** Centered match row — larger than list avatars so teams + score read first */
const CENTER_LOGO = 72;

/** Strip trailing or embedded " (API 307)" from stored league strings */
function stripApiLeagueSuffix(name) {
  if (name == null || typeof name !== 'string') return name;
  const s = name.replace(/\s*\(API\s+\d+\)\s*/gi, '').trim();
  return s || name;
}

function matchMetaRoundLabel(m) {
  if (m.round != null && String(m.round).trim()) return String(m.round).trim();
  if (m.matchday != null && String(m.matchday).trim() !== '') return `Matchday ${m.matchday}`;
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

/** Same grid cell pattern as Prediction Details → Match summary */
const statMini = (label, value, sub) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      variant="body2"
      sx={{ color: colors.textSecondary, fontWeight: 700, fontSize: 12, display: 'block', mb: 0.25, lineHeight: 1.3 }}
    >
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
        fontSize: 14,
        maxWidth: '100%',
      }}
      component="span"
    >
      <Typography component="span" variant="body2" sx={{ fontWeight: 800, fontSize: 14, color: colors.brandRed, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
    {sub != null && sub !== '' && (
      <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 500, fontSize: 12, display: 'block', mt: 0.25, lineHeight: 1.3 }}>
        {sub}
      </Typography>
    )}
  </Box>
);

const statTopUserMatch = (ms) => {
  const sp = ms?.topUserHighestSP ?? 0;
  const sub = 'Most SP earned by one user on this match';
  if (sp <= 0) return statMini('Top user', '—', sub);
  const handle =
    ms?.topUserUsername && String(ms.topUserUsername).trim() && ms.topUserUsername !== '—'
      ? String(ms.topUserUsername).trim()
      : null;
  const name =
    ms?.topUserFullName && String(ms.topUserFullName).trim() && ms.topUserFullName !== '—'
      ? String(ms.topUserFullName).trim()
      : null;
  const who = handle || name || 'User';
  return statMini('Top user', `${who} — ${sp} SP`, sub);
};

const TeamLogo = ({ url, size = LIST_LOGO, prominent = false }) => {
  const inner = Math.max(16, size - (prominent ? 14 : 16));
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: '#fff',
        border: prominent ? '2px solid #E8E8E8' : '1px solid #EEEEEE',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: prominent ? '0 6px 20px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.06)',
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

const MatchRowCard = ({ m, onOpen, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const kickoffDate = m.kickoffTime ? new Date(m.kickoffTime) : null;
  const kickoffStr =
    kickoffDate && !Number.isNaN(kickoffDate.getTime()) ? format(kickoffDate, 'EEE d MMM • HH:mm') : '—';
  const statusLbl = breakdownStatusLabel(m.matchStatus, m.status);
  const mid = m.homeScore != null && m.awayScore != null ? `${m.homeScore} – ${m.awayScore}` : 'vs';
  const leagueLine = m.league ? stripApiLeagueSuffix(m.league) : '';
  const roundLine = matchMetaRoundLabel(m);

  const openDetail = () => onOpen(m.fixtureId);

  const topUserMs = {
    topUserHighestSP: m.topUserHighestSP,
    topUserUsername: m.topUserUsername,
    topUserFullName: m.topUserFullName,
  };

  const toggleExpand = () => setExpanded((v) => !v);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        px: 2.5,
        py: 2,
        borderBottom: isLast ? 'none' : `1px solid ${colors.divider}`,
        transition: 'background-color 0.2s ease',
        bgcolor: '#fff',
      }}
    >
      <Box
        onClick={toggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpand();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse match card' : 'Expand match card'}
        sx={{
          cursor: 'pointer',
          borderRadius: 1,
          outline: 'none',
          '&:hover': { backgroundColor: '#FAFAFA' },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 1,
          pb: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: colors.brandBlack,
            fontSize: { xs: 14, sm: 15 },
            fontWeight: 700,
            letterSpacing: '0.01em',
            lineHeight: 1.35,
            pr: 1,
            flex: 1,
            minWidth: 0,
          }}
        >
          {kickoffStr}
          {leagueLine ? ` · ${leagueLine}` : ''}
          {roundLine ? ` · ${roundLine}` : ''}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <Chip
            label={statusLbl}
            size="small"
            sx={{ fontWeight: 800, fontSize: 13, height: 30, px: 0.75, ...statusChipSx(statusLbl) }}
          />
          <ExpandMore
            sx={{
              color: colors.textSecondary,
              fontSize: 28,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
          <IconButton
            size="small"
            aria-label="Open match users"
            onClick={(e) => {
              e.stopPropagation();
              openDetail();
            }}
            sx={{ color: colors.textSecondary }}
          >
            <KeyboardArrowRight sx={{ fontSize: 26 }} />
          </IconButton>
        </Box>
      </Box>
      <Grid container alignItems="center" justifyContent="center" spacing={{ xs: 2, sm: 3 }} sx={{ py: 1.5 }}>
        <Grid item xs={5} sm={4} sx={{ textAlign: 'center' }}>
          <Box sx={{ py: 0.5 }}>
            <TeamLogo url={m.homeTeamLogo} size={CENTER_LOGO} prominent />
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
              {m.homeTeam || 'TBD'}
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
            <TeamLogo url={m.awayTeamLogo} size={CENTER_LOGO} prominent />
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
              {m.awayTeam || 'TBD'}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mt: 0.35, fontSize: 11, fontWeight: 600 }}>
              Away
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box
          sx={{
            pt: 0.5,
            pb: 1.5,
            display: 'grid',
            gap: 2,
            width: '100%',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(3, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(6, minmax(0, 1fr))',
            },
            alignItems: 'start',
          }}
        >
          {statMini('Unique users', m.totalUsers ?? '—', 'Users who predicted this match')}
          {statMini(
            'Participation rate',
            m.participationRate != null ? `${m.participationRate}%` : '—',
            m.totalAppUsers != null ? `Of ${m.totalAppUsers} app users` : null,
          )}
          {statMini('Total predictions', m.totalPredictions ?? '—', 'Prediction rows on this fixture')}
          {statMini(
            'Row correct %',
            m.docAccuracyPct != null ? `${m.docAccuracyPct}%` : '—',
            'Correct rows / all rows',
          )}
          {statMini('Avg pred. / user', m.avgPredPerUser != null ? m.avgPredPerUser : '—', 'Rows per predicting user')}
          {statMini('Total SP won', m.totalSPWon ?? '—', 'All predictors combined')}
          {statMini('Correct rows', m.correctPredictionDocs ?? '—', 'Marked correct')}
          {statMini('Incorrect rows', m.incorrectPredictionDocs ?? '—', 'Marked incorrect')}
          {statMini('Partial rows', m.partialPredictionDocs ?? '—', 'Marked partial')}
          {statMini('Avg SP / user', m.avgSpPerPredictor != null ? m.avgSpPerPredictor : '—', 'Mean SP per predicting user')}
          {statTopUserMatch(topUserMs)}
        </Box>
      </Collapse>
    </Box>
  );
};

const Stat = ({ label, v }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 700, fontSize: 12, display: 'block', mb: 0.25 }}>
      {label}
    </Typography>
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        px: 1,
        py: 0.5,
        borderRadius: '8px',
        backgroundColor: '#FFE5E5',
        color: colors.brandRed,
        fontWeight: 800,
        fontSize: 14,
      }}
    >
      {v}
    </Box>
  </Box>
);

const PredictionsCmdBreakdownPage = () => {
  const { cmdId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await getCmdBreakdown(cmdId);
      if (cancelled) return;
      if (r.success) setData(r.data);
      else setErr(r.error || 'Failed to load');
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [cmdId]);

  const grouped = React.useMemo(() => {
    const m = data?.matches || [];
    return {
      cebe: m.filter((x) => x.group === 'cebee_featured'),
      community: m.filter((x) => x.group === 'community_featured'),
      other: m.filter((x) => x.group === 'other'),
    };
  }, [data]);

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

  const { cmd, header } = data;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', pb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(constants.routes.predictions)}
        sx={{
          mb: 2,
          color: colors.brandRed,
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: '12px',
        }}
      >
        Back to CMD overview
      </Button>

      <Card
        sx={{
          mb: 3,
          width: '100%',
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
            py: { xs: 2.5, md: 3 },
            color: colors.brandWhite,
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                p: 1.25,
                borderRadius: '14px',
                backgroundColor: `${colors.brandWhite}33`,
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.12)',
              }}
            >
              <SportsSoccer sx={{ fontSize: 32, color: colors.brandWhite }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: colors.brandWhite }}>
                {cmd.name}
              </Typography>
              <Typography variant="body2" sx={{ color: `${colors.brandWhite}E0`, mt: 0.5 }}>
                CMD id: <strong style={{ color: colors.brandWhite }}>{cmd.cmdId}</strong> · single-cycle match breakdown
              </Typography>
            </Box>
            <Chip
              label={cmd.status}
              sx={{
                fontWeight: 700,
                backgroundColor: `${colors.brandWhite}22`,
                color: colors.brandWhite,
                border: `1px solid ${colors.brandWhite}55`,
              }}
            />
          </Box>
        </Box>
        <CardContent sx={{ pt: 2.5, pb: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEvents sx={{ color: colors.brandRed, fontSize: 22 }} />
                <Stat label="Matches" v={header.totalMatches} />
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Stat label="Predictions" v={header.totalPredictions} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star sx={{ color: colors.warning, fontSize: 22 }} />
                <Stat label="Total SP" v={header.totalSP} />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Section title="CeBee featured match" titlePrefix="⭐ " icon={<Star sx={{ color: colors.warning }} />} matches={grouped.cebe} navigate={navigate} />
      <Section title="Community featured matches" titlePrefix="🔥 " icon={<Whatshot sx={{ color: colors.brandRed }} />} matches={grouped.community} navigate={navigate} />
      <Section title="Other matches" icon={<SportsSoccer sx={{ color: colors.textSecondary }} />} matches={grouped.other} navigate={navigate} />
    </Box>
  );
};

function Section({ title, titlePrefix = '', icon, matches, navigate }) {
  if (!matches.length) return null;
  return (
    <Box sx={{ mb: 4, width: '100%' }}>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: '1rem', sm: '1.05rem' },
          color: colors.brandRed,
          mb: 2,
          textTransform: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box component="span" aria-hidden>{titlePrefix}</Box>
        {icon}
        {title}
      </Typography>
      <Box
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: `1px solid ${colors.divider}`,
        }}
      >
        {matches.map((m, idx) => (
          <MatchRowCard
            key={m.fixtureId}
            m={m}
            isLast={idx === matches.length - 1}
            onOpen={(fid) => navigate(`/predictions/match/${encodeURIComponent(fid)}/users`)}
          />
        ))}
      </Box>
    </Box>
  );
}

export default PredictionsCmdBreakdownPage;
