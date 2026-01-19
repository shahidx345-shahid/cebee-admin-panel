import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  Select,
  MenuItem,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Menu,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  TrendingUp,
  Schedule,
  CheckCircle,
  Close,
  BarChart,
  Star,
  PlayArrow,
  ArrowUpward,
  ArrowDropDown,
  Person,
  Numbers,
  ArrowUpward as ArrowUp,
  ArrowDownward as ArrowDown,
  MoreVert,
  AccessTime,
  List as ListIcon,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';

const PredictionsPage = () => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ongoing');
  const [selectedSort, setSelectedSort] = useState('dateNewest');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortAnchor, setSortAnchor] = useState(null);
  const [paginationAnchor, setPaginationAnchor] = useState(null);

  const totalPredictions = predictions.length;
  const ongoingCount = predictions.filter((p) => (p.status || p.predictionStatus) === 'ongoing').length;
  const completedCount = predictions.filter((p) => 
    (p.status || p.predictionStatus) === 'correct' || (p.status || p.predictionStatus) === 'incorrect'
  ).length;
  const correctCount = predictions.filter((p) => (p.status || p.predictionStatus) === 'correct').length;
  const accuracyRate = totalPredictions > 0 ? ((correctCount / totalPredictions) * 100).toFixed(1) : '0.0';

  useEffect(() => {
    loadPredictions();
  }, []);

  useEffect(() => {
    filterAndSortPredictions();
  }, [predictions, searchQuery, selectedStatus, selectedSort]);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const predictionsRef = collection(db, 'predictions');
      const q = query(predictionsRef, orderBy('predictionTime', 'desc'));
      const snapshot = await getDocs(q);
      const predictionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPredictions(predictionsData);
      setFilteredPredictions(predictionsData);
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPredictions = () => {
    let filtered = [...predictions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (pred) =>
          pred.username?.toLowerCase().includes(query) ||
          pred.userEmail?.toLowerCase().includes(query) ||
          pred.id?.toLowerCase().includes(query) ||
          pred.fixtureId?.toLowerCase().includes(query) ||
          pred.matchName?.toLowerCase().includes(query)
      );
    }

    if (selectedStatus === 'ongoing') {
      filtered = filtered.filter((pred) => {
        const status = pred.status || pred.predictionStatus;
        return status === 'ongoing';
      });
    } else if (selectedStatus === 'completed') {
      filtered = filtered.filter((pred) => {
        const status = pred.status || pred.predictionStatus;
        return status === 'correct' || status === 'incorrect';
      });
    }

    switch (selectedSort) {
      case 'dateNewest':
        filtered.sort((a, b) => {
          const dateA = a.predictionTime?.toDate ? a.predictionTime.toDate() : new Date(a.predictionTime);
          const dateB = b.predictionTime?.toDate ? b.predictionTime.toDate() : new Date(b.predictionTime);
          return dateB - dateA;
        });
        break;
      case 'dateOldest':
        filtered.sort((a, b) => {
          const dateA = a.predictionTime?.toDate ? a.predictionTime.toDate() : new Date(a.predictionTime);
          const dateB = b.predictionTime?.toDate ? b.predictionTime.toDate() : new Date(b.predictionTime);
          return dateA - dateB;
        });
        break;
      case 'usernameAZ':
        filtered.sort((a, b) => (a.username || '').localeCompare(b.username || ''));
        break;
      case 'usernameZA':
        filtered.sort((a, b) => (b.username || '').localeCompare(a.username || ''));
        break;
      case 'spHighest':
        filtered.sort((a, b) => (b.spAwarded || 0) - (a.spAwarded || 0));
        break;
      case 'spLowest':
        filtered.sort((a, b) => (a.spAwarded || 0) - (b.spAwarded || 0));
        break;
      default:
        break;
    }

    setFilteredPredictions(filtered);
  };

  const getStatusChip = (status) => {
    const statusMap = {
      ongoing: 'ONGOING',
      correct: 'CORRECT',
      incorrect: 'INCORRECT',
      pending: 'PENDING',
    };
    const label = statusMap[status] || 'ONGOING';
    
    return (
      <Chip
        label={label}
        size="small"
        sx={{
          backgroundColor: colors.brandWhite,
          color: colors.brandRed,
          border: `1.5px solid ${colors.brandRed}`,
          fontWeight: 600,
          fontSize: 11,
          height: 28,
          borderRadius: '6px',
        }}
      />
    );
  };

  const getTypeChip = (type) => {
    const typeMap = {
      'correct_score': { label: 'Correct Score', icon: Numbers },
      'goal_range': { label: 'Goal Range', icon: 'arrows' },
      'match_result': { label: 'Match Result', icon: TrendingUp },
      'both_teams_score': { label: 'Both Teams Score', icon: CheckCircle },
    };
    
    const config = typeMap[type] || typeMap['correct_score'];
    const Icon = config.icon === 'arrows' ? null : config.icon;

    return (
      <Chip
        icon={Icon ? <Icon sx={{ fontSize: 14 }} /> : (
          <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 0.8 }}>
            <ArrowUp sx={{ fontSize: 10 }} />
            <ArrowDown sx={{ fontSize: 10 }} />
          </Box>
        )}
        label={config.label}
        size="small"
        sx={{
          backgroundColor: colors.brandWhite,
          color: colors.warning,
          border: `1.5px solid ${colors.warning}`,
          fontWeight: 600,
          fontSize: 11,
          height: 28,
          borderRadius: '6px',
          '& .MuiChip-icon': {
            color: colors.warning,
          },
        }}
      />
    );
  };

  const columns = [
    {
      id: 'predictionId',
      label: 'Pred. ID',
      render: (_, row) => (
        <Chip
          label={row.id || 'N/A'}
          size="small"
          sx={{
            backgroundColor: colors.brandWhite,
            color: colors.brandRed,
            border: `1.5px solid ${colors.brandRed}`,
            fontWeight: 600,
            fontSize: 11,
            height: 28,
            borderRadius: '6px',
          }}
        />
      ),
    },
    {
      id: 'username',
      label: 'Username',
      render: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person sx={{ fontSize: 18, color: colors.info }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
            {row.username || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'match',
      label: 'Match',
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: colors.brandBlack }}>
          {row.matchName || `${row.homeTeam || 'TBD'} vs ${row.awayTeam || 'TBD'}`}
        </Typography>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      render: (_, row) => getTypeChip(row.predictionType || row.type || 'correct_score'),
    },
    {
      id: 'prediction',
      label: 'Prediction',
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: colors.brandBlack }}>
          {row.prediction || row.selectedTeam || row.predictionText || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'predictionTime',
      label: 'Date & Time',
      render: (value) => {
        if (!value) return 'N/A';
        const date = value?.toDate ? value.toDate() : new Date(value);
        return format(date, 'MMM dd, yyyy HH:mm');
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => getStatusChip(row.status || row.predictionStatus || 'ongoing'),
    },
    {
      id: 'sp',
      label: 'SP',
      render: (_, row) => {
        const status = row.status || row.predictionStatus || 'ongoing';
        const spValue = row.spAwarded || row.spTotal || 0;
        
        if (status === 'ongoing') {
          return (
            <Chip
              icon={<AccessTime sx={{ fontSize: 14 }} />}
              label="Pending"
              size="small"
              sx={{
                backgroundColor: `${colors.warning}14`,
                color: colors.warning,
                border: `1.5px solid ${colors.warning}`,
                fontWeight: 600,
                fontSize: 11,
                height: 28,
                borderRadius: '6px',
                '& .MuiChip-icon': {
                  color: colors.warning,
                },
              }}
            />
          );
        }
        
        return (
          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack }}>
            {spValue.toLocaleString()}
          </Typography>
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <IconButton
          size="small"
          sx={{
            backgroundColor: `${colors.brandRed}14`,
            color: colors.brandRed,
            width: 32,
            height: 32,
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: `${colors.brandRed}26`,
            },
          }}
        >
          <MoreVert sx={{ fontSize: 18 }} />
        </IconButton>
      ),
    },
  ];

  const paginatedPredictions = filteredPredictions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );


  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* View Only Notice */}
      <Alert
        severity="info"
        icon={<Visibility sx={{ fontSize: 20 }} />}
        sx={{
          mb: 3,
          borderRadius: '12px',
          backgroundColor: `${colors.info}26`,
          border: `1.5px solid ${colors.info}4D`,
          py: 1,
          '& .MuiAlert-icon': {
            color: colors.info,
          },
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, color: colors.info, fontSize: 14, mb: 0.5 }}>
          View Only Mode
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
          Predictions are immutable audit records. No edit or delete actions available.
        </Typography>
      </Alert>

      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: colors.brandBlack,
          fontSize: { xs: 24, md: 28 },
          mb: 3,
        }}
      >
        Predictions Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '20px',
              boxShadow: `0 6px 18px ${colors.brandRed}40`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box
                sx={{
                  padding: 1.25,
                  backgroundColor: `${colors.brandWhite}33`,
                  borderRadius: '12px',
                }}
              >
                <BarChart sx={{ fontSize: 24, color: colors.brandWhite }} />
              </Box>
              <Chip
                label="+12.5%"
                size="small"
                icon={<ArrowUpward sx={{ fontSize: 14 }} />}
                sx={{
                  backgroundColor: `${colors.brandRed}DD`,
                  color: colors.brandWhite,
                  height: 24,
                  fontSize: 11,
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: colors.brandWhite,
                  },
                }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandWhite, mb: 0.5 }}>
              {totalPredictions}
            </Typography>
            <Typography variant="body2" sx={{ color: `${colors.brandWhite}DD`, fontSize: 13 }}>
              Total Predictions
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: colors.brandWhite,
              border: `1.5px solid ${colors.info}26`,
              borderRadius: '20px',
              boxShadow: `0 6px 14px ${colors.info}1F`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box
                sx={{
                  padding: 1.25,
                  backgroundColor: `${colors.info}1F`,
                  borderRadius: '12px',
                }}
              >
                <Star sx={{ fontSize: 24, color: colors.info }} />
              </Box>
              <Chip
                label="+8.2%"
                size="small"
                icon={<ArrowUpward sx={{ fontSize: 14 }} />}
                sx={{
                  backgroundColor: `${colors.success}1A`,
                  color: colors.success,
                  height: 24,
                  fontSize: 11,
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: colors.success,
                  },
                }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {accuracyRate}%
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Accuracy Rate
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: colors.brandWhite,
              border: `1.5px solid ${colors.warning}26`,
              borderRadius: '20px',
              boxShadow: `0 6px 14px ${colors.warning}1F`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box
                sx={{
                  padding: 1.25,
                  backgroundColor: `${colors.warning}1F`,
                  borderRadius: '12px',
                }}
              >
                <PlayArrow sx={{ fontSize: 24, color: colors.warning }} />
              </Box>
              <Chip
                label="+15.3%"
                size="small"
                icon={<ArrowUpward sx={{ fontSize: 14 }} />}
                sx={{
                  backgroundColor: `${colors.success}1A`,
                  color: colors.success,
                  height: 24,
                  fontSize: 11,
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: colors.success,
                  },
                }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {ongoingCount}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Ongoing Predictions
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            sx={{
              padding: 2.5,
              background: colors.brandWhite,
              border: `1.5px solid ${colors.success}26`,
              borderRadius: '20px',
              boxShadow: `0 6px 14px ${colors.success}1F`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box
                sx={{
                  padding: 1.25,
                  backgroundColor: `${colors.success}1F`,
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle sx={{ fontSize: 24, color: colors.success }} />
              </Box>
              <Chip
                label="+5.1%"
                size="small"
                icon={<ArrowUpward sx={{ fontSize: 14 }} />}
                sx={{
                  backgroundColor: `${colors.success}1A`,
                  color: colors.success,
                  height: 24,
                  fontSize: 11,
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: colors.success,
                  },
                }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
              {completedCount}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
              Completed Predictions
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Status Toggle Buttons */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={selectedStatus}
          exclusive
          onChange={(e, newValue) => {
            if (newValue !== null) setSelectedStatus(newValue);
          }}
          sx={{
            '& .MuiToggleButton-root': {
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              border: `1.5px solid ${colors.divider}66`,
              '&.Mui-selected': {
                backgroundColor: colors.brandRed,
                color: colors.brandWhite,
                borderColor: colors.brandRed,
                '&:hover': {
                  backgroundColor: colors.brandRed,
                },
              },
            },
          }}
        >
          <ToggleButton value="ongoing">
            <PlayArrow sx={{ fontSize: 18, mr: 1 }} />
            Ongoing Predictions
          </ToggleButton>
          <ToggleButton value="completed">
            <CheckCircle sx={{ fontSize: 18, mr: 1 }} />
            Completed Predictions
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Search and Sort Bar */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by username, email, prediction ID, fixture ID, match name..."
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowDropDown sx={{ fontSize: 18, color: colors.brandRed }} />}
          endIcon={<ArrowDropDown sx={{ fontSize: 18, color: colors.brandRed }} />}
          onClick={(e) => setSortAnchor(e.currentTarget)}
          sx={{
            borderColor: `${colors.brandRed}33`,
            color: colors.brandBlack,
            backgroundColor: `${colors.brandRed}0D`,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1,
          }}
        >
          Date: {selectedSort === 'dateNewest' ? 'Newest First' : 'Oldest First'}
        </Button>
        <Menu
          anchorEl={sortAnchor}
          open={Boolean(sortAnchor)}
          onClose={() => setSortAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 200,
              boxShadow: `0 4px 12px ${colors.shadow}33`,
            },
          }}
        >
          <MenuItem onClick={() => { setSelectedSort('dateNewest'); setSortAnchor(null); }}>
            Date: Newest First
          </MenuItem>
          <MenuItem onClick={() => { setSelectedSort('dateOldest'); setSortAnchor(null); }}>
            Date: Oldest First
          </MenuItem>
        </Menu>
      </Box>

      {/* Predictions List Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              padding: 0.75,
              backgroundColor: colors.brandRed,
              borderRadius: '8px',
            }}
          >
            <BarChart sx={{ fontSize: 18, color: colors.brandWhite }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: colors.brandBlack,
              fontSize: 18,
            }}
          >
            Predictions List
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.textSecondary,
              fontSize: 13,
              ml: 1,
            }}
          >
            {filteredPredictions.length} predictions found
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ListIcon sx={{ fontSize: 16 }} />}
          endIcon={<ArrowDropDown sx={{ fontSize: 16 }} />}
          onClick={(e) => setPaginationAnchor(e.currentTarget)}
          sx={{
            borderColor: colors.brandRed,
            color: colors.brandBlack,
            backgroundColor: colors.brandWhite,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 0.75,
            fontSize: 13,
          }}
        >
          {rowsPerPage} / page
        </Button>
        <Menu
          anchorEl={paginationAnchor}
          open={Boolean(paginationAnchor)}
          onClose={() => setPaginationAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 150,
              boxShadow: `0 4px 12px ${colors.shadow}33`,
            },
          }}
        >
          <MenuItem onClick={() => { setRowsPerPage(10); setPage(0); setPaginationAnchor(null); }}>
            10 / page
          </MenuItem>
          <MenuItem onClick={() => { setRowsPerPage(25); setPage(0); setPaginationAnchor(null); }}>
            25 / page
          </MenuItem>
          <MenuItem onClick={() => { setRowsPerPage(50); setPage(0); setPaginationAnchor(null); }}>
            50 / page
          </MenuItem>
          <MenuItem onClick={() => { setRowsPerPage(100); setPage(0); setPaginationAnchor(null); }}>
            100 / page
          </MenuItem>
        </Menu>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedPredictions}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredPredictions.length}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onRowClick={(row) => navigate(`/predictions/details/${row.id}`)}
        emptyMessage="No predictions found"
      />
    </Box>
  );
};

export default PredictionsPage;
