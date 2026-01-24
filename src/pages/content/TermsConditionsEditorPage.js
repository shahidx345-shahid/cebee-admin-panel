import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CircularProgress, Alert, Chip } from '@mui/material';
import { CheckCircle, Info } from '@mui/icons-material';
import { colors } from '../../config/theme';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const TermsConditionsEditorPage = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = () => {
    try {
      setLoading(true);
      // Load from localStorage if available
      const savedContent = localStorage.getItem('termsConditionsContent');

      if (savedContent) {
        setContent(savedContent);
      } else {
        // Start with empty content
        setContent('');
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    try {
      setSaving(true);
      // Save to localStorage
      localStorage.setItem('termsConditionsContent', content);
      const newDate = new Date();
      localStorage.setItem('termsConditionsUpdatedAt', newDate.toISOString());

      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: colors.brandRed }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.brandBlack,
              fontSize: 28,
              mb: 0.5,
            }}
          >
            Terms & Conditions Editor
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: 15 }}>
            Edit your terms & conditions content
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CheckCircle sx={{ fontSize: 18 }} />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            backgroundColor: colors.brandRed,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 15,
            px: 3,
            py: 1.5,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: colors.brandDarkRed,
              boxShadow: 'none',
            },
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* Editor Card */}
      <Card
        sx={{
          padding: 4,
          borderRadius: '24px',
          backgroundColor: colors.brandWhite,
          border: `1px solid #E5E7EB`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Metadata */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
          <Chip label="Version: 1.0" size="small" sx={{ backgroundColor: '#2196F3', color: 'white', fontWeight: 600 }} />
          <Chip label={`Updated: ${new Date().toLocaleDateString()}`} size="small" sx={{ backgroundColor: '#4CAF50', color: 'white', fontWeight: 600 }} />
          <Chip label="PUBLISHED" size="small" sx={{ backgroundColor: '#F44336', color: 'white', fontWeight: 600 }} />
        </Box>

        {/* Info Banner */}
        <Box sx={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Alert
            icon={<Info sx={{ fontSize: 22 }} />}
            severity="info"
            sx={{
              mb: 4,
              borderRadius: '16px',
              backgroundColor: '#DBEAFE',
              border: '1px solid #93C5FD',
              '& .MuiAlert-icon': {
                color: '#2563EB',
              },
              '& .MuiAlert-message': {
                color: '#1E40AF',
                fontSize: 15,
                fontWeight: 500,
              },
            }}
          >
            Rich text only — Basic formatting supported (bold, italic, lists). No images, videos, or custom styling.
          </Alert>

          <Box
            sx={{
              '& .ql-container': {
                minHeight: '500px',
                backgroundColor: colors.brandWhite,
                borderRadius: '0 0 16px 16px',
                border: `1px solid #E5E7EB`,
                borderTop: 'none',
              },
              '& .ql-toolbar': {
                borderRadius: '16px 16px 0 0',
                backgroundColor: '#F9FAFB',
                border: `1px solid #E5E7EB`,
                borderBottom: 'none',
              },
              '& .ql-editor': {
                minHeight: '500px',
                fontSize: 15,
                lineHeight: 1.7,
                padding: '20px',
              },
              '& .ql-editor.ql-blank::before': {
                fontStyle: 'normal',
                color: '#D1D5DB',
                fontSize: 15,
              },
            }}
          >
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              placeholder="Enter terms & conditions content..."
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['clean'],
                ],
              }}
              formats={['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet']}
            />
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default TermsConditionsEditorPage;
