// Design Tokens for EmberQuest V2
// Brand: EmberQuest, powered by Skilvi.

export const designTokens = {
  // Color System
  colors: {
    // Primary - Ember Orange (the literal "ember" in our name)
    primary: {
      50: '#fff7f0',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431007',
    },

    // Secondary - Deep Navy (graph/professional backbone)
    secondary: {
      50: '#f0f4ff',
      100: '#dbe4ff',
      200: '#b7c9ff',
      300: '#8eaee6',
      400: '#6485c9',
      500: '#3b63b2',
      600: '#2e4f94',
      700: '#233e77',
      800: '#1a2d5a',
      900: '#121c3f',
      950: '#0a1029',
    },

    // Accent - Electric Blue (premium CTA pop)
    accent: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },

    // Semantic Colors
    semantic: {
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
      },
      danger: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      },
      info: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
    },

    // Neutral Grayscale (Slate)
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },

    // Backgrounds (light theme)
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      elevated: '#f8fafc',
      subtle: '#f1f5f9',
      inverse: '#0f172a',
    },

    // Text
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      muted: '#94a3b8',
      disabled: '#cbd5e1',
      inverse: '#ffffff',
    },

    // Borders
    border: {
      default: '#e2e8f0',
      muted: '#f1f5f9',
      strong: '#cbd5e1',
      inverse: '#1e293b',
      focus: '#f97316',
    },

    // Surface tokens (used by elevated cards, modals)
    surface: {
      0: '#ffffff',
      1: '#fafbfc',
      2: '#f5f7fa',
      3: '#eef1f6',
      inverse: '#0f172a',
      inverseElevated: '#1e293b',
    },

    // Brand glow (used for hero accents, "ember" effect)
    ember: {
      soft: 'rgba(249, 115, 22, 0.15)',
      mid: 'rgba(249, 115, 22, 0.35)',
      strong: 'rgba(249, 115, 22, 0.55)',
    },
  },

  // Elevation shadows — premium soft shadows, ember-tinted where it makes sense
  shadows: {
    xs: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
    sm: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
    md: '0 4px 8px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
    lg: '0 12px 24px -8px rgba(15, 23, 42, 0.12), 0 4px 8px -4px rgba(15, 23, 42, 0.06)',
    xl: '0 24px 48px -12px rgba(15, 23, 42, 0.18), 0 8px 16px -8px rgba(15, 23, 42, 0.08)',
    '2xl': '0 32px 64px -16px rgba(15, 23, 42, 0.22)',
    ember: '0 12px 32px -12px rgba(249, 115, 22, 0.35)',
    focus: '0 0 0 3px rgba(249, 115, 22, 0.35)',
  },

  // Radii — Premium rounding scale
  radii: {
    none: '0px',
    sm: '0.25rem',
    base: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem',
    '3xl': '1.75rem',
    full: '9999px',
  },

  // Motion
  transitions: {
    fast: '120ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '180ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '260ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '380ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Typography
  typography: {
    fontFamilies: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'Inter, system-ui, -apple-system, sans-serif',
      serif: 'Georgia, serif',
      mono: 'IBM Plex Mono, "JetBrains Mono", ui-monospace, monospace',
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.8125rem',
      base: '0.9375rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
    },
    fontWeights: {
      hairline: '100',
      thin: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeights: {
      none: '1',
      tight: '1.15',
      snug: '1.3',
      base: '1.5',
      relaxed: '1.65',
      loose: '1.8',
    },
    letterSpacings: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.18em',
    },
  },

  // 8px grid
  spacing: {
    px: '1px',
    0: '0px',
    0.5: '2px',
    1: '4px',
    1.5: '6px',
    2: '8px',
    2.5: '10px',
    3: '12px',
    3.5: '14px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    11: '44px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
    36: '144px',
    40: '160px',
    44: '176px',
    48: '192px',
    56: '224px',
    64: '256px',
    72: '288px',
    80: '320px',
    96: '384px',
  },

  // Z-index
  zIndex: {
    auto: 'auto',
    base: '0',
    docked: '-10',
    sticky: '40',
    popup: '1000',
    modal: '2000',
    tooltip: '3000',
  },
};

export type DesignTokenValues = typeof designTokens;
export type ColorTokens = DesignTokenValues['colors'];
export type RadiusTokens = DesignTokenValues['radii'];
export type SpacingTokens = DesignTokenValues['spacing'];
export type ShadowTokens = DesignTokenValues['shadows'];
export type TypographyTokens = DesignTokenValues['typography'];
export type TransitionTokens = DesignTokenValues['transitions'];
export type ZIndexTokens = DesignTokenValues['zIndex'];
