import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Chip,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Menu,
  ListItemText,
} from '@mui/material';
import {
  Add,
  SportsSoccer,
  CheckCircle,
  Stadium,
  AccessTime,
  List as ListIcon,
  Lock,
  MoreVert,
  ArrowDropDown,
  ArrowUpward,
  ArrowDownward,
  Edit,
  Delete,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
// Firebase imports removed
import { db } from '../config/firebase';
import { format } from 'date-fns';

const LeaguesPage = () => {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState([]);
  const [filteredLeagues, setFilteredLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('dateNewest');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [dateFilterAnchor, setDateFilterAnchor] = useState(null);
  const [typeFilterAnchor, setTypeFilterAnchor] = useState(null);

  const loadLeagues = async () => {
    setLoading(true);
    // Directly use sample data
    const leaguesData = getSampleLeagues();
    setLeagues(leaguesData);
    setFilteredLeagues(leaguesData);
    setLoading(false);
  };

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    const filterAndSortLeagues = () => {
      let filtered = [...leagues];

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (league) =>
            league.name?.toLowerCase().includes(query) ||
            league.id?.toLowerCase().includes(query)
        );
      }

      // Type filter
      if (typeFilter !== 'all') {
        filtered = filtered.filter((league) => league.type === typeFilter);
      }

      // Sort
      switch (selectedSort) {
        case 'nameAZ':
          filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          break;
        case 'nameZA':
          filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
          break;
        case 'typeAZ':
          filtered.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
          break;
        case 'typeZA':
          filtered.sort((a, b) => (b.type || '').localeCompare(a.type || ''));
          break;
        case 'dateNewest':
          filtered.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateB - dateA;
          });
          break;
        case 'dateOldest':
          filtered.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateA - dateB;
          });
          break;
        default:
          break;
      }

      setFilteredLeagues(filtered);
    };
    filterAndSortLeagues();
  }, [leagues, searchQuery, typeFilter, selectedSort]);

  const getSampleLeagues = () => {
    return [
      {
        id: 'LEAGUE_001',
        name: 'Africa Cup of Nations',
        type: 'International',
        isActive: false,
        createdAt: new Date('2025-11-26'),
      },
      {
        id: 'LEAGUE_002',
        name: 'UEFA Europa League',
        type: 'International',
        isActive: false,
        createdAt: new Date('2025-11-21'),
      },
      {
        id: 'LEAGUE_003',
        name: 'Premier League',
        type: 'Domestic',
        isActive: true,
        createdAt: new Date('2025-10-15'),
      },
      {
        id: 'LEAGUE_004',
        name: 'La Liga',
        type: 'Domestic',
        isActive: true,
        createdAt: new Date('2025-10-12'),
      },
      {
        id: 'LEAGUE_005',
        name: 'Bundesliga',
        type: 'Domestic',
        isActive: true,
        createdAt: new Date('2025-10-10'),
      },
      {
        id: 'LEAGUE_006',
        name: 'Serie A',
        type: 'Domestic',
        isActive: true,
        createdAt: new Date('2025-10-08'),
      },
      {
        id: 'LEAGUE_007',
        name: 'Ligue 1',
        type: 'Domestic',
        isActive: true,
        createdAt: new Date('2025-10-05'),
      },
      {
        id: 'LEAGUE_008',
        name: 'Champions League',
        type: 'International',
        isActive: false,
        createdAt: new Date('2025-09-20'),
      },
    ];
  };



  const toggleLeagueStatus = async (league) => {
    try {
      // Check if we're trying to activate and already have 5 active leagues
      const activeCount = leagues.filter((l) => l.isActive).length;
      if (!league.isActive && activeCount >= 5) {
        alert('Maximum 5 active leagues allowed');
        return;
      }

      // Mock update - Update local state
      const updatedLeagues = leagues.map(l =>
        l.id === league.id ? { ...l, isActive: !l.isActive } : l
      );
      setLeagues(updatedLeagues);
      setFilteredLeagues(updatedLeagues);

      console.log('Mock: Toggled league status for', league.name);
    } catch (error) {
      console.error('Error toggling league status:', error);
    }
  };

  const handleMenuOpen = (event, league) => {
    setAnchorEl(event.currentTarget);
    setSelectedLeague(league);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLeague(null);
  };

  const activeCount = leagues.filter((l) => l.isActive).length;

  const columns = [
    {
      id: 'logo',
      label: 'Logo',
      render: () => (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '8px',
            backgroundColor: colors.backgroundLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SportsSoccer sx={{ fontSize: 24, color: colors.textSecondary }} />
        </Box>
      ),
    },
    {
      id: 'name',
      label: 'Name',
      render: (value, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
          {row.name || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      render: (value, row) => (
        <Chip
          label={row.type || 'N/A'}
          size="small"
          sx={{
            backgroundColor: '#ed6c02',
            color: colors.brandWhite,
            fontWeight: 600,
            fontSize: 11,
            height: 24,
          }}
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Switch
            checked={row.isActive || false}
            onChange={() => toggleLeagueStatus(row)}
            size="small"
            disabled={activeCount >= 5 && !row.isActive}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: colors.success,
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: colors.success,
              },
            }}
          />
          <Lock sx={{ fontSize: 16, color: colors.textSecondary }} />
        </Box>
      ),
    },
    {
      id: 'createdAt',
      label: 'Created Date',
      render: (value) => {
        if (!value) return 'N/A';
        const date = value?.toDate ? value.toDate() : new Date(value);
        return format(date, 'MMM dd, yyyy');
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleMenuOpen(e, row);
          }}
          sx={{
            backgroundColor: colors.brandRed,
            color: colors.brandWhite,
            width: 32,
            height: 32,
            '&:hover': {
              backgroundColor: colors.brandDarkRed,
            },
          }}
        >
          <MoreVert sx={{ fontSize: 18 }} />
        </IconButton>
      ),
    },
  ];

  const paginatedLeagues = filteredLeagues.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              backgroundColor: colors.brandRed,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stadium sx={{ fontSize: 24, color: colors.brandWhite }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: colors.brandBlack,
                fontSize: { xs: 24, md: 28 },
                mb: 0.25,
              }}
            >
              League Management
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.textSecondary,
                fontSize: 13,
              }}
            >
              Manage football leagues and competitions (Max 5 active)
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Search and Add Button */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '300px' } }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search leagues..."
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/leagues/add')}
          sx={{
            background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            py: 1.25,
          }}
        >
          Add League
        </Button>
      </Box>

      {/* Filter Chips */}
      <Box sx={{ display: 'flex', gap: 0, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<AccessTime sx={{ fontSize: 18 }} />}
          endIcon={<ArrowDropDown sx={{ fontSize: 18 }} />}
          onClick={(e) => setDateFilterAnchor(e.currentTarget)}
          sx={{
            flex: 1,
            borderColor: '#FFE5E5',
            color: colors.brandBlack,
            backgroundColor: '#FFF5F5',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1,
            minWidth: 'auto',
            '&:hover': {
              backgroundColor: '#FFE5E5',
              borderColor: '#FFE5E5',
            },
          }}
        >
          {selectedSort === 'nameAZ' ? 'Name: A-Z' :
            selectedSort === 'nameZA' ? 'Name: Z-A' :
              selectedSort === 'typeAZ' ? 'Type: A-Z' :
                selectedSort === 'typeZA' ? 'Type: Z-A' :
                  selectedSort === 'dateNewest' ? 'Date: Newest' :
                    selectedSort === 'dateOldest' ? 'Date: Oldest' : 'Date: Newest'}
        </Button>
        <Menu
          anchorEl={dateFilterAnchor}
          open={Boolean(dateFilterAnchor)}
          onClose={() => setDateFilterAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 200,
              boxShadow: `0 4px 12px ${colors.shadow}33`,
              mt: 1,
            },
          }}
        >
          <MenuItem
            onClick={() => { setSelectedSort('nameAZ'); setDateFilterAnchor(null); }}
            sx={{
              backgroundColor: selectedSort === 'nameAZ' ? `${colors.brandRed}14` : 'transparent',
              '&:hover': { backgroundColor: `${colors.brandRed}08` },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowDownward sx={{ fontSize: 16, color: colors.textSecondary }} />
                <ListIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
              </Box>
              <Typography sx={{ flex: 1, fontWeight: selectedSort === 'nameAZ' ? 600 : 500 }}>
                Name: A-Z
              </Typography>
              {selectedSort === 'nameAZ' && (
                <CheckCircle sx={{ fontSize: 18, color: colors.brandRed }} />
              )}
            </Box>
          </MenuItem>
          <MenuItem
            onClick={() => { setSelectedSort('nameZA'); setDateFilterAnchor(null); }}
            sx={{
              backgroundColor: selectedSort === 'nameZA' ? `${colors.brandRed}14` : 'transparent',
              '&:hover': { backgroundColor: `${colors.brandRed}08` },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowUpward sx={{ fontSize: 16, color: colors.textSecondary }} />
                <ListIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
              </Box>
              <Typography sx={{ flex: 1, fontWeight: selectedSort === 'nameZA' ? 600 : 500 }}>
                Name: Z-A
              </Typography>
              {selectedSort === 'nameZA' && (
                <CheckCircle sx={{ fontSize: 18, color: colors.brandRed }} />
              )}
            </Box>
          </MenuItem>
          <MenuItem
            onClick={() => { setSelectedSort('typeAZ'); setDateFilterAnchor(null); }}
            sx={{
              backgroundColor: selectedSort === 'typeAZ' ? `${colors.brandRed}14` : 'transparent',
              '&:hover': { backgroundColor: `${colors.brandRed}08` },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
              <ArrowDownward sx={{ fontSize: 16, color: colors.textSecondary }} />
              <Typography sx={{ flex: 1, fontWeight: selectedSort === 'typeAZ' ? 600 : 500 }}>
                Type: A-Z
              </Typography>
              {selectedSort === 'typeAZ' && (
                <CheckCircle sx={{ fontSize: 18, color: colors.brandRed }} />
              )}
            </Box>
          </MenuItem>
          <MenuItem
            onClick={() => { setSelectedSort('typeZA'); setDateFilterAnchor(null); }}
            sx={{
              backgroundColor: selectedSort === 'typeZA' ? `${colors.brandRed}14` : 'transparent',
              '&:hover': { backgroundColor: `${colors.brandRed}08` },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
              <ArrowUpward sx={{ fontSize: 16, color: colors.textSecondary }} />
              <Typography sx={{ flex: 1, fontWeight: selectedSort === 'typeZA' ? 600 : 500 }}>
                Type: Z-A
              </Typography>
              {selectedSort === 'typeZA' && (
                <CheckCircle sx={{ fontSize: 18, color: colors.brandRed }} />
              )}
            </Box>
          </MenuItem>
          <MenuItem
            onClick={() => { setSelectedSort('dateNewest'); setDateFilterAnchor(null); }}
            sx={{
              backgroundColor: selectedSort === 'dateNewest' ? `${colors.brandRed}14` : 'transparent',
              '&:hover': { backgroundColor: `${colors.brandRed}08` },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 16, color: colors.textSecondary }} />
                <ArrowDownward sx={{ fontSize: 16, color: colors.textSecondary }} />
              </Box>
              <Typography sx={{ flex: 1, fontWeight: selectedSort === 'dateNewest' ? 600 : 500 }}>
                Date: Newest
              </Typography>
              {selectedSort === 'dateNewest' && (
                <CheckCircle sx={{ fontSize: 18, color: colors.brandRed }} />
              )}
            </Box>
          </MenuItem>
          <MenuItem
            onClick={() => { setSelectedSort('dateOldest'); setDateFilterAnchor(null); }}
            sx={{
              backgroundColor: selectedSort === 'dateOldest' ? `${colors.brandRed}14` : 'transparent',
              '&:hover': { backgroundColor: `${colors.brandRed}08` },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 16, color: colors.textSecondary }} />
                <ArrowUpward sx={{ fontSize: 16, color: colors.textSecondary }} />
              </Box>
              <Typography sx={{ flex: 1, fontWeight: selectedSort === 'dateOldest' ? 600 : 500 }}>
                Date: Oldest
              </Typography>
              {selectedSort === 'dateOldest' && (
                <CheckCircle sx={{ fontSize: 18, color: colors.brandRed }} />
              )}
            </Box>
          </MenuItem>
        </Menu>
        <Button
          variant="outlined"
          startIcon={<ListIcon sx={{ fontSize: 18 }} />}
          endIcon={<ArrowDropDown sx={{ fontSize: 18 }} />}
          onClick={(e) => setTypeFilterAnchor(e.currentTarget)}
          sx={{
            flex: 1,
            borderColor: '#FFE5E5',
            color: colors.brandBlack,
            backgroundColor: '#FFF5F5',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1,
            minWidth: 'auto',
            '&:hover': {
              backgroundColor: '#FFE5E5',
              borderColor: '#FFE5E5',
            },
          }}
        >
          {typeFilter === 'all' ? 'All Types' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
        </Button>
        <Menu
          anchorEl={typeFilterAnchor}
          open={Boolean(typeFilterAnchor)}
          onClose={() => setTypeFilterAnchor(null)}
        >
          <MenuItem onClick={() => { setTypeFilter('all'); setTypeFilterAnchor(null); }}>
            All Types
          </MenuItem>
          <MenuItem onClick={() => { setTypeFilter('domestic'); setTypeFilterAnchor(null); }}>
            Domestic
          </MenuItem>
          <MenuItem onClick={() => { setTypeFilter('international'); setTypeFilterAnchor(null); }}>
            International
          </MenuItem>
          <MenuItem onClick={() => { setTypeFilter('cup'); setTypeFilterAnchor(null); }}>
            Cup
          </MenuItem>
        </Menu>
        <Chip
          icon={
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: colors.success,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle sx={{ fontSize: 14, color: colors.brandWhite }} />
            </Box>
          }
          label={`Active: ${activeCount}/5`}
          sx={{
            flex: 1,
            backgroundColor: '#FFF5F5',
            borderColor: '#FFE5E5',
            border: '1px solid',
            color: colors.brandBlack,
            fontWeight: 600,
            fontSize: 13,
            height: 36,
            borderRadius: '20px',
            minWidth: 'auto',
            justifyContent: 'flex-start',
            '& .MuiChip-icon': {
              marginLeft: 1,
              marginRight: 0.5,
            },
            '& .MuiChip-label': {
              paddingLeft: 0.5,
              paddingRight: 1.5,
            },
          }}
        />
      </Box>

      {/* Leagues List Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            padding: 0.75,
            backgroundColor: colors.brandRed,
            borderRadius: '8px',
          }}
        >
          <ListIcon sx={{ fontSize: 18, color: colors.brandWhite }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: colors.brandBlack,
            fontSize: 18,
          }}
        >
          Leagues List
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: colors.textSecondary,
            fontSize: 13,
            ml: 1,
          }}
        >
          {filteredLeagues.length} leagues found
        </Typography>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedLeagues}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredLeagues.length}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        emptyMessage="No leagues found"
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: 220,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            padding: 0.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            if (selectedLeague) {
              navigate(`/leagues/edit/${selectedLeague.id}`);
            }
            handleMenuClose();
          }}
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              backgroundColor: `${colors.warning}0D`,
            },
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: '#FFF3E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <Edit sx={{ fontSize: 18, color: '#FF9800' }} />
          </Box>
          <Typography sx={{ flex: 1, fontWeight: 600, color: colors.brandBlack }}>Edit League</Typography>
          <KeyboardArrowRight sx={{ fontSize: 18, color: colors.textSecondary }} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            // TODO: Add delete confirmation dialog
          }}
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              backgroundColor: `${colors.error}0D`,
            },
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: '#FFEBEE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <Delete sx={{ fontSize: 18, color: colors.error }} />
          </Box>
          <Typography sx={{ flex: 1, fontWeight: 600, color: colors.brandBlack }}>Delete League</Typography>
          <KeyboardArrowRight sx={{ fontSize: 18, color: colors.textSecondary }} />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LeaguesPage;
