'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Fab,
  Drawer,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Switch,
  Slider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Tooltip,
  Alert,
} from '@mui/material';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MouseIcon from '@mui/icons-material/Mouse';
import ImageIcon from '@mui/icons-material/Image';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAccessibilityV2 } from '@/context/AccessibilityContextV2';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`a11y-tabpanel-${index}`}
      aria-labelledby={`a11y-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AccessibilityWidgetV2() {
  const a11y = useAccessibilityV2();
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [profileName, setProfileName] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Apply CSS classes based on state
  useEffect(() => {
    const body = document.body;
    const classList = body.classList;

    // Clear all a11y classes first
    const classes = Array.from(classList).filter(c => c.startsWith('a11y-'));
    classes.forEach(c => classList.remove(c));

    // Vision & Display
    classList.add(`a11y-text-size-${a11y.textSize}`);
    classList.add(`a11y-line-height-${a11y.lineHeight}`);
    classList.add(`a11y-letter-spacing-${a11y.letterSpacing}`);
    classList.add(`a11y-word-spacing-${a11y.wordSpacing}`);
    if (a11y.textAlignment !== 'default') classList.add(`a11y-text-align-${a11y.textAlignment}`);
    if (a11y.fontFamily !== 'default') classList.add(`a11y-font-${a11y.fontFamily}`);
    if (a11y.highContrast) classList.add('a11y-high-contrast');
    if (a11y.contrastTheme !== 'none') classList.add(`a11y-contrast-${a11y.contrastTheme}`);
    if (a11y.invertColors) classList.add('a11y-invert-colors');
    if (a11y.grayscaleMode) classList.add('a11y-grayscale');
    if (a11y.darkMode) classList.add('a11y-dark-mode');
    if (a11y.lightMode) classList.add('a11y-light-mode');
    if (a11y.sepiaTone) classList.add('a11y-sepia');
    if (a11y.colorblindFilter !== 'none') classList.add(`a11y-colorblind-${a11y.colorblindFilter}`);

    // Set CSS variables for filters
    document.documentElement.style.setProperty('--a11y-brightness', `${a11y.brightness}%`);
    document.documentElement.style.setProperty('--a11y-saturation', `${a11y.saturation}%`);
    document.documentElement.style.setProperty('--a11y-hue-rotation', `${a11y.hueRotation}deg`);
    if (a11y.brightness !== 100 || a11y.saturation !== 100 || a11y.hueRotation !== 0) {
      classList.add('a11y-filters-active');
    }

    // Reading & Focus
    if (a11y.lineHighlighter) classList.add('a11y-line-highlighter');
    if (a11y.paragraphHighlighter) classList.add('a11y-paragraph-highlighter');

    // Navigation & Control
    if (a11y.largeCursor) classList.add('a11y-cursor-large');
    if (a11y.cursorCrosshair) classList.add('a11y-cursor-crosshair');
    if (a11y.focusIndicators) classList.add('a11y-focus-indicators');
    if (a11y.tabOrderDisplay) classList.add('a11y-tab-order-display');

    // Content Enhancement
    if (a11y.linkUnderlining) classList.add('a11y-link-underline');
    if (a11y.linkIcons) classList.add('a11y-link-icons');
    if (a11y.altTextOverlay) classList.add('a11y-alt-overlay');
    if (a11y.hideImages) classList.add('a11y-hide-images');
    if (a11y.simplifyFonts) classList.add('a11y-simplify-fonts');
    if (a11y.removeAnimations) classList.add('a11y-remove-animations');
    if (a11y.pauseGifs) classList.add('a11y-pause-gifs');
    if (a11y.removeVideos) classList.add('a11y-remove-videos');
    if (a11y.removeBackgrounds) classList.add('a11y-remove-backgrounds');
    if (a11y.removeShadows) classList.add('a11y-remove-shadows');

    // Layout & Structure
    if (a11y.stickyHeader) classList.add('a11y-sticky-header');
    if (a11y.highlightHeaders) classList.add('a11y-highlight-headers');
    if (a11y.highlightButtons) classList.add('a11y-highlight-buttons');

    // Motor & Dexterity
    if (a11y.bigButtonMode) classList.add('a11y-big-buttons');
    if (a11y.touchTargetSize) classList.add('a11y-touch-targets');
    if (a11y.hoverFreeze) classList.add('a11y-hover-freeze');

    // Seizure & Vestibular
    if (a11y.seizureSafeMode) classList.add('a11y-seizure-safe');
    if (a11y.animationFreeze) classList.add('a11y-animation-freeze');
    if (a11y.parallaxDisable) classList.add('a11y-parallax-disable');
    if (a11y.reduceMotion) classList.add('a11y-reduce-motion');

    // Screen Reader Mode
    if (a11y.screenReaderMode) classList.add('a11y-screen-reader-mode');
  }, [a11y]);

  const handleSaveProfile = () => {
    if (profileName.trim()) {
      a11y.saveProfile(profileName, 'Custom profile');
      setProfileName('');
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Fab
        color="primary"
        aria-label="accessibility settings"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 999998,
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
            transform: 'scale(1.1)',
          },
        }}
      >
        <AccessibilityNewIcon sx={{ fontSize: 28 }} />
      </Fab>

      {/* Main Panel */}
      <Drawer
        anchor="right"
        open={open}
        onClose={(event, reason) => {
          // Only close on escape key
          if (reason === 'escapeKeyDown') {
            setOpen(false);
          }
        }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 480 },
              maxWidth: '100vw',
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            p: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AccessibilityNewIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Accessibility Hub
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                101 Professional Features
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Quick Actions Bar */}
        <Box sx={{ p: 2, bgcolor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              label={`Text: ${a11y.textSize}%`}
              size="small"
              color={a11y.textSize !== 100 ? 'primary' : 'default'}
            />
            <Chip
              label={a11y.highContrast ? 'High Contrast' : 'Normal Contrast'}
              size="small"
              color={a11y.highContrast ? 'primary' : 'default'}
            />
            <Chip
              label={a11y.screenReaderMode ? 'Screen Reader' : 'Visual'}
              size="small"
              color={a11y.screenReaderMode ? 'primary' : 'default'}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={a11y.resetAll}
              fullWidth
            >
              Reset All
            </Button>
          </Box>
        </Box>

        {/* Category Tabs */}
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}
        >
          <Tab icon={<VisibilityIcon />} label="Vision" />
          <Tab icon={<MenuBookIcon />} label="Reading" />
          <Tab icon={<MouseIcon />} label="Control" />
          <Tab icon={<ImageIcon />} label="Content" />
          <Tab icon={<ViewAgendaIcon />} label="Layout" />
          <Tab icon={<TouchAppIcon />} label="Motor" />
          <Tab icon={<PsychologyIcon />} label="Cognitive" />
          <Tab icon={<FlashOffIcon />} label="Safety" />
          <Tab icon={<VolumeUpIcon />} label="Audio" />
          <Tab icon={<ZoomInIcon />} label="Advanced" />
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* VISION & DISPLAY */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>
              TEXT ADJUSTMENTS
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography gutterBottom>Text Size: {a11y.textSize}%</Typography>
              <Slider
                value={a11y.textSize}
                onChange={(_, v) => a11y.setTextSize(v as any)}
                min={50}
                max={200}
                step={25}
                marks
                valueLabelDisplay="auto"
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Line Height</InputLabel>
              <Select value={a11y.lineHeight} onChange={(e) => a11y.setLineHeight(e.target.value as any)}>
                <MenuItem value="normal">Normal (1.5)</MenuItem>
                <MenuItem value="large">Large (1.8)</MenuItem>
                <MenuItem value="xl">Extra Large (2.2)</MenuItem>
                <MenuItem value="max">Maximum (2.8)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Letter Spacing</InputLabel>
              <Select value={a11y.letterSpacing} onChange={(e) => a11y.setLetterSpacing(e.target.value as any)}>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="increased">Increased</MenuItem>
                <MenuItem value="wide">Wide</MenuItem>
                <MenuItem value="xwide">Extra Wide</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Font Family</InputLabel>
              <Select value={a11y.fontFamily} onChange={(e) => a11y.setFontFamily(e.target.value as any)}>
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="serif">Serif</MenuItem>
                <MenuItem value="sans-serif">Sans-Serif</MenuItem>
                <MenuItem value="monospace">Monospace</MenuItem>
                <MenuItem value="dyslexic">Dyslexia Friendly</MenuItem>
                <MenuItem value="arial">Arial</MenuItem>
                <MenuItem value="verdana">Verdana</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>
              COLOR & CONTRAST
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>High Contrast</Typography>
              <Switch checked={a11y.highContrast} onChange={(e) => a11y.setHighContrast(e.target.checked)} />
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Contrast Theme</InputLabel>
              <Select value={a11y.contrastTheme} onChange={(e) => a11y.setContrastTheme(e.target.value as any)}>
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="yellow-on-black">Yellow on Black</MenuItem>
                <MenuItem value="white-on-black">White on Black</MenuItem>
                <MenuItem value="black-on-white">Black on White</MenuItem>
                <MenuItem value="black-on-yellow">Black on Yellow</MenuItem>
                <MenuItem value="green-on-black">Green on Black</MenuItem>
                <MenuItem value="blue-on-white">Blue on White</MenuItem>
                <MenuItem value="amber-on-dark">Amber on Dark</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Invert Colors</Typography>
              <Switch checked={a11y.invertColors} onChange={(e) => a11y.setInvertColors(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Grayscale Mode</Typography>
              <Switch checked={a11y.grayscaleMode} onChange={(e) => a11y.setGrayscaleMode(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Sepia Tone</Typography>
              <Switch checked={a11y.sepiaTone} onChange={(e) => a11y.setSepiaTone(e.target.checked)} />
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Colorblind Filter</InputLabel>
              <Select value={a11y.colorblindFilter} onChange={(e) => a11y.setColorblindFilter(e.target.value as any)}>
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="protanopia">Protanopia (Red-Blind)</MenuItem>
                <MenuItem value="deuteranopia">Deuteranopia (Green-Blind)</MenuItem>
                <MenuItem value="tritanopia">Tritanopia (Blue-Blind)</MenuItem>
                <MenuItem value="achromatopsia">Achromatopsia</MenuItem>
                <MenuItem value="blue-cone">Blue-Cone Monochromacy</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography gutterBottom>Brightness: {a11y.brightness}%</Typography>
              <Slider
                value={a11y.brightness}
                onChange={(_, v) => a11y.setBrightness(v as number)}
                min={50}
                max={150}
                valueLabelDisplay="auto"
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography gutterBottom>Saturation: {a11y.saturation}%</Typography>
              <Slider
                value={a11y.saturation}
                onChange={(_, v) => a11y.setSaturation(v as number)}
                min={0}
                max={200}
                valueLabelDisplay="auto"
              />
            </FormControl>
          </TabPanel>

          {/* READING & FOCUS */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>
              READING GUIDES
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Reading Ruler</Typography>
              <Switch checked={a11y.readingRuler} onChange={(e) => a11y.setReadingRuler(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Reading Mask (Focus Slit)</Typography>
              <Switch checked={a11y.readingMask} onChange={(e) => a11y.setReadingMask(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Line Highlighter</Typography>
              <Switch checked={a11y.lineHighlighter} onChange={(e) => a11y.setLineHighlighter(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Paragraph Highlighter</Typography>
              <Switch checked={a11y.paragraphHighlighter} onChange={(e) => a11y.setParagraphHighlighter(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Dyslexia Ruler</Typography>
              <Switch checked={a11y.dyslexiaRuler} onChange={(e) => a11y.setDyslexiaRuler(e.target.checked)} />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>
              TEXT-TO-SPEECH
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Enable Text-to-Speech</Typography>
              <Switch checked={a11y.textToSpeech} onChange={(e) => a11y.setTextToSpeech(e.target.checked)} />
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Speech Rate</InputLabel>
              <Select value={a11y.speechRate} onChange={(e) => a11y.setSpeechRate(e.target.value as any)}>
                <MenuItem value={0.5}>Slow (0.5x)</MenuItem>
                <MenuItem value={1}>Normal (1x)</MenuItem>
                <MenuItem value={1.5}>Fast (1.5x)</MenuItem>
                <MenuItem value={2}>Very Fast (2x)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Voice</InputLabel>
              <Select value={a11y.speechVoice} onChange={(e) => a11y.setSpeechVoice(e.target.value as any)}>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>
          </TabPanel>

          {/* NAVIGATION & CONTROL */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>
              MOUSE & CURSOR
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Large Cursor</Typography>
              <Switch checked={a11y.largeCursor} onChange={(e) => a11y.setLargeCursor(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Cursor Crosshair</Typography>
              <Switch checked={a11y.cursorCrosshair} onChange={(e) => a11y.setCursorCrosshair(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Click Animation</Typography>
              <Switch checked={a11y.clickAnimation} onChange={(e) => a11y.setClickAnimation(e.target.checked)} />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>
              KEYBOARD
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Focus Indicators</Typography>
              <Switch checked={a11y.focusIndicators} onChange={(e) => a11y.setFocusIndicators(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Tab Order Display</Typography>
              <Switch checked={a11y.tabOrderDisplay} onChange={(e) => a11y.setTabOrderDisplay(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Sticky Keys</Typography>
              <Switch checked={a11y.stickyKeys} onChange={(e) => a11y.setStickyKeys(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Slow Keys</Typography>
              <Switch checked={a11y.slowKeys} onChange={(e) => a11y.setSlowKeys(e.target.checked)} />
            </Box>
          </TabPanel>

          {/* CONTENT ENHANCEMENT */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Underline All Links</Typography>
              <Switch checked={a11y.linkUnderlining} onChange={(e) => a11y.setLinkUnderlining(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Link Icons</Typography>
              <Switch checked={a11y.linkIcons} onChange={(e) => a11y.setLinkIcons(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Alt Text Overlay</Typography>
              <Switch checked={a11y.altTextOverlay} onChange={(e) => a11y.setAltTextOverlay(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Hide Images</Typography>
              <Switch checked={a11y.hideImages} onChange={(e) => a11y.setHideImages(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Simplify Fonts</Typography>
              <Switch checked={a11y.simplifyFonts} onChange={(e) => a11y.setSimplifyFonts(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Remove Animations</Typography>
              <Switch checked={a11y.removeAnimations} onChange={(e) => a11y.setRemoveAnimations(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Pause GIFs</Typography>
              <Switch checked={a11y.pauseGifs} onChange={(e) => a11y.setPauseGifs(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Remove Videos</Typography>
              <Switch checked={a11y.removeVideos} onChange={(e) => a11y.setRemoveVideos(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Remove Backgrounds</Typography>
              <Switch checked={a11y.removeBackgrounds} onChange={(e) => a11y.setRemoveBackgrounds(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Remove Shadows</Typography>
              <Switch checked={a11y.removeShadows} onChange={(e) => a11y.setRemoveShadows(e.target.checked)} />
            </Box>
          </TabPanel>

          {/* LAYOUT & STRUCTURE */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Sticky Header</Typography>
              <Switch checked={a11y.stickyHeader} onChange={(e) => a11y.setStickyHeader(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Highlight Headers (H1-H6)</Typography>
              <Switch checked={a11y.highlightHeaders} onChange={(e) => a11y.setHighlightHeaders(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Highlight Buttons</Typography>
              <Switch checked={a11y.highlightButtons} onChange={(e) => a11y.setHighlightButtons(e.target.checked)} />
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography gutterBottom>White Space: {a11y.whiteSpaceControl}%</Typography>
              <Slider
                value={a11y.whiteSpaceControl}
                onChange={(_, v) => a11y.setWhiteSpaceControl(v as number)}
                min={50}
                max={200}
                valueLabelDisplay="auto"
              />
            </FormControl>
          </TabPanel>

          {/* MOTOR & DEXTERITY */}
          <TabPanel value={tabValue} index={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Big Button Mode</Typography>
              <Switch checked={a11y.bigButtonMode} onChange={(e) => a11y.setBigButtonMode(e.target.checked)} />
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Button Size</InputLabel>
              <Select value={a11y.buttonSize} onChange={(e) => a11y.setButtonSize(e.target.value as any)}>
                <MenuItem value={1}>Normal (1x)</MenuItem>
                <MenuItem value={1.5}>Large (1.5x)</MenuItem>
                <MenuItem value={2}>Extra Large (2x)</MenuItem>
                <MenuItem value={3}>Maximum (3x)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Click Delay</InputLabel>
              <Select value={a11y.clickDelay} onChange={(e) => a11y.setClickDelay(e.target.value as any)}>
                <MenuItem value={0}>None</MenuItem>
                <MenuItem value={0.5}>0.5 seconds</MenuItem>
                <MenuItem value={1}>1 second</MenuItem>
                <MenuItem value={1.5}>1.5 seconds</MenuItem>
                <MenuItem value={2}>2 seconds</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Disable Double-Click</Typography>
              <Switch checked={a11y.doubleClickDisable} onChange={(e) => a11y.setDoubleClickDisable(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Touch Target Size (44px)</Typography>
              <Switch checked={a11y.touchTargetSize} onChange={(e) => a11y.setTouchTargetSize(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Hover Freeze</Typography>
              <Switch checked={a11y.hoverFreeze} onChange={(e) => a11y.setHoverFreeze(e.target.checked)} />
            </Box>
          </TabPanel>

          {/* COGNITIVE & LEARNING */}
          <TabPanel value={tabValue} index={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Number Formatting</Typography>
              <Switch checked={a11y.numberFormatting} onChange={(e) => a11y.setNumberFormatting(e.target.checked)} />
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Time Format</InputLabel>
              <Select value={a11y.timeFormat} onChange={(e) => a11y.setTimeFormat(e.target.value as any)}>
                <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                <MenuItem value="24h">24-hour</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Definition Tooltips</Typography>
              <Switch checked={a11y.definitionTooltips} onChange={(e) => a11y.setDefinitionTooltips(e.target.checked)} />
            </Box>
          </TabPanel>

          {/* SEIZURE & VESTIBULAR */}
          <TabPanel value={tabValue} index={7}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              These settings protect users with epilepsy and vestibular disorders
            </Alert>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Seizure Safe Mode</Typography>
              <Switch checked={a11y.seizureSafeMode} onChange={(e) => a11y.setSeizureSafeMode(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Animation Freeze</Typography>
              <Switch checked={a11y.animationFreeze} onChange={(e) => a11y.setAnimationFreeze(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Disable Parallax</Typography>
              <Switch checked={a11y.parallaxDisable} onChange={(e) => a11y.setParallaxDisable(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Reduce Motion</Typography>
              <Switch checked={a11y.reduceMotion} onChange={(e) => a11y.setReduceMotion(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Static Images Only</Typography>
              <Switch checked={a11y.staticImagesOnly} onChange={(e) => a11y.setStaticImagesOnly(e.target.checked)} />
            </Box>
          </TabPanel>

          {/* AUDIO & SOUND */}
          <TabPanel value={tabValue} index={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Mono Audio</Typography>
              <Switch checked={a11y.monoAudio} onChange={(e) => a11y.setMonoAudio(e.target.checked)} />
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography gutterBottom>Volume: {a11y.volumeControl}%</Typography>
              <Slider
                value={a11y.volumeControl}
                onChange={(_, v) => a11y.setVolumeControl(v as number)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Mute Background Sound</Typography>
              <Switch checked={a11y.backgroundSoundMute} onChange={(e) => a11y.setBackgroundSoundMute(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Sound Captions</Typography>
              <Switch checked={a11y.soundCaptions} onChange={(e) => a11y.setSoundCaptions(e.target.checked)} />
            </Box>
          </TabPanel>

          {/* ADVANCED TOOLS */}
          <TabPanel value={tabValue} index={9}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Screen Reader Mode</Typography>
              <Switch checked={a11y.screenReaderMode} onChange={(e) => a11y.setScreenReaderMode(e.target.checked)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Page Magnifier</Typography>
              <Switch checked={a11y.pageMagnifier} onChange={(e) => a11y.setPageMagnifier(e.target.checked)} />
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography gutterBottom>Magnifier Zoom: {a11y.magnifierZoom}x</Typography>
              <Slider
                value={a11y.magnifierZoom}
                onChange={(_, v) => a11y.setMagnifierZoom(v as number)}
                min={2}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </FormControl>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>
              PRESET PROFILES
            </Typography>

            {a11y.profiles.filter(p => p.isPreset).map(profile => (
              <Button
                key={profile.id}
                fullWidth
                variant="outlined"
                onClick={() => a11y.loadProfile(profile.id)}
                sx={{ mb: 1, justifyContent: 'flex-start', textAlign: 'left' }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {profile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {profile.description}
                  </Typography>
                </Box>
              </Button>
            ))}

            {showSaveSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Profile saved successfully!
              </Alert>
            )}
          </TabPanel>
        </Box>
      </Drawer>
    </>
  );
}
