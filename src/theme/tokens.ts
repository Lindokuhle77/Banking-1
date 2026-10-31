const light = {
  ink: '#1B1F4B',       // brand: hero cards, primary buttons, selected chips
  link: '#1B1F4B',      // brand colour used as text/icons on the page background
  paper: '#F6F7FB',     // app background
  surface: '#FFFFFF',   // cards
  marigold: '#F2B134',  // single accent
  text: '#161833',
  muted: '#6B6F8D',
  line: '#E3E5F0',
  positive: '#1F9D6B',
  negative: '#D64550',
};
type Palette = typeof light;

const dark: Palette = {
  ink: '#4A52D6',
  link: '#AEB4FF',
  paper: '#0D0F1F',
  surface: '#171A30',
  marigold: '#F2B134',
  text: '#ECEEF8',
  muted: '#A3A7C8',
  line: '#2B2F52',
  positive: '#3DCB90',
  negative: '#FF6B75',
};

export const palettes = { light, dark };
// Mutable on purpose: screens re-render when the theme changes (see ThemeContext) and read the current values.
export const colors: Palette = { ...light };
export const applyPalette = (scheme: 'light' | 'dark') => { Object.assign(colors, palettes[scheme]); };

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 14, lg: 22 };

export const type = {
  display: { fontSize: 34, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '500' as const },
  small: { fontSize: 12, fontWeight: '400' as const },
};
