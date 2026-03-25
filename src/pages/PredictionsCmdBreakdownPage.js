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
} from '@mui/material';
import { ArrowBack, Star, SportsSoccer, Whatshot, EmojiEvents, KeyboardArrowRight } from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import { getCmdBreakdown } from '../services/predictionsAdminAnalyticsService';

const Stat = ({ label, v }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, display: 'block', mb: 0.25 }}>
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
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      {v}
    </Box>
  </Box>
);

const MatchRowCard = ({ m, onOpen }) => (
  <Card
    sx={{
      width: '100%',
      borderRadius: '16px',
      border: `1px solid ${colors.divider}`,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { sm: 'stretch' },
      '&:hover': {
        boxShadow: `0 8px 20px ${colors.brandRed}2F`,
        borderColor: colors.brandRed,
        transform: { xs: 'none', sm: 'translateY(-1px)' },
      },
    }}
    onClick={() => onOpen(m.fixtureId)}
  >
    <Box
      sx={{
        width: { xs: '100%', sm: 5 },
        minHeight: { xs: 4, sm: '100%' },
        flexShrink: 0,
        background: `linear-gradient(180deg, ${colors.brandRed}, ${colors.brandDarkRed})`,
      }}
    />
    <CardContent
      sx={{
        flex: 1,
        py: 2,
        px: { xs: 2, sm: 2.5, md: 3 },
        '&:last-child': { pb: 2 },
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        alignItems: { lg: 'center' },
        gap: { xs: 2, lg: 2.5 },
        minWidth: 0,
      }}
    >
      <Box sx={{ flex: { lg: '0 0 260px' }, minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: colors.brandBlack, lineHeight: 1.35 }}>
          {m.matchName}
        </Typography>
        <Typography variant="caption" sx={{ color: colors.textSecondary, mt: 0.5, display: 'block' }}>
          Tap to open match users
        </Typography>
      </Box>
      <Grid container spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
        <Grid item xs={6} sm={4} md={3} lg={2}><Stat label="Users" v={m.totalUsers} /></Grid>
        <Grid item xs={6} sm={4} md={3} lg={2}><Stat label="Predictions" v={m.totalPredictions} /></Grid>
        <Grid item xs={6} sm={4} md={3} lg={2}><Stat label="Partic. %" v={`${m.participationRate}%`} /></Grid>
        <Grid item xs={6} sm={4} md={3} lg={2}><Stat label="Accuracy %" v={`${m.predictionAccuracy}%`} /></Grid>
        <Grid item xs={6} sm={4} md={3} lg={2}><Stat label="SP won" v={m.totalSPWon} /></Grid>
        <Grid item xs={6} sm={4} md={3} lg={2}><Stat label="Perfect" v={m.totalPerfectCount} /></Grid>
        <Grid item xs={6} sm={4} md={3} lg={2}><Stat label="Pred. won" v={m.totalPredictionsWon} /></Grid>
        <Grid item xs={6} sm={4} md={3} lg={2}><Stat label="Pred. lost" v={m.totalPredictionsLost} /></Grid>
        <Grid item xs={6} sm={4} md={3} lg={2}><Stat label="Completion %" v={`${m.completionRate}%`} /></Grid>
      </Grid>
      <KeyboardArrowRight
        sx={{
          color: colors.textSecondary,
          fontSize: 28,
          flexShrink: 0,
          display: { xs: 'none', lg: 'block' },
          alignSelf: 'center',
        }}
      />
    </CardContent>
  </Card>
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
        variant="subtitle2"
        sx={{ fontWeight: 700, color: colors.brandRed, mb: 2, textTransform: 'none', display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <Box component="span" aria-hidden>{titlePrefix}</Box>
        {icon}
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {matches.map((m) => (
          <MatchRowCard key={m.fixtureId} m={m} onOpen={(fid) => navigate(`/predictions/match/${encodeURIComponent(fid)}/users`)} />
        ))}
      </Box>
    </Box>
  );
}

export default PredictionsCmdBreakdownPage;
