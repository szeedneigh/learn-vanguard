/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* Spacing System - 8px base grid */
      spacing: {
        '0': 'var(--spacing-0)',
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
        '10': 'var(--spacing-10)',
        '12': 'var(--spacing-12)',
        '14': 'var(--spacing-14)',
        '16': 'var(--spacing-16)',
        '20': 'var(--spacing-20)',
        '24': 'var(--spacing-24)',
        '32': 'var(--spacing-32)',
        '40': 'var(--spacing-40)',
        '48': 'var(--spacing-48)',
        '56': 'var(--spacing-56)',
        '64': 'var(--spacing-64)',
      },

      /* Border Radius */
      borderRadius: {
        'none': '0',
        'sm': 'var(--radius-sm)',
        'DEFAULT': 'var(--radius)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        'full': 'var(--radius-full)',
      },

      /* Typography System */
      fontSize: {
        'display': ['var(--font-size-display)', { lineHeight: 'var(--line-height-display)', letterSpacing: 'var(--letter-spacing-display)' }],
        'h1': ['var(--font-size-h1)', { lineHeight: 'var(--line-height-h1)', letterSpacing: 'var(--letter-spacing-h1)' }],
        'h2': ['var(--font-size-h2)', { lineHeight: 'var(--line-height-h2)', letterSpacing: 'var(--letter-spacing-h2)' }],
        'h3': ['var(--font-size-h3)', { lineHeight: 'var(--line-height-h3)', letterSpacing: 'var(--letter-spacing-h3)' }],
        'h4': ['var(--font-size-h4)', { lineHeight: 'var(--line-height-h4)', letterSpacing: 'var(--letter-spacing-h4)' }],
        'h5': ['var(--font-size-h5)', { lineHeight: 'var(--line-height-h5)', letterSpacing: 'var(--letter-spacing-h5)' }],
        'h6': ['var(--font-size-h6)', { lineHeight: 'var(--line-height-h6)', letterSpacing: 'var(--letter-spacing-h6)' }],
        'body-lg': ['var(--font-size-body-lg)', { lineHeight: 'var(--line-height-body-lg)' }],
        'body': ['var(--font-size-body)', { lineHeight: 'var(--line-height-body)' }],
        'body-sm': ['var(--font-size-body-sm)', { lineHeight: 'var(--line-height-body-sm)' }],
        'caption': ['var(--font-size-caption)', { lineHeight: 'var(--line-height-caption)', letterSpacing: 'var(--letter-spacing-caption)' }],
        'overline': ['var(--font-size-overline)', { lineHeight: 'var(--line-height-overline)', letterSpacing: 'var(--letter-spacing-overline)' }],
      },

      /* Font Weights */
      fontWeight: {
        'regular': 'var(--font-weight-regular)',
        'medium': 'var(--font-weight-medium)',
        'semibold': 'var(--font-weight-semibold)',
        'bold': 'var(--font-weight-bold)',
      },

      /* Color System */
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          active: 'hsl(var(--primary-active))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          hover: 'hsl(var(--secondary-hover))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },

        /* Semantic Colors */
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          light: 'hsl(var(--success-light))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          light: 'hsl(var(--warning-light))',
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          foreground: 'hsl(var(--error-foreground))',
          light: 'hsl(var(--error-light))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
          light: 'hsl(var(--info-light))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },

        /* Educational Theme Colors */
        learning: 'hsl(var(--learning))',
        achievement: 'hsl(var(--achievement))',
        resource: 'hsl(var(--resource))',
        task: 'hsl(var(--task))',
        event: 'hsl(var(--event))',
        deadline: 'hsl(var(--deadline))',

        /* Borders & Inputs */
        border: {
          DEFAULT: 'hsl(var(--border))',
          strong: 'hsl(var(--border-strong))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        /* Chart Colors */
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
          '6': 'hsl(var(--chart-6))',
        }
      },

      /* Shadow System */
      boxShadow: {
        'none': 'var(--shadow-none)',
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow-md)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'inner': 'var(--shadow-inner)',
        'focus': 'var(--shadow-focus)',
        'glow-primary': 'var(--shadow-glow-primary)',
        'glow-success': 'var(--shadow-glow-success)',
        'glow-error': 'var(--shadow-glow-error)',
        'primary': 'var(--shadow-primary)',
        'success': 'var(--shadow-success)',
        'error': 'var(--shadow-error)',
      },

      /* Font Family */
      fontFamily: {
        sans: ['var(--font-primary)'],
        mono: ['var(--font-mono)'],
      },

      /* Min Height for Touch Targets */
      minHeight: {
        'touch': 'var(--touch-target-min)',
        'touch-comfortable': 'var(--touch-target-comfortable)',
      },

      /* Min Width for Touch Targets */
      minWidth: {
        'touch': 'var(--touch-target-min)',
        'touch-comfortable': 'var(--touch-target-comfortable)',
      },
    }
  },
  plugins: [tailwindcssAnimate],
};
