'use client';

import { useState } from 'react';
import {
  Drawer,
  Fab,
  Box,
  Typography,
  Tabs,
  Tab,
  Switch,
  Slider,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MouseIcon from '@mui/icons-material/Mouse';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAccessibilityV3 } from '@/context/AccessibilityContextV3';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div hidden={value !== index} style={{ padding: '20px 0' }}>
      {value === index && children}
    </div>
  );
}

export default function AccessibilityWidgetV3() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileDescription, setProfileDescription] = useState('');

  const ctx = useAccessibilityV3();

  const handleSaveProfile = () => {
    if (profileName.trim()) {
      ctx.saveProfile(profileName, profileDescription);
      setSaveDialogOpen(false);
      setProfileName('');
      setProfileDescription('');
    }
  };

  return (
    <>
      {/* Floating Action Button - Bottom Right */}
      <Fab
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 999998,
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
          },
        }}
        aria-label="Open Accessibility Settings"
      >
        <AccessibilityNewIcon sx={{ fontSize: 28 }} />
      </Fab>

      {/* Main Drawer - Opens from Right */}
      <Drawer
        anchor="right"
        open={open}
        onClose={(event, reason) => {
          // Only close on escape key, prevent backdrop click closing
          if (reason === 'escapeKeyDown') {
            setOpen(false);
          }
        }}
        sx={{
          zIndex: 999999,
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 420 },
            maxWidth: '100vw',
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Accessibility Settings
            </Typography>
            <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Quick Presets */}
          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
              Quick Presets
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="Low Vision"
                size="small"
                onClick={() => ctx.loadProfile('low-vision')}
                color="primary"
                variant="outlined"
              />
              <Chip
                label="Motor Impairment"
                size="small"
                onClick={() => ctx.loadProfile('motor-impairment')}
                color="primary"
                variant="outlined"
              />
              <Chip
                label="Cognitive Support"
                size="small"
                onClick={() => ctx.loadProfile('cognitive-support')}
                color="primary"
                variant="outlined"
              />
              <Chip
                label="ADHD Focused"
                size="small"
                onClick={() => ctx.loadProfile('adhd-focused')}
                color="primary"
                variant="outlined"
              />
              <Chip
                label="Reset All"
                size="small"
                onClick={ctx.resetAll}
                icon={<RestartAltIcon />}
                color="error"
                variant="outlined"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
          >
            <Tab icon={<VisibilityIcon />} label="Vision" iconPosition="start" />
            <Tab icon={<MenuBookIcon />} label="Reading" iconPosition="start" />
            <Tab icon={<MouseIcon />} label="Navigation" iconPosition="start" />
            <Tab icon={<VolumeUpIcon />} label="Audio" iconPosition="start" />
            <Tab icon={<ViewComfyIcon />} label="Layout" iconPosition="start" />
            <Tab icon={<TouchAppIcon />} label="Motor" iconPosition="start" />
          </Tabs>

          {/* Content Area - Scrollable */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 2 }}>
            {/* Vision & Display Tab */}
            <TabPanel value={activeTab} index={0}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Text & Display
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption">Text Size: {ctx.textSize}%</Typography>
                <Slider
                  value={ctx.textSize}
                  onChange={(e, val) => ctx.setTextSize(val as number)}
                  min={75}
                  max={200}
                  step={5}
                  valueLabelDisplay="auto"
                />
              </Box>

              <FormControlLabel
                control={
                  <Select
                    value={ctx.lineHeight}
                    onChange={(e) => ctx.setLineHeight(e.target.value as 'normal' | 'large' | 'xl')}
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                    <MenuItem value="xl">Extra Large</MenuItem>
                  </Select>
                }
                label="Line Height:"
                labelPlacement="start"
                sx={{ width: '100%', justifyContent: 'space-between', mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Select
                    value={ctx.letterSpacing}
                    onChange={(e) => ctx.setLetterSpacing(e.target.value as 'normal' | 'wide' | 'xwide')}
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="wide">Wide</MenuItem>
                    <MenuItem value="xwide">Extra Wide</MenuItem>
                  </Select>
                }
                label="Letter Spacing:"
                labelPlacement="start"
                sx={{ width: '100%', justifyContent: 'space-between', mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Select
                    value={ctx.fontFamily}
                    onChange={(e) => ctx.setFontFamily(e.target.value as 'default' | 'arial' | 'verdana' | 'dyslexic' | 'mono')}
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="arial">Arial</MenuItem>
                    <MenuItem value="verdana">Verdana</MenuItem>
                    <MenuItem value="dyslexic">Dyslexic Friendly</MenuItem>
                    <MenuItem value="mono">Monospace</MenuItem>
                  </Select>
                }
                label="Font Family:"
                labelPlacement="start"
                sx={{ width: '100%', justifyContent: 'space-between', mb: 3 }}
              />

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Color & Contrast
              </Typography>

              <FormControlLabel
                control={<Switch checked={ctx.highContrast} onChange={(e) => ctx.setHighContrast(e.target.checked)} />}
                label="High Contrast Mode"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.darkMode} onChange={(e) => ctx.setDarkMode(e.target.checked)} />}
                label="Dark Mode"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.invertColors} onChange={(e) => ctx.setInvertColors(e.target.checked)} />}
                label="Invert Colors"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.grayscale} onChange={(e) => ctx.setGrayscale(e.target.checked)} />}
                label="Grayscale"
                sx={{ width: '100%', mb: 3 }}
              />

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption">Brightness: {ctx.brightness}%</Typography>
                <Slider
                  value={ctx.brightness}
                  onChange={(e, val) => ctx.setBrightness(val as number)}
                  min={50}
                  max={150}
                  step={5}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption">Saturation: {ctx.saturation}%</Typography>
                <Slider
                  value={ctx.saturation}
                  onChange={(e, val) => ctx.setSaturation(val as number)}
                  min={0}
                  max={200}
                  step={10}
                  valueLabelDisplay="auto"
                />
              </Box>

              <FormControlLabel
                control={<Switch checked={ctx.focusIndicators} onChange={(e) => ctx.setFocusIndicators(e.target.checked)} />}
                label="Enhanced Focus Indicators"
                sx={{ width: '100%', mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Select
                    value={ctx.colorblindFilter}
                    onChange={(e) => ctx.setColorblindFilter(e.target.value as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia')}
                    size="small"
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="protanopia">Protanopia</MenuItem>
                    <MenuItem value="deuteranopia">Deuteranopia</MenuItem>
                    <MenuItem value="tritanopia">Tritanopia</MenuItem>
                    <MenuItem value="achromatopsia">Achromatopsia</MenuItem>
                  </Select>
                }
                label="Colorblind Filter:"
                labelPlacement="start"
                sx={{ width: '100%', justifyContent: 'space-between' }}
              />
            </TabPanel>

            {/* Reading & Content Tab */}
            <TabPanel value={activeTab} index={1}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Reading Assistance
              </Typography>

              <FormControlLabel
                control={<Switch checked={ctx.readingRuler} onChange={(e) => ctx.setReadingRuler(e.target.checked)} />}
                label="Reading Ruler"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.readingMask} onChange={(e) => ctx.setReadingMask(e.target.checked)} />}
                label="Reading Mask (Dim Surroundings)"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.lineHighlighter} onChange={(e) => ctx.setLineHighlighter(e.target.checked)} />}
                label="Line Highlighter"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.linkHighlighting} onChange={(e) => ctx.setLinkHighlighting(e.target.checked)} />}
                label="Highlight All Links"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.simplifyFonts} onChange={(e) => ctx.setSimplifyFonts(e.target.checked)} />}
                label="Simplify Fonts"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.removeAnimations} onChange={(e) => ctx.setRemoveAnimations(e.target.checked)} />}
                label="Remove Animations"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.pauseAutoplay} onChange={(e) => ctx.setPauseAutoplay(e.target.checked)} />}
                label="Pause Autoplay"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.hideImages} onChange={(e) => ctx.setHideImages(e.target.checked)} />}
                label="Hide Decorative Images"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.removeBackgrounds} onChange={(e) => ctx.setRemoveBackgrounds(e.target.checked)} />}
                label="Remove Backgrounds"
                sx={{ width: '100%', mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Select
                    value={ctx.textAlignment}
                    onChange={(e) => ctx.setTextAlignment(e.target.value as 'left' | 'center' | 'right' | 'justify')}
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="center">Center</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                    <MenuItem value="justify">Justify</MenuItem>
                  </Select>
                }
                label="Text Alignment:"
                labelPlacement="start"
                sx={{ width: '100%', justifyContent: 'space-between' }}
              />
            </TabPanel>

            {/* Navigation & Control Tab */}
            <TabPanel value={activeTab} index={2}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Navigation Options
              </Typography>

              <FormControlLabel
                control={<Switch checked={ctx.largeCursor} onChange={(e) => ctx.setLargeCursor(e.target.checked)} />}
                label="Large Cursor"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.cursorCrosshair} onChange={(e) => ctx.setCursorCrosshair(e.target.checked)} />}
                label="Cursor Crosshair"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.keyboardNavigation} onChange={(e) => ctx.setKeyboardNavigation(e.target.checked)} />}
                label="Enhanced Keyboard Navigation"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.tabOrderDisplay} onChange={(e) => ctx.setTabOrderDisplay(e.target.checked)} />}
                label="Show Tab Order"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.skipLinksVisible} onChange={(e) => ctx.setSkipLinksVisible(e.target.checked)} />}
                label="Skip Links Visible"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.stickyHeader} onChange={(e) => ctx.setStickyHeader(e.target.checked)} />}
                label="Sticky Header"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.scrollToTop} onChange={(e) => ctx.setScrollToTop(e.target.checked)} />}
                label="Scroll to Top Button"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.breadcrumbNav} onChange={(e) => ctx.setBreadcrumbNav(e.target.checked)} />}
                label="Breadcrumb Navigation"
                sx={{ width: '100%' }}
              />
            </TabPanel>

            {/* Audio & Speech Tab */}
            <TabPanel value={activeTab} index={3}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Audio & Speech Settings
              </Typography>

              <FormControlLabel
                control={<Switch checked={ctx.textToSpeech} onChange={(e) => ctx.setTextToSpeech(e.target.checked)} />}
                label="Text-to-Speech on Selection"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.autoReadHeadings} onChange={(e) => ctx.setAutoReadHeadings(e.target.checked)} />}
                label="Auto-Read Headings"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.soundCaptions} onChange={(e) => ctx.setSoundCaptions(e.target.checked)} />}
                label="Sound Captions"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.backgroundSoundMute} onChange={(e) => ctx.setBackgroundSoundMute(e.target.checked)} />}
                label="Mute Background Sounds"
                sx={{ width: '100%', mb: 3 }}
              />

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption">Speech Rate: {ctx.speechRate}x</Typography>
                <Slider
                  value={ctx.speechRate}
                  onChange={(e, val) => ctx.setSpeechRate(val as number)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
              </Box>

              <FormControlLabel
                control={
                  <Select
                    value={ctx.speechVoice}
                    onChange={(e) => ctx.setSpeechVoice(e.target.value as 'male' | 'female')}
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="male">Male Voice</MenuItem>
                    <MenuItem value="female">Female Voice</MenuItem>
                  </Select>
                }
                label="Voice Type:"
                labelPlacement="start"
                sx={{ width: '100%', justifyContent: 'space-between' }}
              />
            </TabPanel>

            {/* Layout & Structure Tab */}
            <TabPanel value={activeTab} index={4}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Layout Options
              </Typography>

              <FormControlLabel
                control={<Switch checked={ctx.headingOutline} onChange={(e) => ctx.setHeadingOutline(e.target.checked)} />}
                label="Heading Outline"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.buttonHighlighting} onChange={(e) => ctx.setButtonHighlighting(e.target.checked)} />}
                label="Button Highlighting"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.responsiveTextFlow} onChange={(e) => ctx.setResponsiveTextFlow(e.target.checked)} />}
                label="Responsive Text Flow"
                sx={{ width: '100%', mb: 3 }}
              />

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption">White Space: {ctx.whiteSpace}%</Typography>
                <Slider
                  value={ctx.whiteSpace}
                  onChange={(e, val) => ctx.setWhiteSpace(val as number)}
                  min={75}
                  max={150}
                  step={5}
                  valueLabelDisplay="auto"
                />
              </Box>

              <FormControlLabel
                control={
                  <Select
                    value={ctx.contentWidth}
                    onChange={(e) => ctx.setContentWidth(e.target.value as 'full' | 'contained' | 'narrow')}
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="full">Full Width</MenuItem>
                    <MenuItem value="contained">Contained</MenuItem>
                    <MenuItem value="narrow">Narrow</MenuItem>
                  </Select>
                }
                label="Content Width:"
                labelPlacement="start"
                sx={{ width: '100%', justifyContent: 'space-between' }}
              />
            </TabPanel>

            {/* Motor & Interaction Tab */}
            <TabPanel value={activeTab} index={5}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Motor Assistance
              </Typography>

              <FormControlLabel
                control={<Switch checked={ctx.bigButtonMode} onChange={(e) => ctx.setBigButtonMode(e.target.checked)} />}
                label="Big Button Mode"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.touchTargetSize} onChange={(e) => ctx.setTouchTargetSize(e.target.checked)} />}
                label="Larger Touch Targets"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.disableDoubleClick} onChange={(e) => ctx.setDisableDoubleClick(e.target.checked)} />}
                label="Disable Double-Click"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.hoverFreeze} onChange={(e) => ctx.setHoverFreeze(e.target.checked)} />}
                label="Freeze Hover Effects"
                sx={{ width: '100%', mb: 1 }}
              />

              <FormControlLabel
                control={<Switch checked={ctx.oneHandMode} onChange={(e) => ctx.setOneHandMode(e.target.checked)} />}
                label="One-Hand Mode"
                sx={{ width: '100%', mb: 3 }}
              />

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption">Click Delay: {ctx.clickDelay}ms</Typography>
                <Slider
                  value={ctx.clickDelay}
                  onChange={(e, val) => ctx.setClickDelay(val as number)}
                  min={0}
                  max={1000}
                  step={50}
                  valueLabelDisplay="auto"
                />
              </Box>
            </TabPanel>
          </Box>

          {/* Footer Actions */}
          <Divider />
          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => setSaveDialogOpen(true)}
                fullWidth
              >
                Save Profile
              </Button>
              <Button variant="outlined" onClick={ctx.resetAll} fullWidth>
                Reset All
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>

      {/* Save Profile Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Save Custom Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Profile Name"
            fullWidth
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={2}
            value={profileDescription}
            onChange={(e) => setProfileDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained" disabled={!profileName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
