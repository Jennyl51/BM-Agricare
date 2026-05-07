export const BM = {
  blue: '#002F71',
  deepBlue: '#002F71',
  green: '#68BC45',
  grey: '#7F7F7F',
  black: '#0A0908',
  white: '#FFFFFF',
  cream: '#FFFDF6',
  softGreen: '#EAF6D9',
  mint: '#DDF2CF',
  teal: '#95D3D6',
  orange: '#F2A14A',
  yellow: '#F8D66D',
  pink: '#F0448C',
  ink: '#0A0908',
  muted: '#667085',
};

export const lightTheme = {
  mode: 'light' as const,
  bg: '#ECF8DD',
  bg2: '#F8FFF1',
  card: '#FFFFFF',
  cardSoft: '#F7FBF1',
  text: '#0A0908',
  muted: '#667085',
  border: '#DCE8D4',
  primary: BM.deepBlue,
  accent: BM.green,
  shadow: '#000000',
};

export const darkTheme = {
  mode: 'dark' as const,
  bg: '#071507',
  bg2: '#0B1F12',
  card: '#102617',
  cardSoft: '#15351F',
  text: '#F8FFF1',
  muted: '#C6D3C2',
  border: '#315B35',
  primary: '#79B6FF',
  accent: '#7BE05B',
  shadow: '#000000',
};

export const Colors = {
  light: { text: BM.ink, background: BM.white, tint: BM.deepBlue, icon: '#687076', tabIconDefault: '#687076', tabIconSelected: BM.deepBlue },
  dark: { text: BM.white, background: BM.black, tint: BM.green, icon: '#9BA1A6', tabIconDefault: '#9BA1A6', tabIconSelected: BM.green },
};
