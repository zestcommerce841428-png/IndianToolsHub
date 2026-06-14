const fs = require('fs');
const path = require('path');

const newThemes = [
  { id: 'pitch-black', name: 'Pitch Black', color: '#ffffff', palette: { primary: '#ffffff', secondary: '#94a3b8', background: '#000000', paper: '#09090b', text: '#fafafa', mode: 'dark' } },
  { id: 'deep-obsidian', name: 'Deep Obsidian', color: '#f43f5e', palette: { primary: '#f43f5e', secondary: '#e2e8f0', background: '#05070a', paper: '#0f131a', text: '#f8fafc', mode: 'dark' } },
  { id: 'cyber-neon', name: 'Cyber Neon', color: '#06b6d4', palette: { primary: '#06b6d4', secondary: '#f43f5e', background: '#030208', paper: '#0b0714', text: '#ecfeff', mode: 'dark' } },
  { id: 'dark-galaxy', name: 'Dark Galaxy', color: '#c084fc', palette: { primary: '#c084fc', secondary: '#60a5fa', background: '#02000a', paper: '#0b041a', text: '#f5f3ff', mode: 'dark' } },
  { id: 'carbon-slate', name: 'Carbon Slate', color: '#71717a', palette: { primary: '#a1a1aa', secondary: '#52525b', background: '#09090b', paper: '#18181b', text: '#fafafa', mode: 'dark' } },
  { id: 'toxic-ooze', name: 'Toxic Ooze', color: '#a3e635', palette: { primary: '#a3e635', secondary: '#16a34a', background: '#050a02', paper: '#0d1706', text: '#f4fbf0', mode: 'dark' } },
  { id: 'plasma-fire', name: 'Plasma Fire', color: '#f97316', palette: { primary: '#f97316', secondary: '#e11d48', background: '#080201', paper: '#140603', text: '#fff7ed', mode: 'dark' } },
  { id: 'blood-moon', name: 'Blood Moon', color: '#dc2626', palette: { primary: '#ef4444', secondary: '#7f1d1d', background: '#0a0102', paper: '#140305', text: '#fef2f2', mode: 'dark' } },
  { id: 'electric-storm', name: 'Electric Storm', color: '#6366f1', palette: { primary: '#818cf8', secondary: '#a5b4fc', background: '#060613', paper: '#111129', text: '#e0e7ff', mode: 'dark' } },
  { id: 'space-nebula', name: 'Space Nebula', color: '#d946ef', palette: { primary: '#e879f9', secondary: '#818cf8', background: '#05020c', paper: '#120724', text: '#fdf4ff', mode: 'dark' } },
  { id: 'emerald-abyss', name: 'Emerald Abyss', color: '#10b981', palette: { primary: '#34d399', secondary: '#064e3b', background: '#020a06', paper: '#06170f', text: '#ecfdf5', mode: 'dark' } },
  { id: 'gold-mine', name: 'Gold Mine', color: '#eab308', palette: { primary: '#facc15', secondary: '#ca8a04', background: '#080601', paper: '#141003', text: '#fef9c3', mode: 'dark' } },
  { id: 'cold-glacier', name: 'Cold Glacier', color: '#38bdf8', palette: { primary: '#7dd3fc', secondary: '#0284c7', background: '#020813', paper: '#061529', text: '#f0f9ff', mode: 'dark' } },
  { id: 'volcanic-ash', name: 'Volcanic Ash', color: '#ef4444', palette: { primary: '#f87171', secondary: '#4b5563', background: '#0b0b0d', paper: '#17171c', text: '#f9fafb', mode: 'dark' } },
  { id: 'deep-sea-trench', name: 'Deep Sea Trench', color: '#0ea5e9', palette: { primary: '#38bdf8', secondary: '#1d4ed8', background: '#010510', paper: '#040f24', text: '#f0f9ff', mode: 'dark' } },
  { id: 'ghostly-fog', name: 'Ghostly Fog', color: '#cbd5e1', palette: { primary: '#e2e8f0', secondary: '#94a3b8', background: '#0f172a', paper: '#1e293b', text: '#f8fafc', mode: 'dark' } },
  { id: 'monochrome-coal', name: 'Monochrome Coal', color: '#27272a', palette: { primary: '#fafafa', secondary: '#52525b', background: '#000000', paper: '#0c0c0e', text: '#fafafa', mode: 'dark' } },
  { id: 'solarized-dark', name: 'Solarized Dark', color: '#268bd2', palette: { primary: '#268bd2', secondary: '#859900', background: '#002b36', paper: '#073642', text: '#839496', mode: 'dark' } },
  { id: 'nordic-night', name: 'Nordic Night', color: '#88c0d0', palette: { primary: '#88c0d0', secondary: '#5e81ac', background: '#2e3440', paper: '#3b4252', text: '#eceff4', mode: 'dark' } },
  { id: 'dracula-castle', name: 'Dracula Castle', color: '#ff79c6', palette: { primary: '#bd93f9', secondary: '#50fa7b', background: '#1e1f29', paper: '#282a36', text: '#f8f8f2', mode: 'dark' } },
  { id: 'matrix-hacker', name: 'Matrix Hacker', color: '#00ff00', palette: { primary: '#00ff00', secondary: '#008f11', background: '#000000', paper: '#050c05', text: '#33ff33', mode: 'dark' } },
  { id: 'gruvbox-dark', name: 'Gruvbox Dark', color: '#fe8019', palette: { primary: '#fe8019', secondary: '#b8bb26', background: '#282828', paper: '#3c3836', text: '#ebdbb2', mode: 'dark' } },
  { id: 'synthwave-84', name: 'Synthwave 84', color: '#ff7eb9', palette: { primary: '#f3ef7a', secondary: '#2fe6de', background: '#261447', paper: '#2e1c52', text: '#ffffff', mode: 'dark' } },
  { id: 'cyberpunk-2077', name: 'Cyberpunk 2077', color: '#fcee0a', palette: { primary: '#fcee0a', secondary: '#00f0ff', background: '#030303', paper: '#1a1a1a', text: '#00f0ff', mode: 'dark' } },
  { id: 'twilight-forest', name: 'Twilight Forest', color: '#10b981', palette: { primary: '#059669', secondary: '#78350f', background: '#061712', paper: '#0b261d', text: '#f0fdf4', mode: 'dark' } },
  { id: 'crimson-shadow', name: 'Crimson Shadow', color: '#e11d48', palette: { primary: '#f43f5e', secondary: '#4c0519', background: '#0a0104', paper: '#17030a', text: '#fff1f2', mode: 'dark' } },
  { id: 'violet-night', name: 'Violet Night', color: '#7c3aed', palette: { primary: '#a78bfa', secondary: '#4c1d95', background: '#090514', paper: '#120c24', text: '#f5f3ff', mode: 'dark' } },
  { id: 'rust-desert', name: 'Rust Desert', color: '#ea580c', palette: { primary: '#f97316', secondary: '#7c2d12', background: '#0f0502', paper: '#1d0c06', text: '#fff7ed', mode: 'dark' } },
  { id: 'cozy-fireplace', name: 'Cozy Fireplace', color: '#f59e0b', palette: { primary: '#fbbf24', secondary: '#b45309', background: '#170b02', paper: '#271405', text: '#fffbeb', mode: 'dark' } },
  { id: 'ice-berg', name: 'Ice Berg', color: '#93c5fd', palette: { primary: '#bfdbfe', secondary: '#1e3a8a', background: '#0b132b', paper: '#1c2541', text: '#f1f5f9', mode: 'dark' } },
  { id: 'shadow-realm', name: 'Shadow Realm', color: '#8b5cf6', palette: { primary: '#c084fc', secondary: '#1e1b4b', background: '#05020c', paper: '#0d071d', text: '#f3e8ff', mode: 'dark' } },
  { id: 'acid-green', name: 'Acid Green', color: '#4ade80', palette: { primary: '#22c55e', secondary: '#14532d', background: '#020a04', paper: '#06170a', text: '#f0fdf4', mode: 'dark' } },
  { id: 'sapphire-depths', name: 'Sapphire Depths', color: '#1e40af', palette: { primary: '#3b82f6', secondary: '#1d4ed8', background: '#02071a', paper: '#051336', text: '#eff6ff', mode: 'dark' } },
  { id: 'amethyst-crystal', name: 'Amethyst Crystal', color: '#a855f7', palette: { primary: '#c084fc', secondary: '#581c87', background: '#07020d', paper: '#130624', text: '#faf5ff', mode: 'dark' } },
  { id: 'ruby-red', name: 'Ruby Red', color: '#be123c', palette: { primary: '#fb7185', secondary: '#881337', background: '#0c0104', paper: '#1a040b', text: '#fff1f2', mode: 'dark' } },
  { id: 'sunset-glow', name: 'Sunset Glow', color: '#f43f5e', palette: { primary: '#fb923c', secondary: '#ec4899', background: '#0f0208', paper: '#1c0410', text: '#fff1f2', mode: 'dark' } },
  { id: 'ocean-breeze', name: 'Ocean Breeze', color: '#06b6d4', palette: { primary: '#22d3ee', secondary: '#0891b2', background: '#010a0e', paper: '#031b26', text: '#ecfeff', mode: 'dark' } },
  { id: 'sakura-night', name: 'Sakura Night', color: '#f472b6', palette: { primary: '#fbcfe8', secondary: '#db2777', background: '#0d0208', paper: '#1b0512', text: '#fdf2f8', mode: 'dark' } },
  { id: 'copper-ore', name: 'Copper Ore', color: '#b45309', palette: { primary: '#d97706', secondary: '#78350f', background: '#0f0702', paper: '#1d1005', text: '#fffbeb', mode: 'dark' } },
  { id: 'bronze-age', name: 'Bronze Age', color: '#ca8a04', palette: { primary: '#eab308', secondary: '#854d0e', background: '#0e0902', paper: '#1b1205', text: '#fefec2', mode: 'dark' } },
  { id: 'silver-lining', name: 'Silver Lining', color: '#94a3b8', palette: { primary: '#cbd5e1', secondary: '#475569', background: '#0b0f17', paper: '#161e2e', text: '#f8fafc', mode: 'dark' } },
  { id: 'charcoal-slate', name: 'Charcoal Slate', color: '#4b5563', palette: { primary: '#9ca3af', secondary: '#374151', background: '#0c0d0f', paper: '#181a1f', text: '#f9fafb', mode: 'dark' } },
  { id: 'vampire-hunter', name: 'Vampire Hunter', color: '#e11d48', palette: { primary: '#f43f5e', secondary: '#4c0519', background: '#020002', paper: '#0c050c', text: '#fff1f2', mode: 'dark' } },
  { id: 'neon-yellow', name: 'Neon Yellow', color: '#eab308', palette: { primary: '#fef08a', secondary: '#ca8a04', background: '#070701', paper: '#131303', text: '#fef9c3', mode: 'dark' } },
  { id: 'deep-maroon', name: 'Deep Maroon', color: '#9d174d', palette: { primary: '#be185d', secondary: '#831843', background: '#0a0104', paper: '#14030a', text: '#fdf2f8', mode: 'dark' } },
  { id: 'forest-canopy', name: 'Forest Canopy', color: '#16a34a', palette: { primary: '#4ade80', secondary: '#15803d', background: '#020603', paper: '#05130b', text: '#f0fdf4', mode: 'dark' } },
  { id: 'autumn-leaves', name: 'Autumn Leaves', color: '#d97706', palette: { primary: '#f97316', secondary: '#9a3412', background: '#0f0502', paper: '#1b0d06', text: '#fff7ed', mode: 'dark' } }
];

// 1. Update src/context/ThemeContext.tsx
let themeContextPath = 'src/context/ThemeContext.tsx';
if (fs.existsSync(themeContextPath)) {
  let content = fs.readFileSync(themeContextPath, 'utf8');

  // Insert ThemeType entries
  const typeIds = newThemes.map(t => `  | '${t.id}'`).join('\n');
  content = content.replace("  | 'pumpkin-spice'\n  | 'rose-gold';", "  | 'pumpkin-spice'\n  | 'rose-gold'\n" + typeIds + ";");

  // Insert palette entries
  const paletteEntries = newThemes.map(t => `  '${t.id}': ${JSON.stringify(t.palette, null, 4).replace(/\n/g, '\n  ')},`).join('\n');
  content = content.replace("  'rose-gold': {\n    primary: '#fda4af',\n    secondary: '#e11d48',\n    background: '#fff1f2',\n    paper: '#ffffff',\n    text: '#4c0519',\n    mode: 'light',\n  },", "  'rose-gold': {\n    primary: '#fda4af',\n    secondary: '#e11d48',\n    background: '#fff1f2',\n    paper: '#ffffff',\n    text: '#4c0519',\n    mode: 'light',\n  },\n" + paletteEntries);

  fs.writeFileSync(themeContextPath, content, 'utf8');
  console.log('Successfully updated ThemeContext.tsx');
}

// 2. Update src/components/Header.tsx
let headerPath = 'src/components/Header.tsx';
if (fs.existsSync(headerPath)) {
  let content = fs.readFileSync(headerPath, 'utf8');
  
  // Insert themeChoices entries
  const choices = newThemes.map(t => `  { id: '${t.id}', name: '${t.name}', color: '${t.color}' },`).join('\n');
  content = content.replace("  { id: 'rose-gold', name: 'Rose Gold', color: '#fda4af' },", "  { id: 'rose-gold', name: 'Rose Gold', color: '#fda4af' },\n" + choices);

  fs.writeFileSync(headerPath, content, 'utf8');
  console.log('Successfully updated Header.tsx');
}
