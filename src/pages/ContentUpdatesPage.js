import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import {
  Help,
  Book,
  Lightbulb,
  Description,
  Shield,
} from '@mui/icons-material';
import { colors } from '../config/theme';
import FaqManagementPage from './content/FaqManagementPage';
import GameRulesEditorPage from './content/GameRulesEditorPage';
import AppFeaturesEditorPage from './content/AppFeaturesEditorPage';
import TermsConditionsEditorPage from './content/TermsConditionsEditorPage';
import PrivacyPolicyEditorPage from './content/PrivacyPolicyEditorPage';

const ContentUpdatesPage = () => {
  const [selectedSection, setSelectedSection] = useState('faq');

  const sections = [
    { value: 'faq', label: 'FAQ', icon: Help, color: colors.brandRed },
    { value: 'rules', label: 'Rules & Fair Play', icon: Book, color: colors.info },
    { value: 'features', label: 'How It Works', icon: Lightbulb, color: colors.success },
    { value: 'terms', label: 'Terms', icon: Description, color: colors.warning },
    { value: 'privacy', label: 'Privacy', icon: Shield, color: colors.info },
  ];

  const renderContent = () => {
    switch (selectedSection) {
      case 'faq':
        return <FaqManagementPage />;
      case 'rules':
        return <GameRulesEditorPage />;
      case 'features':
        return <AppFeaturesEditorPage />;
      case 'terms':
        return <TermsConditionsEditorPage />;
      case 'privacy':
        return <PrivacyPolicyEditorPage />;
      default:
        return <FaqManagementPage />;
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3, width: '100%' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: colors.brandBlack,
            fontSize: { xs: 24, md: 28 },
            mb: 1,
          }}
        >
          Content & App Updates
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: 14 }}>
          Manage FAQ, Rules & Fair Play, How It Works, Terms & Privacy
        </Typography>
      </Box>

      {/* Section Tabs */}
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          width: '100%',
          backgroundColor: colors.brandWhite,
          borderRadius: '20px',
          padding: '6px',
          gap: '6px',
        }}
      >
        {sections.map((section, index) => {
          const isSelected = selectedSection === section.value;
          const Icon = section.icon;
          return (
            <Button
              key={section.value}
              startIcon={<Icon sx={{ fontSize: 22 }} />}
              onClick={() => setSelectedSection(section.value)}
              sx={{
                flex: 1,
                borderRadius: '16px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 16,
                px: 2.5,
                py: 2,
                backgroundColor: isSelected ? section.color : 'transparent',
                color: isSelected ? colors.brandWhite : '#6B7280',
                border: 'none',
                boxShadow: isSelected ? `0 4px 12px ${section.color}40` : 'none',
                minWidth: 0,
                '&:hover': {
                  backgroundColor: isSelected ? section.color : '#F5F5F5',
                },
                '& .MuiSvgIcon-root': {
                  color: isSelected ? colors.brandWhite : section.color,
                  fontSize: '22px',
                },
              }}
            >
              {section.label}
            </Button>
          );
        })}
      </Box>

      {/* Content */}
      <Box sx={{ width: '100%' }}>{renderContent()}</Box>
    </Box>
  );
};

export default ContentUpdatesPage;
