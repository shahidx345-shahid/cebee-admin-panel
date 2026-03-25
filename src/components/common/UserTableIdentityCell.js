import React from 'react';
import { Box, Typography } from '@mui/material';
import { Person, Verified } from '@mui/icons-material';
import { colors } from '../../config/theme';

/**
 * Single table cell: avatar + name / username + verified + email (admin user list pattern).
 * @param {boolean} compact — tighter layout for fixed-width tables (no min-width, ellipsis on email).
 */
const UserTableIdentityCell = ({ fullName, username, email, isVerified, compact = false }) => {
  const nameOk = fullName && fullName !== '—';
  const userOk = username && username !== '—';
  const iconSize = compact ? 22 : 28;
  const gap = compact ? 1 : 1.5;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap,
        minWidth: compact ? 0 : { xs: 200, sm: 240 },
        maxWidth: compact ? '100%' : 360,
        py: 0.25,
        overflow: 'hidden',
      }}
    >
      <Person
        sx={{
          fontSize: iconSize,
          color: colors.info,
          flexShrink: 0,
          mt: compact ? 0.1 : 0.125,
        }}
        aria-hidden
      />
      <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
        {nameOk && !compact && (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: colors.brandBlack, lineHeight: 1.35, display: 'block' }}
          >
            {fullName}
          </Typography>
        )}
        {compact && nameOk && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: colors.brandBlack,
              lineHeight: 1.3,
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {fullName}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: nameOk && !compact ? 0.25 : nameOk && compact ? 0.15 : 0 }}>
          <Typography
            variant={nameOk ? 'caption' : 'body2'}
            component="span"
            sx={{
              fontWeight: nameOk ? 600 : 700,
              color: colors.brandBlack,
              lineHeight: 1.35,
              fontSize: compact ? 12 : undefined,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: compact ? '100%' : undefined,
            }}
          >
            {userOk ? username : '—'}
          </Typography>
          {isVerified && (
            <Verified
              sx={{ fontSize: compact ? 16 : 18, color: colors.info, flexShrink: 0 }}
              titleAccess="Verified"
            />
          )}
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: colors.textSecondary,
            display: 'block',
            mt: compact ? 0.2 : 0.35,
            lineHeight: 1.35,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: compact ? 'nowrap' : 'normal',
            wordBreak: compact ? 'normal' : 'break-all',
          }}
        >
          {email && email !== '—' ? email : '—'}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserTableIdentityCell;
