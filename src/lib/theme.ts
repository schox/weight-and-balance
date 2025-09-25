// Unified color scheme for the application
// Using a modern, accessible color palette

export const theme = {
  // Brand colors
  primary: {
    DEFAULT: '#1e40af', // Blue 800
    foreground: '#ffffff',
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

  // Semantic colors for different sections
  sections: {
    pilot: {
      DEFAULT: '#2563eb', // Blue 600
      foreground: '#ffffff',
      muted: '#dbeafe',    // Blue 100
    },
    passengers: {
      DEFAULT: '#7c3aed', // Violet 600
      foreground: '#ffffff',
      muted: '#ede9fe',    // Violet 100
    },
    baggage: {
      DEFAULT: '#ea580c', // Orange 600
      foreground: '#ffffff',
      muted: '#fed7aa',    // Orange 200
    },
    fuel: {
      DEFAULT: '#16a34a', // Green 600
      foreground: '#ffffff',
      muted: '#bbf7d0',    // Green 200
    },
  },

  // Status colors
  status: {
    safe: '#16a34a',    // Green 600
    warning: '#eab308', // Yellow 600
    danger: '#dc2626',  // Red 600
    info: '#0891b2',    // Cyan 600
  },

  // Neutral colors
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Tab-specific design tokens
  tabs: {
    borderWidth: '2px',
    borderRadius: {
      top: '0.5rem',    // rounded-lg equivalent
      bottom: '0.5rem',
    },
    transition: 'all 0.2s ease',
    gap: '0', // No gap between tabs
  }
} as const;

export type Theme = typeof theme;