import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  Select,
} from '@mui/material';
import { Add, Help, MoreVert } from '@mui/icons-material';
import { colors } from '../../config/theme';
import DataTable from '../../components/common/DataTable';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

const FaqManagementPage = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFaq, setSelectedFaq] = useState(null);

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      setLoading(true);
      const faqsRef = collection(db, 'content', 'faq', 'items');
      const q = query(faqsRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const faqsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFaqs(faqsData);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (faqId) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await deleteDoc(doc(db, 'content', 'faq', 'items', faqId));
        await loadFaqs();
      } catch (error) {
        console.error('Error deleting FAQ:', error);
      }
    }
  };

  const handleMenuOpen = (event, faq) => {
    setAnchorEl(event.currentTarget);
    setSelectedFaq(faq);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFaq(null);
  };

  const handleEdit = () => {
    if (selectedFaq) {
      navigate(`/content-updates/faq/edit/${selectedFaq.id}`);
    }
    handleMenuClose();
  };

  const handleDeleteFromMenu = () => {
    if (selectedFaq) {
      handleDelete(selectedFaq.id);
    }
    handleMenuClose();
  };

  const columns = [
    {
      id: 'id',
      label: 'FAQ ID',
      render: (_, row) => (
        <Chip
          label={row.faqId || `FAQ_${String(row.order || 0).padStart(3, '0')}`}
          size="small"
          sx={{
            backgroundColor: `${colors.divider}26`,
            color: colors.textSecondary,
            fontWeight: 600,
            fontSize: 12,
            borderRadius: '8px',
          }}
        />
      ),
    },
    {
      id: 'question',
      label: 'Question',
      render: (value, row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.brandBlack, mb: 0.25 }}>
            {value || 'N/A'}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: colors.textSecondary, fontSize: 12 }}
            noWrap
          >
            {row.answer?.substring(0, 60) || 'N/A'}...
          </Typography>
        </Box>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      render: (value) => (
        <Chip
          label={value || 'Getting Started'}
          size="small"
          sx={{
            backgroundColor: `${colors.brandRed}1A`,
            color: colors.brandRed,
            fontWeight: 600,
            fontSize: 12,
            borderRadius: '8px',
          }}
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => {
        const status = row.status || 'published';
        return (
          <Chip
            label={status.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: colors.success,
              color: colors.brandWhite,
              fontWeight: 600,
              fontSize: 11,
              borderRadius: '20px',
            }}
          />
        );
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

  const paginatedFaqs = faqs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* FAQ Management Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, width: '100%' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
            FAQ Management
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
            Manage frequently asked questions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/content-updates/faq/add')}
          sx={{
            background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
          }}
        >
          Add FAQ
        </Button>
      </Box>

      {/* FAQs List Header */}
      <Card
        sx={{
          padding: 2.5,
          mb: 2,
          borderRadius: '16px',
          backgroundColor: colors.brandWhite,
          border: `1.5px solid ${colors.divider}26`,
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                backgroundColor: colors.brandRed,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Help sx={{ fontSize: 24, color: colors.brandWhite }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.25 }}>
                FAQs List
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                {faqs.length} FAQs found
              </Typography>
            </Box>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{
                borderRadius: '12px',
                '& .MuiSelect-icon': {
                  color: colors.brandRed,
                },
              }}
            >
              <MenuItem value={10}>10 / page</MenuItem>
              <MenuItem value={25}>25 / page</MenuItem>
              <MenuItem value={50}>50 / page</MenuItem>
              <MenuItem value={100}>100 / page</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      <DataTable
        columns={columns}
        data={paginatedFaqs}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={faqs.length}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        emptyMessage="No FAQs found"
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: 180,
            boxShadow: `0 4px 12px ${colors.shadow}33`,
          },
        }}
      >
        <MenuItem onClick={handleEdit}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Edit
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleDeleteFromMenu} sx={{ color: colors.error }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Delete
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FaqManagementPage;
