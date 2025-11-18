import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tema Claro (Light Mode) - Valores por defecto usando variables CSS
        base: {
          DEFAULT: 'var(--bg-base)',
          light: 'var(--bg-secondary)',
          dark: 'var(--bg-tertiary)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: '#ff8787',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          hover: 'var(--color-secondary-hover)',
          light: '#6dd5ce',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-secondary-hover)',
          light: '#6dd5ce',
        },
        background: {
          DEFAULT: 'var(--bg-base)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
        },
        foreground: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
          light: 'var(--border-light)',
        },
      },
    },
  },
  plugins: [],
}
export default config


