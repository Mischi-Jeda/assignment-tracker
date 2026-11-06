/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/styles/global.css';

import { Platform } from 'react-native';

export const AppColors = {
  pageBg: '#f8fafc', cardBg: '#ffffff', inputBg: '#f1f5f9',
  primary: '#2563eb', primaryLight: '#dbeafe',
  danger: '#ef4444', dangerLight: '#fee2e2', warning: '#f59e0b', warningLight: '#fef3c7',
  success: '#16a34a', successLight: '#dcfce7', urgentBg: '#fef2f2', urgentBorder: '#fecaca',
  urgentText: '#7f1d1d', urgentSubText: '#b91c1c', textPrimary: '#0f172a',
  textSecondary: '#64748b', textMuted: '#94a3b8', textBody: '#334155', textMedium: '#475569',
  borderLight: '#e2e8f0', borderFocus: '#2563eb', navBg: '#ffffff', navBorder: '#e2e8f0',
  navActive: '#dbeafe', navActiveIcon: '#2563eb', navInactiveIcon: '#94a3b8', fab: '#2563eb', fabShadow: '#000',
} as const;

export const Radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 } as const;
export const FontSizes = { caption: 11, small: 13, body: 15, heading: 18, title: 24 } as const;
export const Shadow = {
  card: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  fab: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
} as const;

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
