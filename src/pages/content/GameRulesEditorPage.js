import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  Grid,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
} from '@mui/material';
import { Info, Book, Edit as EditIcon, CheckCircle, Close, Description, Tag } from '@mui/icons-material';
import { colors } from '../../config/theme';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';

const GameRulesEditorPage = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Rules & Fair Play');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [version, setVersion] = useState('1.0');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [status, setStatus] = useState('published');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const contentRef = doc(db, 'content', 'gameRules');
      const contentDoc = await getDoc(contentRef);
      if (contentDoc.exists()) {
        const data = contentDoc.data();
        setContent(data.content || '');
        setTitle(data.title || 'Rules & Fair Play');
        setVersion(data.version || '1.0');
        setStatus(data.status || 'published');
        if (data.updatedAt) {
          const date = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
          setUpdatedAt(date);
        }
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
      const contentRef = doc(db, 'content', 'gameRules');
      const newVersion = parseFloat(version) + 0.1;
      await updateDoc(contentRef, {
        content,
        title,
        version: newVersion.toFixed(1),
        status: 'published',
        updatedAt: serverTimestamp(),
      });
      setVersion(newVersion.toFixed(1));
      setStatus('published');
      setUpdatedAt(new Date());
      setIsEditing(false);
      setIsModalOpen(false);
      await loadContent();
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
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
      <Grid container spacing={3}>
        {/* Game Rules Document Section */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '20px',
              backgroundColor: `${colors.info}0D`,
              border: `1.5px solid ${colors.info}26`,
              boxShadow: `0 4px 12px ${colors.info}14`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: colors.info,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Info sx={{ fontSize: 24, color: colors.brandWhite }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
                  Game Rules Document
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                  Single live document covering SP rules, prediction structure, and fair play principles. Only one
                  version can be published at a time.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 3 }}>
              <Chip
                label={`Version: ${version}`}
                size="small"
                sx={{
                  backgroundColor: colors.info,
                  color: colors.brandWhite,
                  fontWeight: 600,
                  fontSize: 12,
                  borderRadius: '20px',
                }}
              />
              <Chip
                label={
                  updatedAt ? `Updated: ${format(updatedAt, 'MMM dd, yyyy')}` : 'Updated: Not yet'
                }
                size="small"
                sx={{
                  backgroundColor: colors.success,
                  color: colors.brandWhite,
                  fontWeight: 600,
                  fontSize: 12,
                  borderRadius: '20px',
                }}
              />
              <Chip
                label={status.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: colors.brandRed,
                  color: colors.brandWhite,
                  fontWeight: 600,
                  fontSize: 12,
                  borderRadius: '20px',
                }}
              />
            </Box>
          </Card>
        </Grid>

        {/* Game Rules Preview Section */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '20px',
              backgroundColor: `${colors.brandRed}0D`,
              border: `1.5px solid ${colors.brandRed}26`,
              boxShadow: `0 4px 12px ${colors.brandRed}14`,
              position: 'relative',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: colors.brandRed,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Book sx={{ fontSize: 24, color: colors.brandWhite }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
                    Game Rules Preview
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                    Review the current game rules
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEditClick}
                sx={{
                  background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  py: 1,
                }}
              >
                Edit
              </Button>
            </Box>

            <Box
              sx={{
                mt: 3,
                padding: 3,
                borderRadius: '16px',
                backgroundColor: colors.brandWhite,
                border: `1px solid ${colors.divider}33`,
                minHeight: '400px',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 2 }}>
                {title}
              </Typography>
              {updatedAt && (
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3, fontSize: 14 }}>
                  Version {version} • Updated {format(updatedAt, 'MMM dd, yyyy')}
                </Typography>
              )}
              <Box
                sx={{
                  '& .ql-editor': {
                    padding: 0,
                  },
                }}
                dangerouslySetInnerHTML={{ __html: content || '<p>No content available. Click Edit to add content.</p>' }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Game Rules Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleModalClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  backgroundColor: colors.brandRed,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Book sx={{ fontSize: 24, color: colors.brandWhite }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
                  Edit Game Rules
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                  Make changes to the game rules document
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleModalClose}
              sx={{
                border: `1.5px solid ${colors.divider}66`,
                borderRadius: '12px',
                color: colors.textSecondary,
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Title Field */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontSize: 14 }}>
                Title
              </Typography>
              <TextField
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Rules & Fair Play"
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, color: colors.brandRed }}>
                      <Typography sx={{ fontSize: 16, fontWeight: 600 }}>Aa</Typography>
                    </Box>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    backgroundColor: colors.brandWhite,
                    '& fieldset': {
                      borderColor: `${colors.divider}66`,
                    },
                  },
                }}
              />
            </Box>

            {/* Version Field */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontSize: 14 }}>
                Version
              </Typography>
              <TextField
                fullWidth
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0"
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, color: colors.brandRed }}>
                      <Tag sx={{ fontSize: 18 }} />
                    </Box>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    backgroundColor: colors.brandWhite,
                    '& fieldset': {
                      borderColor: `${colors.divider}66`,
                    },
                  },
                }}
              />
            </Box>

            {/* Content Field (Markdown supported) */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Description sx={{ fontSize: 18, color: colors.brandRed }} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
                  Content (Markdown supported)
                </Typography>
              </Box>
              <Box
                sx={{
                  '& .ql-container': {
                    minHeight: '400px',
                    backgroundColor: colors.brandWhite,
                  },
                  '& .ql-editor': {
                    minHeight: '400px',
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
                  placeholder="Enter game rules content (Markdown supported)..."
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['code-block'],
                      ['clean'],
                    ],
                  }}
                  formats={['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'code-block']}
                />
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleModalClose}
                sx={{
                  borderColor: colors.divider,
                  color: colors.textSecondary,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                }}
              >
                {saving ? 'Saving...' : 'Save & Publish'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GameRulesEditorPage;
