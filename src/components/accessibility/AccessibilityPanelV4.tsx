'use client';

import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Switch,
  Slider,
  Button,
  Divider,
  Collapse,
  Fab,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Accessible,
  Close,
  RestartAlt,
  ExpandMore,
  ExpandLess,
  TextFields,
  Visibility,
  ColorLens,
  Navigation,
  Mouse,
  ZoomIn,
  Security,
  Add,
  Remove,
} from '@mui/icons-material';
import { useAccessibilityV4 } from '@/context/AccessibilityContextV4';

interface Feature {
  key: keyof import('@/context/AccessibilityContextV4').AccessibilityState;
  icon: React.ReactNode;
  label: string;
  description: string;
  type: 'toggle' | 'slider';
  min?: number;
  max?: number;
}

interface Category {
  id: string;
  icon: React.ReactNode;
  title: string;
  features: Feature[];
}

export default function AccessibilityPanelV4() {
  const [open, setOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'text',
    'visual',
    'colorVision',
    'content',
    'cursor',
    'spacing',
    'profiles',
  ]);
  const { state, updateState, resetAll, applyProfile } = useAccessibilityV4();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const categories: Category[] = [
    {
      id: 'text',
      icon: <TextFields />,
      title: 'TEXT & TYPOGRAPHY',
      features: [
        {
          key: 'fontSize',
          icon: <TextFields />,
          label: 'Font Size',
          description: 'Increase or decrease text size',
          type: 'slider',
          min: -5,
          max: 10,
        },
        {
          key: 'lineHeight',
          icon: <TextFields />,
          label: 'Line Height',
          description: 'Adjust spacing between lines',
          type: 'slider',
          min: -3,
          max: 10,
        },
        {
          key: 'letterSpacing',
          icon: <TextFields />,
          label: 'Letter Spacing',
          description: 'Adjust space between letters',
          type: 'slider',
          min: -2,
          max: 10,
        },
        {
          key: 'wordSpacing',
          icon: <TextFields />,
          label: 'Word Spacing',
          description: 'Adjust space between words',
          type: 'slider',
          min: -2,
          max: 10,
        },
        {
          key: 'paragraphSpacing',
          icon: <TextFields />,
          label: 'Paragraph Spacing',
          description: 'Adjust space between paragraphs',
          type: 'slider',
          min: 0,
          max: 10,
        },
        {
          key: 'dyslexiaFont',
          icon: <Typography sx={{ fontSize: 16, fontWeight: 'bold' }}>A</Typography>,
          label: 'Dyslexia Friendly Font',
          description: 'Use Lexend Deca for easier reading',
          type: 'toggle',
        },
        {
          key: 'readableFont',
          icon: <Typography sx={{ fontSize: 16 }}>A</Typography>,
          label: 'Readable Font',
          description: 'Switch to Verdana for clarity',
          type: 'toggle',
        },
        {
          key: 'boldText',
          icon: <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>B</Typography>,
          label: 'Bold Text',
          description: 'Make all text bold for visibility',
          type: 'toggle',
        },
        {
          key: 'alignLeft',
          icon: <TextFields />,
          label: 'Align Text Left',
          description: 'Force left alignment on all text',
          type: 'toggle',
        },
        {
          key: 'alignCenter',
          icon: <TextFields />,
          label: 'Align Text Center',
          description: 'Force center alignment on all text',
          type: 'toggle',
        },
      ],
    },
    {
      id: 'visual',
      icon: <Visibility />,
      title: 'VISUAL & DISPLAY',
      features: [
        {
          key: 'highContrast',
          icon: <Visibility />,
          label: 'High Contrast',
          description: 'Increase contrast of all elements',
          type: 'toggle',
        },
        {
          key: 'darkContrast',
          icon: <Visibility />,
          label: 'Dark Contrast',
          description: 'Force dark background, white text',
          type: 'toggle',
        },
        {
          key: 'lightContrast',
          icon: <Visibility />,
          label: 'Light Contrast',
          description: 'Force white background, dark text',
          type: 'toggle',
        },
        {
          key: 'invertColors',
          icon: <ColorLens />,
          label: 'Invert Colors',
          description: 'Reverse all page colors',
          type: 'toggle',
        },
        {
          key: 'monochrome',
          icon: <ColorLens />,
          label: 'Monochrome',
          description: 'Remove all colors (grayscale)',
          type: 'toggle',
        },
        {
          key: 'lowSaturation',
          icon: <ColorLens />,
          label: 'Low Saturation',
          description: 'Reduce color intensity',
          type: 'toggle',
        },
        {
          key: 'highSaturation',
          icon: <ColorLens />,
          label: 'High Saturation',
          description: 'Boost color intensity',
          type: 'toggle',
        },
        {
          key: 'sepia',
          icon: <ColorLens />,
          label: 'Sepia',
          description: 'Warm yellowish tint for less eye strain',
          type: 'toggle',
        },
        {
          key: 'blueLightFilter',
          icon: <ColorLens />,
          label: 'Blue Light Filter',
          description: 'Reduce blue light for night reading',
          type: 'toggle',
        },
      ],
    },
    {
      id: 'colorVision',
      icon: <ColorLens />,
      title: 'COLOR VISION',
      features: [
        {
          key: 'protanopia',
          icon: <ColorLens />,
          label: 'Protanopia Filter',
          description: 'Simulate red-blind color vision',
          type: 'toggle',
        },
        {
          key: 'deuteranopia',
          icon: <ColorLens />,
          label: 'Deuteranopia Filter',
          description: 'Simulate green-blind color vision',
          type: 'toggle',
        },
        {
          key: 'tritanopia',
          icon: <ColorLens />,
          label: 'Tritanopia Filter',
          description: 'Simulate blue-blind color vision',
          type: 'toggle',
        },
      ],
    },
    {
      id: 'content',
      icon: <Navigation />,
      title: 'CONTENT & NAVIGATION',
      features: [
        {
          key: 'highlightLinks',
          icon: <Navigation />,
          label: 'Highlight Links',
          description: 'Add visible outlines to all links',
          type: 'toggle',
        },
        {
          key: 'highlightHeadings',
          icon: <TextFields />,
          label: 'Highlight Headings',
          description: 'Add visible outlines to all headings',
          type: 'toggle',
        },
        {
          key: 'underlineLinks',
          icon: <Navigation />,
          label: 'Underline Links',
          description: 'Force underline on all links',
          type: 'toggle',
        },
        {
          key: 'hideImages',
          icon: <Visibility />,
          label: 'Hide Images',
          description: 'Blur images, SVGs, and videos',
          type: 'toggle',
        },
        {
          key: 'stopAnimations',
          icon: <Navigation />,
          label: 'Stop Animations',
          description: 'Disable all CSS animations/transitions',
          type: 'toggle',
        },
        {
          key: 'muteMedia',
          icon: <Visibility />,
          label: 'Mute All Media',
          description: 'Mute all audio and video elements',
          type: 'toggle',
        },
        {
          key: 'pageStructure',
          icon: <Navigation />,
          label: 'Page Structure',
          description: 'Show page headings and landmarks',
          type: 'toggle',
        },
      ],
    },
    {
      id: 'cursor',
      icon: <Mouse />,
      title: 'CURSOR & READING',
      features: [
        {
          key: 'bigCursor',
          icon: <Mouse />,
          label: 'Big Cursor',
          description: 'Use a larger, colored cursor',
          type: 'toggle',
        },
        {
          key: 'readingGuide',
          icon: <TextFields />,
          label: 'Reading Guide',
          description: 'Show a line that follows your cursor',
          type: 'toggle',
        },
        {
          key: 'readingMask',
          icon: <TextFields />,
          label: 'Reading Mask',
          description: 'Focus on one strip of content',
          type: 'toggle',
        },
        {
          key: 'textMagnifier',
          icon: <ZoomIn />,
          label: 'Text Magnifier',
          description: 'Hover over text to magnify it',
          type: 'toggle',
        },
        {
          key: 'focusIndicator',
          icon: <Mouse />,
          label: 'Focus Indicator',
          description: 'Strong visible focus outlines',
          type: 'toggle',
        },
        {
          key: 'keyboardNav',
          icon: <Navigation />,
          label: 'Keyboard Navigation',
          description: 'Highlight keyboard focus styles',
          type: 'toggle',
        },
        {
          key: 'tooltipHelper',
          icon: <TextFields />,
          label: 'Tooltip Helper',
          description: 'Show tooltips on title attributes',
          type: 'toggle',
        },
        {
          key: 'screenReader',
          icon: <Visibility />,
          label: 'Screen Reader (TTS)',
          description: 'Select text and hear it read aloud',
          type: 'toggle',
        },
      ],
    },
    {
      id: 'spacing',
      icon: <ZoomIn />,
      title: 'SPACING & LAYOUT',
      features: [
        {
          key: 'pageZoom',
          icon: <ZoomIn />,
          label: 'Page Zoom',
          description: 'Zoom the entire page in or out',
          type: 'slider',
          min: -5,
          max: 10,
        },
        {
          key: 'narrowContent',
          icon: <TextFields />,
          label: 'Narrow Content Width',
          description: 'Limit content to 720px for readability',
          type: 'toggle',
        },
      ],
    },
    {
      id: 'profiles',
      icon: <Security />,
      title: 'ACCESSIBILITY PROFILES',
      features: [
        {
          key: 'seizureSafe',
          icon: <Security />,
          label: 'Seizure Safe Profile',
          description: 'Remove flashing, GIFs, and animations',
          type: 'toggle',
        },
        {
          key: 'adhdFriendly',
          icon: <Security />,
          label: 'ADHD Friendly Profile',
          description: 'Reduce distractions, narrow focus area',
          type: 'toggle',
        },
        {
          key: 'cognitiveProfile',
          icon: <Security />,
          label: 'Cognitive Profile',
          description: 'Larger text, more spacing, easier reading',
          type: 'toggle',
        },
      ],
    },
  ];

  const totalFeatures = categories.reduce((acc, cat) => acc + cat.features.length, 0);
  const activeFeatures = Object.values(state).filter(
    (v) => typeof v === 'boolean' && v === true || typeof v === 'number' && v !== 0
  ).length;

  return (
    <>
      {/* FAB Button */}
      <Fab
        color="primary"
        aria-label="accessibility"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 999998,
        }}
      >
        <Badge badgeContent={activeFeatures} color="secondary">
          <Accessible />
        </Badge>
      </Fab>

      {/* Accessibility Panel Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 400 },
              bgcolor: '#1a1a2e',
              color: '#ffffff',
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#4a4a8e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Accessible />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Accessibility Panel
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {totalFeatures} features · Customize your browsing experience
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={resetAll}
            fullWidth
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            Reset All
          </Button>
          <Button
            variant="outlined"
            onClick={() => setOpen(false)}
            fullWidth
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            Hide Widget
          </Button>
        </Box>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

        {/* Categories */}
        <Box sx={{ overflowY: 'auto', flex: 1, pb: 2 }}>
          {categories.map((category) => (
            <Box key={category.id}>
              <Box
                onClick={() => toggleCategory(category.id)}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {category.icon}
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                    {category.title}
                  </Typography>
                </Box>
                {expandedCategories.includes(category.id) ? <ExpandLess /> : <ExpandMore />}
              </Box>

              <Collapse in={expandedCategories.includes(category.id)}>
                <Box sx={{ px: 2, pb: 1 }}>
                  {category.features.map((feature) => (
                    <Box
                      key={feature.key as string}
                      sx={{
                        py: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <Box sx={{ color: '#64b5f6', fontSize: 20 }}>{feature.icon}</Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {feature.label}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.7rem' }}>
                          {feature.description}
                        </Typography>
                      </Box>
                      {feature.type === 'toggle' ? (
                        <Switch
                          checked={!!state[feature.key as keyof typeof state]}
                          onChange={(e) =>
                            updateState({ [feature.key]: e.target.checked })
                          }
                          size="small"
                        />
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const current = Number(state[feature.key as keyof typeof state]) || 0;
                              const newValue = Math.max(feature.min || -10, current - 1);
                              updateState({ [feature.key]: newValue });
                            }}
                            sx={{ color: 'white', padding: 0.5 }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" sx={{ minWidth: 20, textAlign: 'center' }}>
                            {Number(state[feature.key as keyof typeof state]) || 0}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const current = Number(state[feature.key as keyof typeof state]) || 0;
                              const newValue = Math.min(feature.max || 10, current + 1);
                              updateState({ [feature.key]: newValue });
                            }}
                            sx={{ color: 'white', padding: 0.5 }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Collapse>
              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            </Box>
          ))}
        </Box>

        {/* Quick Profile Buttons */}
        <Box sx={{ p: 2, bgcolor: '#0f0f1e' }}>
          <Typography variant="caption" sx={{ opacity: 0.6, mb: 1, display: 'block' }}>
            Quick Apply Profiles:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => applyProfile('seizureSafe')}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Seizure Safe
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => applyProfile('adhdFriendly')}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              ADHD
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => applyProfile('cognitive')}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Cognitive
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
