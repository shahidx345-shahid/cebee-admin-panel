import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CircularProgress } from '@mui/material';
import { Save, Info } from '@mui/icons-material';
import { colors } from '../../config/theme';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const PrivacyPolicyEditorPage = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const contentRef = doc(db, 'content', 'privacyPolicy');
      const contentDoc = await getDoc(contentRef);
      if (contentDoc.exists()) {
        setContent(contentDoc.data().content || '');
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const contentRef = doc(db, 'content', 'privacyPolicy');
      await updateDoc(contentRef, {
        content,
        updatedAt: serverTimestamp(),
      });
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
      {/* Info Banner */}
      <Card
        sx={{
          padding: 2,
          mb: 3,
          borderRadius: '12px',
          backgroundColor: `${colors.info}1A`,
          border: `1px solid ${colors.info}33`,
          boxShadow: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: colors.info,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Info sx={{ fontSize: 18, color: colors.brandWhite }} />
          </Box>
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 14 }}>
            Rich text only – Basic formatting supported (bold, italic, lists). No images, videos, or custom styling.
          </Typography>
        </Box>
      </Card>

      {/* Editor Card */}
      <Card
        sx={{
          padding: 3,
          borderRadius: '20px',
          backgroundColor: colors.brandWhite,
          border: `1.5px solid ${colors.divider}26`,
          boxShadow: `0 4px 12px ${colors.shadow}14`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack }}>
            Privacy Policy
          </Typography>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Content'}
          </Button>
        </Box>

        <Box
          sx={{
            '& .ql-container': {
              minHeight: '500px',
              backgroundColor: colors.brandWhite,
            },
            '& .ql-editor': {
              minHeight: '500px',
            },
            '& .ql-editor.ql-blank::before': {
              fontStyle: 'normal',
              color: colors.textSecondary,
              fontSize: 14,
            },
          }}
        >
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="Enter privacy policy content..."
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
      </Card>
    </Box>
  );
};

export default PrivacyPolicyEditorPage;
