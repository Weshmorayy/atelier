import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Palette issue du plan design client ───────────────────────
      // Toutes les couleurs viennent de variables CSS dans globals.css
      // Ne JAMAIS mettre de couleurs hexadécimales ici directement
      colors: {
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          accent: 'var(--color-bg-accent)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          body: 'var(--color-text-body)',
          muted: 'var(--color-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
        },
      },

      // ─── Typographie ───────────────────────────────────────────────
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },

      // ─── Espacements personnalisés ─────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // ─── Transitions ───────────────────────────────────────────────
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
}

export default config
