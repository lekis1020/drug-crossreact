/**
 * Design Tokens for Drug Cross-Reactivity Project
 * "Clinical Precision" Theme
 */

export const COLORS = {
  // Brand / Theme
  brand: {
    antibiotic: {
      primary: '#3b82f6', // blue-500
      secondary: '#8b5cf6', // violet-500
      gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    },
    contrast: {
      primary: '#0ea5e9', // sky-500
      secondary: '#14b8a6', // teal-500
      gradient: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
    },
    oncology: {
      primary: '#ec4899', // fuchsia-500
      secondary: '#8b5cf6', // violet-500
      gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    },
  },

  // Backgrounds (Deep Navy / Slate)
  bg: {
    main: '#020617', // slate-950
    header: 'rgba(15, 23, 42, 0.85)', // slate-900 / glass
    card: 'rgba(30, 41, 59, 0.5)', // slate-800 / semi-transparent
    panel: 'rgba(15, 23, 42, 0.95)', // slate-950 / more opaque glass
    tooltip: 'rgba(2, 6, 23, 0.9)', // slate-950 / opaque
  },

  // Semantic Risks (Clinical Standard)
  risk: {
    high: {
      main: '#ef4444', // red-500
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
      text: '#fecaca', // red-200
      icon: '🔴',
    },
    disputed: {
      main: '#f59e0b', // amber-500
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.4)',
      text: '#fef3c7', // amber-100
      icon: '⚠️',
    },
    moderate: {
      main: '#f97316', // orange-500
      bg: 'rgba(249, 115, 22, 0.15)',
      border: 'rgba(249, 115, 22, 0.4)',
      text: '#fed7aa', // orange-200
      icon: '🟠',
    },
    low: {
      main: '#64748b', // slate-500
      bg: 'rgba(100, 116, 139, 0.15)',
      border: 'rgba(100, 116, 139, 0.35)',
      text: '#e2e8f0', // slate-200
      icon: '⚪',
    },
    safe: {
      main: '#10b981', // emerald-500
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)',
      text: '#d1fae5', // emerald-100
      icon: '🟢',
    }
  },

  // Borders & Accents
  border: {
    subtle: 'rgba(51, 65, 85, 0.4)', // slate-700 / transparent
    light: 'rgba(255, 255, 255, 0.1)',
  },

  // Text
  text: {
    primary: '#f8fafc', // slate-50
    secondary: '#e2e8f0', // slate-200
    muted: '#94a3b8', // slate-400
    dimmed: '#64748b', // slate-500
  }
};

export const EFFECTS = {
  glass: {
    blur: '16px',
    backdrop: 'blur(16px)',
  },
  shadow: {
    sm: '0 4px 16px rgba(0,0,0,0.2)',
    md: '0 8px 32px rgba(0,0,0,0.3)',
    lg: '0 12px 48px rgba(0,0,0,0.4)',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};
