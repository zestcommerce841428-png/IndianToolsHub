'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider, Theme } from '@mui/material/styles';
import { responsiveFontSizes } from '@mui/material/styles';

export type ThemeType =
  | 'classic-blue'
  | 'tricolor-glow'
  | 'midnight-obsidian'
  | 'cyberpunk-neon'
  | 'sunset-amber'
  | 'forest-mint'
  | 'lavender-breeze'
  | 'crimson-gold'
  | 'sakura-blossom'
  | 'teal-wave'
  | 'deep-space'
  | 'chocolate-mocha'
  | 'monochrome-grey'
  | 'solarized-light'
  | 'nord-frost'
  | 'dracula-vampire'
  | 'matrix-code'
  | 'gruvbox-retro'
  | 'oceanic-abyss'
  | 'cotton-candy'
  | 'emerald-luxury'
  | 'coffee-beans'
  | 'cyber-future'
  | 'aurora-borealis'
  | 'royal-velvet'
  | 'steel-glacier'
  | 'pumpkin-spice'
  | 'rose-gold'
  | 'pitch-black'
  | 'deep-obsidian'
  | 'cyber-neon'
  | 'dark-galaxy'
  | 'carbon-slate'
  | 'toxic-ooze'
  | 'plasma-fire'
  | 'blood-moon'
  | 'electric-storm'
  | 'space-nebula'
  | 'emerald-abyss'
  | 'gold-mine'
  | 'cold-glacier'
  | 'volcanic-ash'
  | 'deep-sea-trench'
  | 'ghostly-fog'
  | 'monochrome-coal'
  | 'solarized-dark'
  | 'nordic-night'
  | 'dracula-castle'
  | 'matrix-hacker'
  | 'gruvbox-dark'
  | 'synthwave-84'
  | 'cyberpunk-2077'
  | 'twilight-forest'
  | 'crimson-shadow'
  | 'violet-night'
  | 'rust-desert'
  | 'cozy-fireplace'
  | 'ice-berg'
  | 'shadow-realm'
  | 'acid-green'
  | 'sapphire-depths'
  | 'amethyst-crystal'
  | 'ruby-red'
  | 'sunset-glow'
  | 'ocean-breeze'
  | 'sakura-night'
  | 'copper-ore'
  | 'bronze-age'
  | 'silver-lining'
  | 'charcoal-slate'
  | 'vampire-hunter'
  | 'neon-yellow'
  | 'deep-maroon'
  | 'forest-canopy'
  | 'autumn-leaves';

interface ThemeContextType {
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Palette Configuration Dictionary
const palettes: Record<ThemeType, any> = {
  'classic-blue': {
    primary: '#2563eb', // Royal Blue
    secondary: '#7c3aed', // Violet
    background: '#f8fafc',
    paper: '#ffffff',
    text: '#0f172a',
    mode: 'light',
  },
  'tricolor-glow': {
    primary: '#ff9933', // Saffron
    secondary: '#128807', // Emerald Green
    background: '#fcfdfa',
    paper: '#ffffff',
    text: '#0b160b',
    mode: 'light',
  },
  'midnight-obsidian': {
    primary: '#38bdf8', // Sky Blue
    secondary: '#fb7185', // Rose Pink
    background: '#0f172a', // Deep Slate
    paper: '#1e293b',
    text: '#f8fafc',
    mode: 'dark',
  },
  'cyberpunk-neon': {
    primary: '#f43f5e', // Hot pink
    secondary: '#06b6d4', // Cyan
    background: '#090514', // Neon Dark
    paper: '#120d24',
    text: '#f8fafc',
    mode: 'dark',
  },
  'sunset-amber': {
    primary: '#d97706', // Amber Orange
    secondary: '#b91c1c', // Crimson
    background: '#fffbeb',
    paper: '#ffffff',
    text: '#451a03',
    mode: 'light',
  },
  'forest-mint': {
    primary: '#059669', // Emerald
    secondary: '#10b981', // Mint
    background: '#f0fdf4',
    paper: '#ffffff',
    text: '#022c22',
    mode: 'light',
  },
  'lavender-breeze': {
    primary: '#8b5cf6', // Lavender
    secondary: '#ec4899', // Pink
    background: '#faf5ff',
    paper: '#ffffff',
    text: '#2e1065',
    mode: 'light',
  },
  'crimson-gold': {
    primary: '#be123c', // Crimson
    secondary: '#d97706', // Gold
    background: '#fdf2f8',
    paper: '#ffffff',
    text: '#4c0519',
    mode: 'light',
  },
  'sakura-blossom': {
    primary: '#ec4899', // Blossom Pink
    secondary: '#f43f5e', // Rose
    background: '#fff5f7',
    paper: '#ffffff',
    text: '#4c0519',
    mode: 'light',
  },
  'teal-wave': {
    primary: '#0d9488', // Teal
    secondary: '#0ea5e9', // Sky Blue
    background: '#f0fdfa',
    paper: '#ffffff',
    text: '#042f2e',
    mode: 'light',
  },
  'deep-space': {
    primary: '#818cf8', // Indigo
    secondary: '#c084fc', // Purple
    background: '#030712', // Black Space
    paper: '#111827',
    text: '#f3f4f6',
    mode: 'dark',
  },
  'chocolate-mocha': {
    primary: '#78350f', // Cocoa Brown
    secondary: '#d97706', // Caramel
    background: '#fffbeb',
    paper: '#ffffff',
    text: '#451a03',
    mode: 'light',
  },
  'monochrome-grey': {
    primary: '#1e293b', // Slate
    secondary: '#64748b', // Grey
    background: '#f1f5f9',
    paper: '#ffffff',
    text: '#0f172a',
    mode: 'light',
  },
  'solarized-light': {
    primary: '#b58900', // Solarized Yellow
    secondary: '#2aa198', // Solarized Cyan
    background: '#fdf6e3', // Solarized Base3
    paper: '#eee8d5',
    text: '#586e75',
    mode: 'light',
  },
  'nord-frost': {
    primary: '#88c0d0', // Ice Blue
    secondary: '#81a1c1', // Frost Blue
    background: '#2e3440', // Polar Night Dark
    paper: '#3b4252',
    text: '#eceff4',
    mode: 'dark',
  },
  'dracula-vampire': {
    primary: '#bd93f9', // Purple
    secondary: '#ff79c6', // Pink
    background: '#282a36', // Dracula Dark
    paper: '#44475a',
    text: '#f8f8f2',
    mode: 'dark',
  },
  'matrix-code': {
    primary: '#00ff00', // Neon Green
    secondary: '#003300', // Dark Green
    background: '#000000', // Pitch Black
    paper: '#0d0d0d',
    text: '#33ff33',
    mode: 'dark',
  },
  'gruvbox-retro': {
    primary: '#fe8019', // Orange
    secondary: '#fabd2f', // Yellow
    background: '#1d2021', // Dark Gruvbox
    paper: '#3c3836',
    text: '#fdbb2d',
    mode: 'dark',
  },
  'oceanic-abyss': {
    primary: '#00fedc', // Bright Aqua
    secondary: '#0080ff', // Ocean Blue
    background: '#010b14', // Abyss Black/Blue
    paper: '#02182c',
    text: '#e6f2ff',
    mode: 'dark',
  },
  'cotton-candy': {
    primary: '#ff7eb9', // Soft Pink
    secondary: '#7afcff', // Soft Cyan
    background: '#fff0f5', // Pastel Pink Light
    paper: '#ffffff',
    text: '#4a0e2e',
    mode: 'light',
  },
  'emerald-luxury': {
    primary: '#10b981', // Gold Emerald
    secondary: '#f59e0b', // Amber Gold
    background: '#064e3b', // Deep Forest Green
    paper: '#047857',
    text: '#ffffff',
    mode: 'dark',
  },
  'coffee-beans': {
    primary: '#b45309', // Roasted Brown
    secondary: '#d97706', // Caramel
    background: '#1c1917', // Stone Coffee Dark
    paper: '#292524',
    text: '#fafaf9',
    mode: 'dark',
  },
  'cyber-future': {
    primary: '#d946ef', // Fuchsia
    secondary: '#eab308', // Yellow
    background: '#0f052d', // Deep Cyber Indigo
    paper: '#1a0b47',
    text: '#ffffff',
    mode: 'dark',
  },
  'aurora-borealis': {
    primary: '#34d399', // Green Aurora
    secondary: '#3b82f6', // Blue Flow
    background: '#080d1a', // Polar Dark
    paper: '#111c33',
    text: '#e8f0fe',
    mode: 'dark',
  },
  'royal-velvet': {
    primary: '#a855f7', // Purple Velvet
    secondary: '#fb923c', // Sunset Bronze
    background: '#1e1b4b', // Deep Indigo Velvet
    paper: '#312e81',
    text: '#ffffff',
    mode: 'dark',
  },
  'steel-glacier': {
    primary: '#475569', // Cool Slate
    secondary: '#94a3b8', // Silver Slate
    background: '#f1f5f9', // Glacier Light
    paper: '#ffffff',
    text: '#0f172a',
    mode: 'light',
  },
  'pumpkin-spice': {
    primary: '#c2410c', // Dark Orange
    secondary: '#854d0e', // Mustard Yellow
    background: '#fff7ed', // Pumpkin Light
    paper: '#ffffff',
    text: '#431407',
    mode: 'light',
  },
  'rose-gold': {
    primary: '#fda4af', // Rose Gold
    secondary: '#e11d48', // Deep Rose
    background: '#fff1f2', // Gold Light
    paper: '#ffffff',
    text: '#4c0519',
    mode: 'light',
  },
  'pitch-black': {
      "primary": "#ffffff",
      "secondary": "#94a3b8",
      "background": "#000000",
      "paper": "#09090b",
      "text": "#fafafa",
      "mode": "dark"
  },
  'deep-obsidian': {
      "primary": "#f43f5e",
      "secondary": "#e2e8f0",
      "background": "#05070a",
      "paper": "#0f131a",
      "text": "#f8fafc",
      "mode": "dark"
  },
  'cyber-neon': {
      "primary": "#06b6d4",
      "secondary": "#f43f5e",
      "background": "#030208",
      "paper": "#0b0714",
      "text": "#ecfeff",
      "mode": "dark"
  },
  'dark-galaxy': {
      "primary": "#c084fc",
      "secondary": "#60a5fa",
      "background": "#02000a",
      "paper": "#0b041a",
      "text": "#f5f3ff",
      "mode": "dark"
  },
  'carbon-slate': {
      "primary": "#a1a1aa",
      "secondary": "#52525b",
      "background": "#09090b",
      "paper": "#18181b",
      "text": "#fafafa",
      "mode": "dark"
  },
  'toxic-ooze': {
      "primary": "#a3e635",
      "secondary": "#16a34a",
      "background": "#050a02",
      "paper": "#0d1706",
      "text": "#f4fbf0",
      "mode": "dark"
  },
  'plasma-fire': {
      "primary": "#f97316",
      "secondary": "#e11d48",
      "background": "#080201",
      "paper": "#140603",
      "text": "#fff7ed",
      "mode": "dark"
  },
  'blood-moon': {
      "primary": "#ef4444",
      "secondary": "#7f1d1d",
      "background": "#0a0102",
      "paper": "#140305",
      "text": "#fef2f2",
      "mode": "dark"
  },
  'electric-storm': {
      "primary": "#818cf8",
      "secondary": "#a5b4fc",
      "background": "#060613",
      "paper": "#111129",
      "text": "#e0e7ff",
      "mode": "dark"
  },
  'space-nebula': {
      "primary": "#e879f9",
      "secondary": "#818cf8",
      "background": "#05020c",
      "paper": "#120724",
      "text": "#fdf4ff",
      "mode": "dark"
  },
  'emerald-abyss': {
      "primary": "#34d399",
      "secondary": "#064e3b",
      "background": "#020a06",
      "paper": "#06170f",
      "text": "#ecfdf5",
      "mode": "dark"
  },
  'gold-mine': {
      "primary": "#facc15",
      "secondary": "#ca8a04",
      "background": "#080601",
      "paper": "#141003",
      "text": "#fef9c3",
      "mode": "dark"
  },
  'cold-glacier': {
      "primary": "#7dd3fc",
      "secondary": "#0284c7",
      "background": "#020813",
      "paper": "#061529",
      "text": "#f0f9ff",
      "mode": "dark"
  },
  'volcanic-ash': {
      "primary": "#f87171",
      "secondary": "#4b5563",
      "background": "#0b0b0d",
      "paper": "#17171c",
      "text": "#f9fafb",
      "mode": "dark"
  },
  'deep-sea-trench': {
      "primary": "#38bdf8",
      "secondary": "#1d4ed8",
      "background": "#010510",
      "paper": "#040f24",
      "text": "#f0f9ff",
      "mode": "dark"
  },
  'ghostly-fog': {
      "primary": "#e2e8f0",
      "secondary": "#94a3b8",
      "background": "#0f172a",
      "paper": "#1e293b",
      "text": "#f8fafc",
      "mode": "dark"
  },
  'monochrome-coal': {
      "primary": "#fafafa",
      "secondary": "#52525b",
      "background": "#000000",
      "paper": "#0c0c0e",
      "text": "#fafafa",
      "mode": "dark"
  },
  'solarized-dark': {
      "primary": "#268bd2",
      "secondary": "#859900",
      "background": "#002b36",
      "paper": "#073642",
      "text": "#839496",
      "mode": "dark"
  },
  'nordic-night': {
      "primary": "#88c0d0",
      "secondary": "#5e81ac",
      "background": "#2e3440",
      "paper": "#3b4252",
      "text": "#eceff4",
      "mode": "dark"
  },
  'dracula-castle': {
      "primary": "#bd93f9",
      "secondary": "#50fa7b",
      "background": "#1e1f29",
      "paper": "#282a36",
      "text": "#f8f8f2",
      "mode": "dark"
  },
  'matrix-hacker': {
      "primary": "#00ff00",
      "secondary": "#008f11",
      "background": "#000000",
      "paper": "#050c05",
      "text": "#33ff33",
      "mode": "dark"
  },
  'gruvbox-dark': {
      "primary": "#fe8019",
      "secondary": "#b8bb26",
      "background": "#282828",
      "paper": "#3c3836",
      "text": "#ebdbb2",
      "mode": "dark"
  },
  'synthwave-84': {
      "primary": "#f3ef7a",
      "secondary": "#2fe6de",
      "background": "#261447",
      "paper": "#2e1c52",
      "text": "#ffffff",
      "mode": "dark"
  },
  'cyberpunk-2077': {
      "primary": "#fcee0a",
      "secondary": "#00f0ff",
      "background": "#030303",
      "paper": "#1a1a1a",
      "text": "#00f0ff",
      "mode": "dark"
  },
  'twilight-forest': {
      "primary": "#059669",
      "secondary": "#78350f",
      "background": "#061712",
      "paper": "#0b261d",
      "text": "#f0fdf4",
      "mode": "dark"
  },
  'crimson-shadow': {
      "primary": "#f43f5e",
      "secondary": "#4c0519",
      "background": "#0a0104",
      "paper": "#17030a",
      "text": "#fff1f2",
      "mode": "dark"
  },
  'violet-night': {
      "primary": "#a78bfa",
      "secondary": "#4c1d95",
      "background": "#090514",
      "paper": "#120c24",
      "text": "#f5f3ff",
      "mode": "dark"
  },
  'rust-desert': {
      "primary": "#f97316",
      "secondary": "#7c2d12",
      "background": "#0f0502",
      "paper": "#1d0c06",
      "text": "#fff7ed",
      "mode": "dark"
  },
  'cozy-fireplace': {
      "primary": "#fbbf24",
      "secondary": "#b45309",
      "background": "#170b02",
      "paper": "#271405",
      "text": "#fffbeb",
      "mode": "dark"
  },
  'ice-berg': {
      "primary": "#bfdbfe",
      "secondary": "#1e3a8a",
      "background": "#0b132b",
      "paper": "#1c2541",
      "text": "#f1f5f9",
      "mode": "dark"
  },
  'shadow-realm': {
      "primary": "#c084fc",
      "secondary": "#1e1b4b",
      "background": "#05020c",
      "paper": "#0d071d",
      "text": "#f3e8ff",
      "mode": "dark"
  },
  'acid-green': {
      "primary": "#22c55e",
      "secondary": "#14532d",
      "background": "#020a04",
      "paper": "#06170a",
      "text": "#f0fdf4",
      "mode": "dark"
  },
  'sapphire-depths': {
      "primary": "#3b82f6",
      "secondary": "#1d4ed8",
      "background": "#02071a",
      "paper": "#051336",
      "text": "#eff6ff",
      "mode": "dark"
  },
  'amethyst-crystal': {
      "primary": "#c084fc",
      "secondary": "#581c87",
      "background": "#07020d",
      "paper": "#130624",
      "text": "#faf5ff",
      "mode": "dark"
  },
  'ruby-red': {
      "primary": "#fb7185",
      "secondary": "#881337",
      "background": "#0c0104",
      "paper": "#1a040b",
      "text": "#fff1f2",
      "mode": "dark"
  },
  'sunset-glow': {
      "primary": "#fb923c",
      "secondary": "#ec4899",
      "background": "#0f0208",
      "paper": "#1c0410",
      "text": "#fff1f2",
      "mode": "dark"
  },
  'ocean-breeze': {
      "primary": "#22d3ee",
      "secondary": "#0891b2",
      "background": "#010a0e",
      "paper": "#031b26",
      "text": "#ecfeff",
      "mode": "dark"
  },
  'sakura-night': {
      "primary": "#fbcfe8",
      "secondary": "#db2777",
      "background": "#0d0208",
      "paper": "#1b0512",
      "text": "#fdf2f8",
      "mode": "dark"
  },
  'copper-ore': {
      "primary": "#d97706",
      "secondary": "#78350f",
      "background": "#0f0702",
      "paper": "#1d1005",
      "text": "#fffbeb",
      "mode": "dark"
  },
  'bronze-age': {
      "primary": "#eab308",
      "secondary": "#854d0e",
      "background": "#0e0902",
      "paper": "#1b1205",
      "text": "#fefec2",
      "mode": "dark"
  },
  'silver-lining': {
      "primary": "#cbd5e1",
      "secondary": "#475569",
      "background": "#0b0f17",
      "paper": "#161e2e",
      "text": "#f8fafc",
      "mode": "dark"
  },
  'charcoal-slate': {
      "primary": "#9ca3af",
      "secondary": "#374151",
      "background": "#0c0d0f",
      "paper": "#181a1f",
      "text": "#f9fafb",
      "mode": "dark"
  },
  'vampire-hunter': {
      "primary": "#f43f5e",
      "secondary": "#4c0519",
      "background": "#020002",
      "paper": "#0c050c",
      "text": "#fff1f2",
      "mode": "dark"
  },
  'neon-yellow': {
      "primary": "#fef08a",
      "secondary": "#ca8a04",
      "background": "#070701",
      "paper": "#131303",
      "text": "#fef9c3",
      "mode": "dark"
  },
  'deep-maroon': {
      "primary": "#be185d",
      "secondary": "#831843",
      "background": "#0a0104",
      "paper": "#14030a",
      "text": "#fdf2f8",
      "mode": "dark"
  },
  'forest-canopy': {
      "primary": "#4ade80",
      "secondary": "#15803d",
      "background": "#020603",
      "paper": "#05130b",
      "text": "#f0fdf4",
      "mode": "dark"
  },
  'autumn-leaves': {
      "primary": "#f97316",
      "secondary": "#9a3412",
      "background": "#0f0502",
      "paper": "#1b0d06",
      "text": "#fff7ed",
      "mode": "dark"
  },
};

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeType, setThemeTypeState] = useState<ThemeType>('classic-blue');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme-type') as ThemeType;
    if (saved && palettes[saved]) {
      setThemeTypeState(saved);
    }
    setMounted(true);
  }, []);

  const setThemeType = (type: ThemeType) => {
    setThemeTypeState(type);
    localStorage.setItem('theme-type', type);
  };

  const currentPalette = palettes[themeType];

  let activeTheme = createTheme({
    palette: {
      mode: currentPalette.mode,
      primary: {
        main: currentPalette.primary,
        contrastText: currentPalette.mode === 'dark' ? '#ffffff' : '#ffffff',
      },
      secondary: {
        main: currentPalette.secondary,
        contrastText: '#ffffff',
      },
      background: {
        default: currentPalette.background,
        paper: currentPalette.paper,
      },
      text: {
        primary: currentPalette.text,
      },
    },
    typography: {
      fontFamily: '"Inter", "Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
      h1: { fontFamily: '"Poppins", sans-serif', fontWeight: 800 },
      h2: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
      h3: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
      h4: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
      h5: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
      h6: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 18px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            },
          },
        },
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              background: `linear-gradient(135deg, ${currentPalette.primary}, ${currentPalette.secondary})`,
              color: '#ffffff',
              '&:hover': {
                opacity: 0.9,
              },
            },
          },
          {
            props: { variant: 'contained', color: 'secondary' },
            style: {
              background: `linear-gradient(135deg, ${currentPalette.secondary}, ${currentPalette.primary})`,
              color: '#ffffff',
              '&:hover': {
                opacity: 0.9,
              },
            },
          },
        ],
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            border: '1px solid',
            borderColor: currentPalette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 20px -8px rgba(0, 0, 0, 0.12)',
              borderColor: currentPalette.primary,
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'small',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
    },
  });

  activeTheme = responsiveFontSizes(activeTheme);

  return (
    <ThemeContext.Provider value={{ themeType, setThemeType }}>
      <ThemeProvider theme={activeTheme}>
        <div style={{ opacity: mounted ? 1 : 0 }}>
          {children}
        </div>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within CustomThemeProvider');
  }
  return context;
}
