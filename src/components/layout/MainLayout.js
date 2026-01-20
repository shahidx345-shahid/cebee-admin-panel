import React, { useState, useEffect } from 'react';
import { Box, Drawer, AppBar, Toolbar, IconButton, Badge, Fade } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import SideMenu from './SideMenu';
import TopBar from './TopBar';
import { constants, colors } from '../../config/theme';

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const location = useLocation();
  const isDesktop = window.innerWidth >= constants.breakpoints.tablet;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    setFadeIn(false);
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.backgroundLight }}>
      {/* Side Menu */}
      {isDesktop ? (
        <Box
          component="nav"
          sx={{
            width: constants.sideMenuWidth,
            flexShrink: 0,
          }}
        >
          <SideMenu />
        </Box>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: constants.sideMenuWidth,
            },
          }}
        >
          <SideMenu />
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Top Bar */}
        <TopBar onMenuClick={handleDrawerToggle} isMobile={!isDesktop} />

        {/* Page Content */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            padding: { xs: 2, md: 3 },
            backgroundColor: colors.backgroundLight,
            overflow: 'auto',
          }}
        >
          <Fade in={fadeIn} timeout={600}>
            <Box 
              sx={{ 
                width: '100%', 
                maxWidth: '100%',
                animation: fadeIn ? 'fadeInUp 0.6s ease-out' : 'none',
                '@keyframes fadeInUp': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(20px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              {children}
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
