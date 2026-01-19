import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, Chip, Grid, CircularProgress } from '@mui/material';
import { Star, StarBorder, Edit as EditIcon, CheckCircle } from '@mui/icons-material';
import { colors } from '../../config/theme';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';

const AppFeaturesEditorPage = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [version, setVersion] = useState('1.0');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [status, setStatus] = useState('published');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const contentRef = doc(db, 'content', 'appFeatures');
      const contentDoc = await getDoc(contentRef);
      if (contentDoc.exists()) {
        const data = contentDoc.data();
        setContent(data.content || '');
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
      const contentRef = doc(db, 'content', 'appFeatures');
      const newVersion = parseFloat(version) + 0.1;
      await updateDoc(contentRef, {
        content,
        version: newVersion.toFixed(1),
        status: 'published',
        updatedAt: serverTimestamp(),
      });
      setVersion(newVersion.toFixed(1));
      setStatus('published');
      setUpdatedAt(new Date());
      setIsEditing(false);
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
      <Grid container spacing={3}>
        {/* App Features / How It Works Section */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              padding: 3,
              borderRadius: '20px',
              backgroundColor: `${colors.success}0D`,
              border: `1.5px solid ${colors.success}26`,
              boxShadow: `0 4px 12px ${colors.success}14`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: `2px solid ${colors.success}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StarBorder sx={{ fontSize: 28, color: colors.success }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
                  App Features / How It Works
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                  Explains how predictions work, how SP is earned, how monthly winners are selected, and what
                  rewards are. Basic text formatting only, no images or videos.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 3 }}>
              <Chip
                label={`Version: ${version}`}
                size="small"
                sx={{
                  backgroundColor: `${colors.success}1A`,
                  color: colors.success,
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
                  backgroundColor: `${colors.info}1A`,
                  color: colors.info,
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

        {/* App Features Preview Section */}
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
                  <Star sx={{ fontSize: 24, color: colors.brandWhite }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5 }}>
                    App Features Preview
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 13 }}>
                    Review app features and how it works
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(!isEditing)}
                sx={{
                  background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  py: 1,
                }}
              >
                {isEditing ? 'Preview' : 'Edit'}
              </Button>
            </Box>

            {isEditing ? (
              <Box sx={{ mt: 3 }}>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  style={{
                    minHeight: '400px',
                    backgroundColor: colors.brandWhite,
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditing(false)}
                    sx={{
                      borderColor: colors.brandRed,
                      color: colors.brandRed,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '12px',
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
                    }}
                  >
                    {saving ? 'Saving...' : 'Save & Publish'}
                  </Button>
                </Box>
              </Box>
            ) : (
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
                  How CeBee Predict Works
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
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AppFeaturesEditorPage;
