import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Box, Badge } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { constants, colors } from '../../config/theme';
import { getPageIcon, getPageTitle } from '../../utils/pageUtils';

const TopBar = ({ onMenuClick, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const pageIcon = getPageIcon(location.pathname);
  const pageTitle = getPageTitle(location.pathname);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: colors.brandWhite,
        borderBottom: `1.5px solid ${colors.brandRed}14`,
        boxShadow: `0 2px 20px ${colors.brandRed}0F`,
        height: isMobile ? constants.topBarHeightMobile : constants.topBarHeight,
      }}
    >
      <Toolbar
        sx={{
          height: '100%',
          padding: { xs: '0 16px', md: '0 24px' },
        }}
      >
        {/* Menu Button (Mobile only) */}
        {isMobile && (
          <IconButton
            onClick={onMenuClick}
            sx={{
              width: 48,
              height: 48,
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '12px',
              boxShadow: `0 4px 12px ${colors.brandRed}4D`,
              mr: 2,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.brandDarkRed} 0%, ${colors.brandRed} 100%)`,
              },
            }}
          >
            <MenuIcon sx={{ color: colors.brandWhite }} />
          </IconButton>
        )}

        {/* Page Title with Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              padding: '11px',
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '12px',
              boxShadow: `0 4px 12px ${colors.brandRed}4D`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.createElement(pageIcon, {
              sx: { fontSize: 24, color: colors.brandWhite },
            })}
          </Box>
          <Box
            component="h6"
            sx={{
              fontSize: { xs: 18, md: 20 },
              fontWeight: 600,
              color: colors.brandBlack,
              letterSpacing: -0.8,
              margin: 0,
            }}
          >
            {pageTitle}
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            sx={{
              width: 48,
              height: 48,
              background: `linear-gradient(135deg, ${colors.brandWhite} 0%, ${colors.backgroundLight}80 100%)`,
              borderRadius: '12px',
              border: `1.5px solid ${colors.brandRed}1F`,
              boxShadow: `0 2px 10px ${colors.brandRed}14`,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.backgroundLight} 0%, ${colors.brandWhite} 100%)`,
              },
            }}
          >
            <Badge
              badgeContent={3}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
                  border: `2.5px solid ${colors.brandWhite}`,
                  boxShadow: `0 3px 10px ${colors.brandRed}80`,
                },
              }}
            >
              <NotificationsIcon sx={{ fontSize: 20, color: colors.brandRed }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
