'use client';

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Button,
  Slider,
  Switch,
  Divider,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ContrastIcon from '@mui/icons-material/Contrast';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import MotionPhotosOffIcon from '@mui/icons-material/MotionPhotosOff';
import MouseIcon from '@mui/icons-material/Mouse';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import LinkIcon from '@mui/icons-material/Link';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import StraightenIcon from '@mui/icons-material/Straighten';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';

import { useAccessibility, FontScale, LineHeightScale, WordSpacingScale, TextAlignOverride, FontFamilyOverride, ColorBlindnessType, HighContrastTheme, TtsSpeed, TtsPitch } from '@/context/AccessibilityContext';

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    fontScale, setFontScale,
    lineHeightScale, setLineHeightScale,
    wordSpacingScale, setWordSpacingScale,
    textAlign, setTextAlign,
    fontFamilyOverride, setFontFamilyOverride,
    colorBlindness, setColorBlindness,
    highContrastTheme, setHighContrastTheme,
    highContrast, setHighContrast,
    dyslexiaFont, setDyslexiaFont,
    grayscaleMode, setGrayscaleMode,
    underlineLinks, setUnderlineLinks,
    textSpacing, setTextSpacing,
    reduceMotion, setReduceMotion,
    largeCursor, setLargeCursor,
    readingGuide, setReadingGuide,
    invertColors, setInvertColors,
    textToSpeech, setTextToSpeech,
    screenRuler, setScreenRuler,
    magnifierMode, setMagnifierMode,
    bigButtonMode, setBigButtonMode,
    keyboardShortcuts, setKeyboardShortcuts,
    readingMask, setReadingMask,
    altTextOverlay, setAltTextOverlay,
    linkDestinationDisplay, setLinkDestinationDisplay,
    keyboardNavHud, setKeyboardNavHud,
    removeTextShadows, setRemoveTextShadows,
    removeBackgrounds, setRemoveBackgrounds,
    pauseAnimations, setPauseAnimations,
    highlightHeaders, setHighlightHeaders,
    stickyHeader, setStickyHeader,
    ttsSpeed, setTtsSpeed,
    ttsPitch, setTtsPitch,
    audioMono, setAudioMono,
    seizureShield, setSeizureShield,
    resetAll,
  } = useAccessibility();

  // Map fontScale to slider value (0 to 3)
  const fontScaleMap: Record<FontScale, number> = {
    'small': 0,
    'normal': 1,
    'large': 2,
    'extra-large': 3,
  };

  const reverseFontScaleMap: Record<number, FontScale> = {
    0: 'small',
    1: 'normal',
    2: 'large',
    3: 'extra-large',
  };

  const percentageLabels: Record<FontScale, string> = {
    'small': '75%',
    'normal': '100%',
    'large': '125%',
    'extra-large': '150%',
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setFontScale(reverseFontScaleMap[newValue as number] || 'normal');
  };

  return (
    <>
      {/* Floating Action Trigger Button at Bottom Left */}
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle accessibility panel"
        sx={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          width: 56,
          height: 56,
          bgcolor: '#2563eb',
          color: '#ffffff',
          zIndex: 9999,
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: '#1d4ed8',
            transform: 'scale(1.08)',
          },
        }}
      >
        <AccessibilityNewIcon sx={{ fontSize: 28 }} />
      </IconButton>

      {/* Accessibility Dashboard panel */}
      {isOpen && (
        <Paper
          variant="outlined"
          sx={{
            position: 'fixed',
            bottom: 92,
            left: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 400 },
            maxHeight: '75vh',
            overflowY: 'auto',
            bgcolor: 'rgba(15, 23, 42, 0.85)', // Glassmorphism backdrop slate
            backdropFilter: 'blur(20px)',
            color: '#f8fafc',
            borderRadius: 4,
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.6), 0 0 15px rgba(59, 130, 246, 0.1)',
            p: 3,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            scrollbarWidth: 'thin',
            animation: 'fadeInSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            '@keyframes fadeInSlide': {
              '0%': { opacity: 0, transform: 'translateY(15px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            },
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.2)' },
            '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '3px' },
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Poppins", sans-serif' }}>
              Accessibility Suite
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                onClick={resetAll}
                sx={{
                  color: '#3b82f6',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': { background: 'none', color: '#60a5fa' },
                }}
              >
                Reset all settings
              </Button>
              <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: '#94a3b8' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* SECTION 1: TEXT & SPACING ACCORDION */}
          <Accordion sx={{ bgcolor: 'rgba(255,255,255,0.02)', color: 'inherit', borderColor: 'rgba(255,255,255,0.05)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TextFieldsIcon sx={{ color: '#3b82f6' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Text & Formatting</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Text Size Slider */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>Text Scaling</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>{percentageLabels[fontScale]}</Typography>
                </Box>
                <Slider
                  value={fontScaleMap[fontScale]}
                  min={0}
                  max={3}
                  step={1}
                  onChange={handleSliderChange}
                  sx={{ color: '#3b82f6' }}
                />
              </Box>

              {/* Line & Word spacing buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>Line Height</Typography>
                  <Select
                    size="small"
                    fullWidth
                    value={lineHeightScale}
                    onChange={(e) => setLineHeightScale(e.target.value as LineHeightScale)}
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }}
                  >
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="large">1.8x Spacing</MenuItem>
                    <MenuItem value="extra-large">2.3x Spacing</MenuItem>
                  </Select>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>Word Spacing</Typography>
                  <Select
                    size="small"
                    fullWidth
                    value={wordSpacingScale}
                    onChange={(e) => setWordSpacingScale(e.target.value as WordSpacingScale)}
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }}
                  >
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="large">1.5x Spacing</MenuItem>
                    <MenuItem value="extra-large">2.0x Spacing</MenuItem>
                  </Select>
                </Box>
              </Box>

              {/* Text Align & Font Overrides */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>Text Alignment</Typography>
                  <Select
                    size="small"
                    fullWidth
                    value={textAlign}
                    onChange={(e) => setTextAlign(e.target.value as TextAlignOverride)}
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }}
                  >
                    <MenuItem value="none">Default</MenuItem>
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="center">Center</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                    <MenuItem value="justify">Justify</MenuItem>
                  </Select>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>Font Face Override</Typography>
                  <Select
                    size="small"
                    fullWidth
                    value={fontFamilyOverride}
                    onChange={(e) => setFontFamilyOverride(e.target.value as FontFamilyOverride)}
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }}
                  >
                    <MenuItem value="none">Default</MenuItem>
                    <MenuItem value="serif">Serif</MenuItem>
                    <MenuItem value="sans-serif">Sans-Serif</MenuItem>
                    <MenuItem value="monospace">Monospace</MenuItem>
                    <MenuItem value="dyslexic">Dyslexic Font</MenuItem>
                  </Select>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* SECTION 2: COLORS & CONTRAST ACCORDION */}
          <Accordion sx={{ bgcolor: 'rgba(255,255,255,0.02)', color: 'inherit', borderColor: 'rgba(255,255,255,0.05)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ContrastIcon sx={{ color: '#a78bfa' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Color & Contrast</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Colorblind selection */}
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>Colorblind Filters</Typography>
                <Select
                  size="small"
                  fullWidth
                  value={colorBlindness}
                  onChange={(e) => setColorBlindness(e.target.value as ColorBlindnessType)}
                  sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }}
                >
                  <MenuItem value="none">No Filter</MenuItem>
                  <MenuItem value="protanopia">Protanopia (Red Weak)</MenuItem>
                  <MenuItem value="deuteranopia">Deuteranopia (Green Weak)</MenuItem>
                  <MenuItem value="tritanopia">Tritanopia (Blue Weak)</MenuItem>
                  <MenuItem value="monochromacy">Achromatopsia (Monochrome)</MenuItem>
                </Select>
              </Box>

              {/* High Contrast Palettes selection */}
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>Contrast Themes</Typography>
                <Select
                  size="small"
                  fullWidth
                  value={highContrastTheme}
                  onChange={(e) => setHighContrastTheme(e.target.value as HighContrastTheme)}
                  sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }}
                >
                  <MenuItem value="none">Default Colors</MenuItem>
                  <MenuItem value="black-yellow">Yellow on Black</MenuItem>
                  <MenuItem value="black-white">White on Black</MenuItem>
                  <MenuItem value="white-black">Black on White</MenuItem>
                  <MenuItem value="yellow-black">Black on Yellow</MenuItem>
                  <MenuItem value="green-black">Green on Black</MenuItem>
                  <MenuItem value="solarized">Solarized Contrast</MenuItem>
                </Select>
              </Box>

              {/* Simple Contrast Toggles */}
              {[
                { label: 'High Contrast', checked: highContrast, change: setHighContrast },
                { label: 'Invert Screen Colors', checked: invertColors, change: setInvertColors },
                { label: 'Black & White (Grayscale)', checked: grayscaleMode, change: setGrayscaleMode },
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                  <Switch size="small" checked={item.checked} onChange={(e) => item.change(e.target.checked)} />
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>

          {/* SECTION 3: READING ASSISTANCE ACCORDION */}
          <Accordion sx={{ bgcolor: 'rgba(255,255,255,0.02)', color: 'inherit', borderColor: 'rgba(255,255,255,0.05)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocalLibraryIcon sx={{ color: '#fbbf24' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Reading Guides & Views</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { label: 'Focus slit (Reading Mask)', checked: readingMask, change: setReadingMask },
                { label: 'Horizontal guide line', checked: readingGuide, change: setReadingGuide },
                { label: 'Reading screen ruler', checked: screenRuler, change: setScreenRuler },
                { label: 'Cursor zoom magnifier', checked: magnifierMode, change: setMagnifierMode },
                { label: 'Alt-Text Descriptions display', checked: altTextOverlay, change: setAltTextOverlay },
                { label: 'Link Target URL tooltip display', checked: linkDestinationDisplay, change: setLinkDestinationDisplay },
                { label: 'Highlight Header elements background', checked: highlightHeaders, change: setHighlightHeaders },
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                  <Switch size="small" checked={item.checked} onChange={(e) => item.change(e.target.checked)} />
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>

          {/* SECTION 4: VOICE & SCREEN READER ACCORDION */}
          <Accordion sx={{ bgcolor: 'rgba(255,255,255,0.02)', color: 'inherit', borderColor: 'rgba(255,255,255,0.05)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <VolumeUpIcon sx={{ color: '#34d399' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Voice (Screen Reader)</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Hover Text-to-Speech (TTS)</Typography>
                <Switch size="small" checked={textToSpeech} onChange={(e) => setTextToSpeech(e.target.checked)} />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Mono audio channel mixing</Typography>
                <Switch size="small" checked={audioMono} onChange={(e) => setAudioMono(e.target.checked)} />
              </Box>

              {/* Speech speed and pitch */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>TTS Speed</Typography>
                  <Select
                    size="small"
                    fullWidth
                    value={ttsSpeed}
                    onChange={(e) => setTtsSpeed(e.target.value as TtsSpeed)}
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }}
                  >
                    <MenuItem value="slow">Slow</MenuItem>
                    <MenuItem value="medium">Normal</MenuItem>
                    <MenuItem value="fast">Fast</MenuItem>
                  </Select>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>TTS Pitch</Typography>
                  <Select
                    size="small"
                    fullWidth
                    value={ttsPitch}
                    onChange={(e) => setTtsPitch(e.target.value as TtsPitch)}
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }}
                  >
                    <MenuItem value="low">Low Pitch</MenuItem>
                    <MenuItem value="medium">Normal</MenuItem>
                    <MenuItem value="high">High Pitch</MenuItem>
                  </Select>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* SECTION 5: CONTROLS & SYSTEM SYSTEM ACCORDION */}
          <Accordion sx={{ bgcolor: 'rgba(255,255,255,0.02)', color: 'inherit', borderColor: 'rgba(255,255,255,0.05)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <MouseIcon sx={{ color: '#fb7185' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Navigation & Systems</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { label: 'Motor control Big Buttons mode', checked: bigButtonMode, change: setBigButtonMode },
                { label: 'Keyboard Alt shortcuts activation', checked: keyboardShortcuts, change: setKeyboardShortcuts },
                { label: 'Keyboard navigation helper HUD display', checked: keyboardNavHud, change: setKeyboardNavHud },
                { label: 'Seizure protection screen dimmer', checked: seizureShield, change: setSeizureShield },
                { label: 'Stop dynamic GIF animations', checked: pauseAnimations, change: setPauseAnimations },
                { label: 'Reduce interface motion details', checked: reduceMotion, change: setReduceMotion },
                { label: 'Sticky Header layout lock', checked: stickyHeader, change: setStickyHeader },
                { label: 'Remove text shadows & highlights', checked: removeTextShadows, change: setRemoveTextShadows },
                { label: 'Remove background patterns', checked: removeBackgrounds, change: setRemoveBackgrounds },
                { label: 'Underline link borders', checked: underlineLinks, change: setUnderlineLinks },
                { label: 'Enlarge character & word spacing', checked: textSpacing, change: setTextSpacing },
                { label: 'Enlarge default cursor size', checked: largeCursor, change: setLargeCursor },
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                  <Switch size="small" checked={item.checked} onChange={(e) => item.change(e.target.checked)} />
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 0.5 }} />

          {/* Footer Keyboard Info */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <Typography sx={{ fontSize: 16 }}>💡</Typography>
            <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.4 }}>
              Keyboard shortcuts: Use <b>Alt + H</b> for Home page and <b>Alt + R</b> to Reset all accessibility configurations instantly.
            </Typography>
          </Box>
        </Paper>
      )}
    </>
  );
}
