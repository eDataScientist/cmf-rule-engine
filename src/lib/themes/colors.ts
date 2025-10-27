export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  // Gradient colors for body background
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
}

export const motorTheme: ThemeColors = {
  background: 'oklch(97% 0.015 250)',
  foreground: 'oklch(23% 0.015 250)',
  card: 'oklch(100% 0 0 / 0.82)',
  cardForeground: 'oklch(20% 0.012 250)',
  popover: 'oklch(100% 0 0 / 0.9)',
  popoverForeground: 'oklch(22% 0.012 250)',
  primary: 'oklch(63% 0.12 240)',
  primaryForeground: 'oklch(98% 0.01 250)',
  secondary: 'oklch(93% 0.02 230 / 0.75)',
  secondaryForeground: 'oklch(25% 0.01 240)',
  muted: 'oklch(92% 0.01 240)',
  mutedForeground: 'oklch(52% 0.02 245)',
  accent: 'oklch(95% 0.04 220 / 0.75)',
  accentForeground: 'oklch(28% 0.015 245)',
  destructive: 'oklch(63% 0.17 25)',
  destructiveForeground: 'oklch(98% 0 0)',
  border: 'oklch(88% 0.01 230 / 0.6)',
  input: 'oklch(92% 0.01 230 / 0.9)',
  ring: 'oklch(60% 0.12 240)',
  // Blue gradients
  gradientStart: 'rgba(136, 193, 255, 0.22)',
  gradientMid: 'rgba(209, 233, 255, 0.4)',
  gradientEnd: 'rgba(248, 252, 255, 0.95)',
};

export const medicalTheme: ThemeColors = {
  background: 'oklch(97% 0.015 150)',
  foreground: 'oklch(23% 0.015 150)',
  card: 'oklch(100% 0 0 / 0.82)',
  cardForeground: 'oklch(20% 0.012 150)',
  popover: 'oklch(100% 0 0 / 0.9)',
  popoverForeground: 'oklch(22% 0.012 150)',
  primary: 'oklch(65% 0.14 155)',
  primaryForeground: 'oklch(98% 0.01 150)',
  secondary: 'oklch(93% 0.02 145 / 0.75)',
  secondaryForeground: 'oklch(25% 0.01 150)',
  muted: 'oklch(92% 0.01 150)',
  mutedForeground: 'oklch(52% 0.02 155)',
  accent: 'oklch(95% 0.04 140 / 0.75)',
  accentForeground: 'oklch(28% 0.015 150)',
  destructive: 'oklch(63% 0.17 25)',
  destructiveForeground: 'oklch(98% 0 0)',
  border: 'oklch(88% 0.01 145 / 0.6)',
  input: 'oklch(92% 0.01 145 / 0.9)',
  ring: 'oklch(62% 0.14 155)',
  // Green gradients
  gradientStart: 'rgba(136, 255, 193, 0.22)',
  gradientMid: 'rgba(209, 255, 233, 0.4)',
  gradientEnd: 'rgba(248, 255, 252, 0.95)',
};

export const themes = {
  motor: motorTheme,
  medical: medicalTheme,
};
