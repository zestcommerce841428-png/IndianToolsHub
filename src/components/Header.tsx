'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Container,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel,
  Radio,
  RadioGroup,
  Avatar,
  CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import PolicyIcon from '@mui/icons-material/Policy';
import GavelIcon from '@mui/icons-material/Gavel';
import PaletteIcon from '@mui/icons-material/Palette';
import TranslateIcon from '@mui/icons-material/Translate';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailIcon from '@mui/icons-material/Email';
import Link from 'next/link';

import { useLanguage, LANGUAGES } from '@/context/LanguageContext';
import { useThemeContext, ThemeType } from '@/context/ThemeContext';
import { useAccessibility, FontScale } from '@/context/AccessibilityContext';
import { useAuth } from '@/context/AuthContext';

const TricolorLogo = () => (
  <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
    {/* Saffron cog shape */}
    <path d="M16 2C8.268 2 2 8.268 2 16C2 17.844 2.355 19.605 3 21.22L6.5 19.5C6.18 18.412 6 17.23 6 16C6 10.477 10.477 6 16 6C17.23 6 18.412 6.18 19.5 6.5L21.22 3C19.605 2.355 17.844 2 16 2Z" fill="#FF9933" />
    {/* White central circle with Ashoka Chakra-like lines */}
    <circle cx="16" cy="16" r="5" fill="#FFFFFF" stroke="#000080" strokeWidth="1" />
    <path d="M16 11V21M11 16H21M12.46 12.46L19.54 19.54M12.46 19.54L19.54 12.46" stroke="#000080" strokeWidth="0.75" />
    {/* Green bottom shape */}
    <path d="M16 30C23.732 30 30 23.732 30 16C30 14.156 29.645 12.395 29 10.78L25.5 12.5C25.82 13.588 26 14.77 26 16C26 21.523 21.523 26 16 26C14.77 26 13.588 25.82 12.5 25.5L10.78 29C12.395 29.645 14.156 30 16 30Z" fill="#128807" />
  </svg>
);

const WhatsAppLogoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
    <path d="M12.012 2c-5.523 0-10 4.477-10 10 0 1.777.465 3.504 1.35 5.025l-1.436 5.24 5.364-1.408c1.472.802 3.125 1.223 4.794 1.223 5.522 0 10-4.477 10-10s-4.478-10-10-10zm0 1.75c4.549 0 8.25 3.701 8.25 8.25s-3.701 8.25-8.25 8.25c-1.547 0-3.056-.435-4.364-1.258l-.313-.19-3.238.85.865-3.155-.208-.332a8.21 8.21 0 0 1-1.242-4.165c0-4.549 3.701-8.25 8.25-8.25zm-3.614 4.887c-.198 0-.382.078-.523.22-.162.162-.48.47-.48 1.147 0 .678.493 1.332.562 1.424.069.093.971 1.482 2.352 2.08.328.142.585.227.784.29.33.105.63.09.868.055.265-.04.814-.333.929-.655.115-.322.115-.598.08-.655-.035-.058-.127-.093-.265-.162-.138-.069-.815-.403-.941-.448-.127-.046-.22-.069-.312.069-.092.138-.356.448-.436.54-.08.092-.161.103-.3.035-.137-.069-.581-.214-1.107-.684-.41-.365-.686-.816-.767-.954-.08-.138-.008-.213.06-.282.062-.061.138-.162.207-.242.069-.08.092-.138.138-.23.046-.092.023-.173-.012-.242-.034-.069-.312-.752-.427-1.03-.112-.27-.225-.233-.312-.238l-.265-.005z"/>
  </svg>
);

const themeChoices: { id: ThemeType; name: string; color: string }[] = [
  { id: 'classic-blue', name: 'Classic Blue', color: '#2563eb' },
  { id: 'tricolor-glow', name: 'Tricolor Glow', color: '#ff9933' },
  { id: 'midnight-obsidian', name: 'Midnight Obsidian', color: '#38bdf8' },
  { id: 'cyberpunk-neon', name: 'Cyberpunk Neon', color: '#f43f5e' },
  { id: 'sunset-amber', name: 'Sunset Amber', color: '#d97706' },
  { id: 'forest-mint', name: 'Forest Mint', color: '#059669' },
  { id: 'lavender-breeze', name: 'Lavender Breeze', color: '#8b5cf6' },
  { id: 'crimson-gold', name: 'Crimson Gold', color: '#be123c' },
  { id: 'sakura-blossom', name: 'Sakura Blossom', color: '#ec4899' },
  { id: 'teal-wave', name: 'Teal Wave', color: '#0d9488' },
  { id: 'deep-space', name: 'Deep Space', color: '#818cf8' },
  { id: 'chocolate-mocha', name: 'Chocolate Mocha', color: '#78350f' },
  { id: 'monochrome-grey', name: 'Monochrome Grey', color: '#1e293b' },
  { id: 'solarized-light', name: 'Solarized Light', color: '#b58900' },
  { id: 'nord-frost', name: 'Nord Frost', color: '#88c0d0' },
  { id: 'dracula-vampire', name: 'Dracula Vampire', color: '#bd93f9' },
  { id: 'matrix-code', name: 'Matrix Code', color: '#00ff00' },
  { id: 'gruvbox-retro', name: 'Gruvbox Retro', color: '#fe8019' },
  { id: 'oceanic-abyss', name: 'Oceanic Abyss', color: '#00fedc' },
  { id: 'cotton-candy', name: 'Cotton Candy', color: '#ff7eb9' },
  { id: 'emerald-luxury', name: 'Emerald Luxury', color: '#10b981' },
  { id: 'coffee-beans', name: 'Coffee Beans', color: '#b45309' },
  { id: 'cyber-future', name: 'Cyber Future', color: '#d946ef' },
  { id: 'aurora-borealis', name: 'Aurora Borealis', color: '#34d399' },
  { id: 'royal-velvet', name: 'Royal Velvet', color: '#a855f7' },
  { id: 'steel-glacier', name: 'Steel Glacier', color: '#475569' },
  { id: 'pumpkin-spice', name: 'Pumpkin Spice', color: '#c2410c' },
  { id: 'rose-gold', name: 'Rose Gold', color: '#fda4af' },
  { id: 'pitch-black', name: 'Pitch Black', color: '#ffffff' },
  { id: 'deep-obsidian', name: 'Deep Obsidian', color: '#f43f5e' },
  { id: 'cyber-neon', name: 'Cyber Neon', color: '#06b6d4' },
  { id: 'dark-galaxy', name: 'Dark Galaxy', color: '#c084fc' },
  { id: 'carbon-slate', name: 'Carbon Slate', color: '#71717a' },
  { id: 'toxic-ooze', name: 'Toxic Ooze', color: '#a3e635' },
  { id: 'plasma-fire', name: 'Plasma Fire', color: '#f97316' },
  { id: 'blood-moon', name: 'Blood Moon', color: '#dc2626' },
  { id: 'electric-storm', name: 'Electric Storm', color: '#6366f1' },
  { id: 'space-nebula', name: 'Space Nebula', color: '#d946ef' },
  { id: 'emerald-abyss', name: 'Emerald Abyss', color: '#10b981' },
  { id: 'gold-mine', name: 'Gold Mine', color: '#eab308' },
  { id: 'cold-glacier', name: 'Cold Glacier', color: '#38bdf8' },
  { id: 'volcanic-ash', name: 'Volcanic Ash', color: '#ef4444' },
  { id: 'deep-sea-trench', name: 'Deep Sea Trench', color: '#0ea5e9' },
  { id: 'ghostly-fog', name: 'Ghostly Fog', color: '#cbd5e1' },
  { id: 'monochrome-coal', name: 'Monochrome Coal', color: '#27272a' },
  { id: 'solarized-dark', name: 'Solarized Dark', color: '#268bd2' },
  { id: 'nordic-night', name: 'Nordic Night', color: '#88c0d0' },
  { id: 'dracula-castle', name: 'Dracula Castle', color: '#ff79c6' },
  { id: 'matrix-hacker', name: 'Matrix Hacker', color: '#00ff00' },
  { id: 'gruvbox-dark', name: 'Gruvbox Dark', color: '#fe8019' },
  { id: 'synthwave-84', name: 'Synthwave 84', color: '#ff7eb9' },
  { id: 'cyberpunk-2077', name: 'Cyberpunk 2077', color: '#fcee0a' },
  { id: 'twilight-forest', name: 'Twilight Forest', color: '#10b981' },
  { id: 'crimson-shadow', name: 'Crimson Shadow', color: '#e11d48' },
  { id: 'violet-night', name: 'Violet Night', color: '#7c3aed' },
  { id: 'rust-desert', name: 'Rust Desert', color: '#ea580c' },
  { id: 'cozy-fireplace', name: 'Cozy Fireplace', color: '#f59e0b' },
  { id: 'ice-berg', name: 'Ice Berg', color: '#93c5fd' },
  { id: 'shadow-realm', name: 'Shadow Realm', color: '#8b5cf6' },
  { id: 'acid-green', name: 'Acid Green', color: '#4ade80' },
  { id: 'sapphire-depths', name: 'Sapphire Depths', color: '#1e40af' },
  { id: 'amethyst-crystal', name: 'Amethyst Crystal', color: '#a855f7' },
  { id: 'ruby-red', name: 'Ruby Red', color: '#be123c' },
  { id: 'sunset-glow', name: 'Sunset Glow', color: '#f43f5e' },
  { id: 'ocean-breeze', name: 'Ocean Breeze', color: '#06b6d4' },
  { id: 'sakura-night', name: 'Sakura Night', color: '#f472b6' },
  { id: 'copper-ore', name: 'Copper Ore', color: '#b45309' },
  { id: 'bronze-age', name: 'Bronze Age', color: '#ca8a04' },
  { id: 'silver-lining', name: 'Silver Lining', color: '#94a3b8' },
  { id: 'charcoal-slate', name: 'Charcoal Slate', color: '#4b5563' },
  { id: 'vampire-hunter', name: 'Vampire Hunter', color: '#e11d48' },
  { id: 'neon-yellow', name: 'Neon Yellow', color: '#eab308' },
  { id: 'deep-maroon', name: 'Deep Maroon', color: '#9d174d' },
  { id: 'forest-canopy', name: 'Forest Canopy', color: '#16a34a' },
  { id: 'autumn-leaves', name: 'Autumn Leaves', color: '#d97706' },
];

export default function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { themeType, setThemeType } = useThemeContext();
  const { user, profile, loading: authLoading, logout } = useAuth();
  const {
    fontScale,
    setFontScale,
    highContrast,
    setHighContrast,
    dyslexiaFont,
    setDyslexiaFont,
    grayscaleMode,
    setGrayscaleMode,
    underlineLinks,
    setUnderlineLinks,
    resetAll,
  } = useAccessibility();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [accessDrawerOpen, setAccessDrawerOpen] = useState(false);

  // Anchor elements for Theme and Language dropdown menus
  const [themeAnchorEl, setThemeAnchorEl] = useState<null | HTMLElement>(null);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenThemeMenu = (e: React.MouseEvent<HTMLButtonElement>) => setThemeAnchorEl(e.currentTarget);
  const handleCloseThemeMenu = () => setThemeAnchorEl(null);

  const handleOpenLangMenu = (e: React.MouseEvent<HTMLButtonElement>) => setLangAnchorEl(e.currentTarget);
  const handleCloseLangMenu = () => setLangAnchorEl(null);

  const handleOpenProfileMenu = (e: React.MouseEvent<HTMLButtonElement>) => setProfileAnchorEl(e.currentTarget);
  const handleCloseProfileMenu = () => setProfileAnchorEl(null);

  const handleThemeSelect = (type: ThemeType) => {
    setThemeType(type);
    handleCloseThemeMenu();
  };

  const handleLangSelect = (code: any) => {
    setLanguage(code);
    handleCloseLangMenu();
  };

  const navLinks = [
    { text: t('home'), href: '/', icon: <HomeIcon /> },
    { text: 'Blog', href: '/blog', icon: <ArticleIcon /> },
    { text: 'Contact', href: '/contact', icon: <EmailIcon /> },
    { text: t('about'), href: '/about', icon: <InfoIcon /> },
    { text: t('privacy'), href: '/privacy-policy', icon: <PolicyIcon /> },
    { text: t('terms'), href: '/term-conditions', icon: <GavelIcon /> },
  ];

  const drawerList = (
    <Box
      sx={{ width: 260 }}
      role="presentation"
      onClick={() => setMobileDrawerOpen(false)}
      onKeyDown={() => setMobileDrawerOpen(false)}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Menu</Typography>
        <IconButton onClick={() => setMobileDrawerOpen(false)}><CloseIcon /></IconButton>
      </Box>
      <Divider />
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.text} disablePadding>
            <Link href={link.href} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              <ListItemButton>
                <ListItemIcon sx={{ color: 'primary.main' }}>{link.icon}</ListItemIcon>
                <ListItemText primary={link.text} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button
          fullWidth
          variant="contained"
          color="success"
          startIcon={<WhatsAppLogoIcon />}
          href="https://wa.me/917492068998"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </Button>
      </Box>
    </Box>
  );

  const accessibilityDrawer = (
    <Box sx={{ width: 320, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <AccessibilityNewIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Accessibility Settings</Typography>
        </Box>
        <IconButton onClick={() => setAccessDrawerOpen(false)}><CloseIcon /></IconButton>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>
        {/* Font Scaling */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Text Scaling</Typography>
          <RadioGroup
            value={fontScale}
            onChange={(e) => setFontScale(e.target.value as FontScale)}
          >
            <FormControlLabel value="small" control={<Radio />} label="Small (14px)" />
            <FormControlLabel value="normal" control={<Radio />} label="Normal (16px)" />
            <FormControlLabel value="large" control={<Radio />} label="Large (18px)" />
            <FormControlLabel value="extra-large" control={<Radio />} label="Extra Large (20px)" />
          </RadioGroup>
        </Box>
        <Divider />

        {/* Accessibility Features */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />}
            label={<Typography sx={{ fontWeight: 500 }}>High Contrast Mode</Typography>}
          />
          <FormControlLabel
            control={<Switch checked={dyslexiaFont} onChange={(e) => setDyslexiaFont(e.target.checked)} />}
            label={<Typography sx={{ fontWeight: 500 }}>Dyslexia Friendly Font</Typography>}
          />
          <FormControlLabel
            control={<Switch checked={grayscaleMode} onChange={(e) => setGrayscaleMode(e.target.checked)} />}
            label={<Typography sx={{ fontWeight: 500 }}>Grayscale Screen Filter</Typography>}
          />
          <FormControlLabel
            control={<Switch checked={underlineLinks} onChange={(e) => setUnderlineLinks(e.target.checked)} />}
            label={<Typography sx={{ fontWeight: 500 }}>Underline Active Links</Typography>}
          />
        </Box>
      </Box>

      <Box sx={{ pt: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<RefreshIcon />}
          onClick={resetAll}
        >
          Reset to Defaults
        </Button>
      </Box>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 72 }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <TricolorLogo />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.45rem',
                  fontFamily: '"Poppins", sans-serif',
                  letterSpacing: '-0.5px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box component="span" sx={{ color: '#FF9933' }}>
                  Indian
                </Box>
                <Box component="span" sx={{ color: 'text.primary' }}>
                  ToolsHub
                </Box>
              </Typography>
            </Box>
          </Link>

          {/* Desktop Navigation & Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            {/* Nav links (Desktop only) */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 2, mr: 2 }}>
              {navLinks.map((link) => (
                <Link key={link.text} href={link.href} passHref style={{ textDecoration: 'none' }}>
                  <Button
                    sx={{
                      color: 'text.primary',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                      px: 1.5,
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    {link.text}
                  </Button>
                </Link>
              ))}
            </Box>

            <Tooltip title={`Switch Theme (${themeChoices.length} options)`}>
              <IconButton onClick={handleOpenThemeMenu} sx={{ color: 'text.primary' }}>
                <PaletteIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={themeAnchorEl}
              open={Boolean(themeAnchorEl)}
              onClose={handleCloseThemeMenu}
              slotProps={{
                paper: {
                  sx: { maxHeight: 400, width: 220, borderRadius: 3, mt: 1.5 },
                }
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  SELECT COLOR PALETTE
                </Typography>
              </Box>
              <Divider />
              {themeChoices.map((tc) => (
                <MenuItem
                  key={tc.id}
                  selected={themeType === tc.id}
                  onClick={() => handleThemeSelect(tc.id)}
                  sx={{ py: 1 }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: tc.color,
                      mr: 1.5,
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{tc.name}</Typography>
                </MenuItem>
              ))}
            </Menu>

            {/* Language Switcher */}
            <Tooltip title="Switch Language">
              <IconButton onClick={handleOpenLangMenu} sx={{ color: 'text.primary' }}>
                <TranslateIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={langAnchorEl}
              open={Boolean(langAnchorEl)}
              onClose={handleCloseLangMenu}
              slotProps={{
                paper: {
                  sx: { maxHeight: 400, width: 220, borderRadius: 3, mt: 1.5 },
                }
              }}
            >
              {LANGUAGES.map((lang) => (
                <MenuItem
                  key={lang.code}
                  selected={language === lang.code}
                  onClick={() => handleLangSelect(lang.code)}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                    {lang.nativeName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({lang.name})
                  </Typography>
                </MenuItem>
              ))}
            </Menu>

            {/* Auth State Area */}
            {authLoading ? (
              <Box sx={{ width: 80, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} sx={{ color: 'text.secondary' }} />
              </Box>
            ) : user ? (
              <>
                <Tooltip title="Account & Profile">
                  <IconButton onClick={handleOpenProfileMenu} sx={{ ml: 1, p: 0.5, border: '2px solid', borderColor: 'primary.main' }}>
                    <Avatar alt={profile?.fullName || user.email || 'User'} src={profile?.photoURL || undefined} sx={{ width: 32, height: 32 }} />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={profileAnchorEl}
                  open={Boolean(profileAnchorEl)}
                  onClose={handleCloseProfileMenu}
                  slotProps={{ paper: { sx: { width: 200, borderRadius: 3, mt: 1.5 } } }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{profile?.fullName || user.email}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{user.email}</Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => { handleCloseProfileMenu(); window.location.href = '/profile'; }}>
                    <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                    My Profile
                  </MenuItem>
                  <MenuItem onClick={async () => { handleCloseProfileMenu(); await logout(); }}>
                    <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                    <Typography color="error">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button component={Link} href="/auth/login" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  Login
                </Button>
                <Button component={Link} href="/auth/register" variant="contained" sx={{ borderRadius: 2, fontWeight: 600 }}>
                  Sign Up
                </Button>
              </Box>
            )}


            {/* Contact WhatsApp Button */}
            <Button
              variant="contained"
              color="primary"
              className="pulse-glow"
              startIcon={<WhatsAppLogoIcon />}
              href="https://wa.me/917492068998"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ borderRadius: '24px', display: { xs: 'none', sm: 'inline-flex' } }}
            >
              {t('contactUs')}
            </Button>

            {/* Mobile Drawer trigger */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ display: { xs: 'flex', lg: 'none' }, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Navigation Drawer for Mobile */}
      <Drawer anchor="right" open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)}>
        {drawerList}
      </Drawer>
    </AppBar>
  );
}
