'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Drawer,
  Tabs,
  Tab,
  Switch,
  Slider,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Collapse,
} from '@mui/material';
import {
  AccessibilityNew,
  ExpandLess,
  Visibility,
  MenuBook,
  Mouse,
  VolumeUp,
  ViewComfy,
  TouchApp,
  Close,
  RestartAlt,
} from '@mui/icons-material';
import { useAccessibilityV3 } from '@/context/AccessibilityContextV3';

export default function AccessibilityFooterBar() {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const ctx = useAccessibilityV3();

  return (
    <>
      {/* Fixed Footer Bar */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999999,
          bgcolor: 'background.paper',
          borderTop: '2px solid',
          borderColor: 'primary.main',
        }}
      >
        {/* Collapsed Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            cursor: 'pointer',
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessibilityNew color="primary" />
            <Typography variant="body2" fontWeight="bold">
              Accessibility Settings
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (47 Features Available)
            </Typography>
          </Box>
          <IconButton size="small">
            {expanded ? <ExpandLess /> : <Close sx={{ transform: 'rotate(180deg)' }} />}
          </IconButton>
        </Box>

        {/* Expanded Panel */}
        <Collapse in={expanded}>
          <Divider />
          <Box sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
            {/* Quick Actions */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Button size="small" variant="outlined" onClick={() => ctx.loadProfile('low-vision')}>
                Low Vision
              </Button>
              <Button size="small" variant="outlined" onClick={() => ctx.loadProfile('motor-impairment')}>
                Motor
              </Button>
              <Button size="small" variant="outlined" onClick={() => ctx.loadProfile('cognitive-support')}>
                Cognitive
              </Button>
              <Button size="small" variant="outlined" onClick={ctx.resetAll} color="error" startIcon={<RestartAlt />}>
                Reset
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab icon={<Visibility />} label="Vision" iconPosition="start" />
              <Tab icon={<MenuBook />} label="Reading" iconPosition="start" />
              <Tab icon={<Mouse />} label="Navigation" iconPosition="start" />
              <Tab icon={<VolumeUp />} label="Audio" iconPosition="start" />
              <Tab icon={<ViewComfy />} label="Layout" iconPosition="start" />
              <Tab icon={<TouchApp />} label="Motor" iconPosition="start" />
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {/* Vision Tab */}
              {activeTab === 0 && (
                <>
                  <Box>
                    <Typography variant="caption" fontWeight="bold">Text Size: {ctx.textSize}%</Typography>
                    <Slider value={ctx.textSize} onChange={(e, v) => ctx.setTextSize(v as number)} min={75} max={200} step={5} />
                  </Box>
                  <FormControlLabel
                    control={<Switch checked={ctx.highContrast} onChange={(e) => ctx.setHighContrast(e.target.checked)} />}
                    label="High Contrast"
                  />
                  <FormControlLabel
                    control={<Switch checked={ctx.darkMode} onChange={(e) => ctx.setDarkMode(e.target.checked)} />}
                    label="Dark Mode"
                  />
                  <FormControlLabel
                    control={<Switch checked={ctx.focusIndicators} onChange={(e) => ctx.setFocusIndicators(e.target.checked)} />}
                    label="Focus Indicators"
                  />
                </>
              )}

              {/* Reading Tab */}
              {activeTab === 1 && (
                <>
                  <FormControlLabel
                    control={<Switch checked={ctx.readingRuler} onChange={(e) => ctx.setReadingRuler(e.target.checked)} />}
                    label="Reading Ruler"
                  />
                  <FormControlLabel
                    control={<Switch checked={ctx.readingMask} onChange={(e) => ctx.setReadingMask(e.target.checked)} />}
                    label="Reading Mask"
                  />
                  <FormControlLabel
                    control={<Switch checked={ctx.removeAnimations} onChange={(e) => ctx.setRemoveAnimations(e.target.checked)} />}
                    label="Remove Animations"
                  />
                  <FormControlLabel
                    control={<Switch checked={ctx.linkHighlighting} onChange={(e) => ctx.setLinkHighlighting(e.target.checked)} />}
                    label="Highlight Links"
                  />
                </>
              )}

              {/* Navigation Tab */}
              {activeTab === 2 && (
                <>
                  <FormControlLabel
                    control={<Switch checked={ctx.largeCursor} onChange={(e) => ctx.setLargeCursor(e.target.checked)} />}
                    label="Large Cursor"
                  />
                  <FormControlLabel
                    control={<Switch checked={ctx.keyboardNavigation} onChange={(e) => ctx.setKeyboardNavigation(e.target.checked)} />}
                    label="Keyboard Nav"
                  />
                  <FormControlLabel
                    control={<Switch checked={ctx.scrollToTop} onChange={(e) => ctx.setScrollToTop(e.target.checked)} />}
                    label="Scroll to Top"
                  />
                  <FormControlLabel
                    control={<Switch checked={ctx.stickyHeader} onChange={(e) => ctx.setStickyHeader(e.target.checked)} />}
                    label="Sticky Header"
                  />
                </>
              )}

              {/* Audio Tab */}
              {activeTab === 3 && (
                <>
                  <FormControlLabel
                    control={<Switch checked={ctx.textToSpeech} onChange={(e) => ctx.setTextToSpeech(e.target.checked)} />}
                    label="Text-to-Speech"
                  />
                  <Box>
                    <Typography variant="caption" fontWeight="bold">Speech Rate: {ctx.speechRate}x</Typography>
                    <Slider value={ctx.speechRate} onChange={(e, v) => ctx.setSpeechRate(v as number)} min={0.5} max={2} step={0.1} />
                  </Box>
                  <FormControlLabel
                    control={<Switch checked={ctx.autoReadHeadings} onChange={(e) => ctx.setAutoReadHeadings(e.target.checked)} />}
                    label="Auto-Read Headings"
                  />
                  <FormControlLabel
                    control={<Switch checked={ctx.backgroundSoundMute} onChange={(e) => ctx.setBackgroundSoundMute(e.target.checked)} />}
                    label="Mute Background"
                  />
                </>
              )}

              {/* Layout Tab */}
              {activeTab === 4 && (
                <>
                  <FormControlLabel
                    control={<Switch checked={ctx.headingOutline} onChange={(e) => ctx.setHeadingOutline(e.target.checked)} />}
                    label="Heading Outline"
                  />
                  <FormControlLabel
                    control={<Switch checked={ctx.buttonHighlighting} onChange={(e) => ctx.setButtonHighlighting(e.target.checked)} />}
                    label="Button Highlighting"
                  />
                  <FormControlLabel
                    control={
                      <Select value={ctx.contentWidth} onChange={(e) => ctx.setContentWidth(e.target.value as any)} size="small">
                        <MenuItem value="full">Full Width</MenuItem>
                        <MenuItem value="contained">Contained</MenuItem>
                        <MenuItem value="narrow">Narrow</MenuItem>
                      </Select>
                    }
                    label="Content Width:"
                    labelPlacement="start"
                  />
                </>
              )}

              {/* Motor Tab */}
              {activeTab === 5 && (
                <>
                  <FormControlLabel
                    control={<Switch checked={ctx.bigButtonMode} onChange={(e) => ctx.setBigButtonMode(e.target.checked)} />}
                    label="Big Buttons"
                  />
                  <FormControlLabel
                    control={<Switch checked={ctx.touchTargetSize} onChange={(e) => ctx.setTouchTargetSize(e.target.checked)} />}
                    label="Touch Targets"
                  />
                  <FormControlLabel
                    control={<Switch checked={ctx.oneHandMode} onChange={(e) => ctx.setOneHandMode(e.target.checked)} />}
                    label="One-Hand Mode"
                  />
                  <FormControlLabel
                    control={<Switch checked={ctx.hoverFreeze} onChange={(e) => ctx.setHoverFreeze(e.target.checked)} />}
                    label="Hover Freeze"
                  />
                </>
              )}
            </Box>
          </Box>
        </Collapse>
      </Paper>

      {/* Spacer to prevent content overlap */}
      {!expanded && <Box sx={{ height: 48 }} />}
      {expanded && <Box sx={{ height: 400 }} />}
    </>
  );
}
