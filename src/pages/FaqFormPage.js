import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../config/firebase';

const FaqFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'gettingStarted',
    status: 'draft',
    order: 0,
  });

  useEffect(() => {
    const loadFaqData = async () => {
      try {
        setLoading(true);
        const faqRef = doc(db, 'content', 'faq', 'items', id);
        const faqDoc = await getDoc(faqRef);
        if (faqDoc.exists()) {
          const data = faqDoc.data();
          setFormData({
            question: data.question || '',
            answer: data.answer || '',
            category: data.category || 'gettingStarted',
            status: data.status || 'draft',
            order: data.order || 0,
          });
        }
      } catch (error) {
        console.error('Error loading FAQ:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      loadFaqData();
    } else {
      setLoading(false);
    }
  }, [id, isEditMode]);



  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const faqData = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (isEditMode) {
        const faqRef = doc(db, 'content', 'faq', 'items', id);
        await updateDoc(faqRef, faqData);
      } else {
        const faqRef = doc(collection(db, 'content', 'faq', 'items'));
        await setDoc(faqRef, {
          ...faqData,
          createdAt: serverTimestamp(),
        });
      }
      navigate(constants.routes.content);
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Failed to save FAQ');
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
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(constants.routes.content)}
        sx={{ mb: 3, color: colors.brandRed, textTransform: 'none', fontWeight: 600 }}
      >
        Back to Content Updates
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        {isEditMode ? 'Edit FAQ' : 'Add FAQ'}
      </Typography>

      <Card sx={{ padding: 3, borderRadius: '16px' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Question"
              value={formData.question}
              onChange={(e) => handleChange('question', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Answer"
              value={formData.answer}
              onChange={(e) => handleChange('answer', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                label="Category"
              >
                <MenuItem value="gettingStarted">Getting Started</MenuItem>
                <MenuItem value="predictions">Predictions</MenuItem>
                <MenuItem value="rewards">Rewards</MenuItem>
                <MenuItem value="account">Account</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Order"
              value={formData.order}
              onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(constants.routes.content)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.success}DD 100%)`,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {saving ? 'Saving...' : 'Save FAQ'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default FaqFormPage;
