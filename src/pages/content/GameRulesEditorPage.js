import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
} from '@mui/material';
import { Book, Edit as EditIcon, CheckCircle, Close, Description, Tag, Info } from '@mui/icons-material';
import { colors } from '../../config/theme';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { format } from 'date-fns';

// Static default content
const defaultContent = `<h1>CeBee Predict Rules & Fair Play</h1>

<h2>100% Skill-Based. 0% Betting.</h2>

<p>CeBee Predict is a skill-based prediction platform. There is no betting or gambling involved.</p>

<h2>SP (Skill Points) Rules</h2>

<ul>
  <li>Users earn SP by making accurate predictions</li>
  <li>SP is virtual and has no monetary value</li>
  <li>SP can be redeemed for rewards at month-end</li>
  <li>SP cannot be transferred or sold</li>
</ul>

<h2>Prediction Structure</h2>

<ul>
  <li><strong>Match Selection:</strong> Choose from available football matches</li>
  <li><strong>Make Prediction:</strong> Predict the outcome (Home Win, Draw, Away Win)</li>
  <li><strong>Submit Before Deadline:</strong> All predictions must be submitted before match kickoff</li>
  <li><strong>Earn SP:</strong> Correct predictions earn SP based on match difficulty</li>
</ul>

<h2>Fair Play Principles</h2>

<ul>
  <li>One account per user</li>
  <li>No bots or automated predictions allowed</li>
  <li>Manipulating predictions is strictly prohibited</li>
  <li>All predictions are final once submitted</li>
</ul>

<h2>Monthly Leaderboard</h2>

<ul>
  <li>Leaderboard ranks users by total SP earned</li>
  <li>Top performers win rewards</li>
  <li>Rewards are non-monetary (merchandise, vouchers, etc.)</li>
  <li>Winners are announced on the first day of next month</li>
</ul>

<h2>Account Suspension</h2>

<p>Accounts may be suspended for:</p>

<ul>
  <li>Multiple accounts</li>
  <li>Using bots or automation</li>
  <li>Attempting to manipulate the system</li>
  <li>Violating fair play principles</li>
</ul>

<p>For questions, contact <strong>support@ceebeepredict.com</strong></p>`;

const GameRulesEditorPage = () => {
  const [content, setContent] = useState(defaultContent);
  const [title, setTitle] = useState('Rules & Fair Play');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [version, setVersion] = useState('1.0');
  const [updatedAt, setUpdatedAt] = useState(new Date('2026-01-12'));
  const [status, setStatus] = useState('published');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = () => {
    try {
      setLoading(true);
      // Load from localStorage if available
      const savedContent = localStorage.getItem('gameRulesContent');
      const savedTitle = localStorage.getItem('gameRulesTitle');
      const savedVersion = localStorage.getItem('gameRulesVersion');
      const savedDate = localStorage.getItem('gameRulesUpdatedAt');
      
      if (savedContent) {
        setContent(savedContent);
        setTitle(savedTitle || 'Rules & Fair Play');
        setVersion(savedVersion || '1.0');
        setUpdatedAt(savedDate ? new Date(savedDate) : new Date('2026-01-12'));
      } else {
        // Use default content
        setContent(defaultContent);
        setTitle('Rules & Fair Play');
        setVersion('1.0');
        setUpdatedAt(new Date('2026-01-12'));
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
      localStorage.setItem('gameRulesContent', content);
      localStorage.setItem('gameRulesTitle', title);
      localStorage.setItem('gameRulesVersion', version);
      const newDate = new Date();
      localStorage.setItem('gameRulesUpdatedAt', newDate.toISOString());
      
      setUpdatedAt(newDate);
      setStatus('published');
      setIsModalOpen(false);
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
      {/* Game Rules Document Section */}
      <Card
        sx={{
          padding: 3,
          borderRadius: '20px',
          backgroundColor: '#E3F2FD',
          border: `1px solid #90CAF9`,
          boxShadow: 'none',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '14px',
              backgroundColor: '#BBDEFB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Info sx={{ fontSize: 28, color: '#2196F3' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.75, fontSize: 18 }}>
              Game Rules Document
            </Typography>
            <Typography variant="body2" sx={{ color: '#737373', fontSize: 14, lineHeight: 1.5 }}>
              Single live document covering SP rules, prediction structure, and fair play principles. Only one
              version can be published at a time.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 2.5 }}>
          <Chip
            label={`Version: ${version}`}
            size="small"
            sx={{
              backgroundColor: '#2196F3',
              color: colors.brandWhite,
              fontWeight: 600,
              fontSize: 13,
              height: 34,
              borderRadius: '20px',
              px: 0.5,
            }}
          />
          <Chip
            label={updatedAt ? `Updated: ${format(updatedAt, 'MMM dd, yyyy')}` : 'Updated: Not yet'}
            size="small"
            sx={{
              backgroundColor: '#4CAF50',
              color: colors.brandWhite,
              fontWeight: 600,
              fontSize: 13,
              height: 34,
              borderRadius: '20px',
              px: 0.5,
            }}
          />
          <Chip
            label={status.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: '#F44336',
              color: colors.brandWhite,
              fontWeight: 600,
              fontSize: 13,
              height: 34,
              borderRadius: '20px',
              px: 0.5,
            }}
          />
        </Box>
      </Card>

      {/* Game Rules Preview Section */}
      <Card
        sx={{
          padding: 3,
          borderRadius: '20px',
          backgroundColor: '#FFF5F5',
          border: `1px solid #FFCDD2`,
          boxShadow: 'none',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
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
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 0.5, fontSize: 18 }}>
                Game Rules Preview
              </Typography>
              <Typography variant="body2" sx={{ color: '#737373', fontSize: 14 }}>
                Review the current game rules
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon sx={{ fontSize: 18 }} />}
            onClick={handleEditClick}
            sx={{
              backgroundColor: colors.brandRed,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 15,
              px: 3,
              py: 1.25,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: colors.brandDarkRed,
                boxShadow: 'none',
              },
            }}
          >
            Edit
          </Button>
        </Box>

        <Box
          sx={{
            mt: 3,
            padding: 4,
            borderRadius: '20px',
            backgroundColor: colors.brandWhite,
            border: `1px solid ${colors.divider}26`,
            minHeight: '500px',
            maxWidth: '900px',
            margin: '24px auto 0',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.brandBlack, mb: 1.5, fontSize: 26 }}>
              {title}
            </Typography>
            {updatedAt && (
              <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: 14 }}>
                Version {version} • Updated {format(updatedAt, 'MMM dd, yyyy')}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              '& .ql-editor': {
                padding: 0,
              },
              '& h1': {
                fontSize: '24px',
                fontWeight: 700,
                color: colors.brandBlack,
                marginBottom: '16px',
                marginTop: '0',
              },
              '& h2': {
                fontSize: '18px',
                fontWeight: 600,
                color: colors.brandBlack,
                marginTop: '24px',
                marginBottom: '12px',
              },
              '& p': {
                lineHeight: 1.7,
                color: '#4A4A4A',
                fontSize: '15px',
                marginBottom: '12px',
              },
              '& ul': {
                paddingLeft: '24px',
                marginBottom: '16px',
              },
              '& li': {
                lineHeight: 1.8,
                color: '#4A4A4A',
                fontSize: '15px',
                marginBottom: '8px',
              },
              '& strong': {
                fontWeight: 600,
                color: colors.brandBlack,
              },
            }}
            dangerouslySetInnerHTML={{ __html: content || '<p>No content available. Click Edit to add content.</p>' }}
          />
        </Box>
      </Card>

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
