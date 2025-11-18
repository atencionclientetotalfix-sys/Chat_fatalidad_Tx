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
        // Tema Claro (Light Mode) - Valores por defecto
        base: {
          DEFAULT: '#ffffff', // Blanco para tema claro
          light: '#f5f5f5',
          dark: '#e0e0e0',
        },
        primary: {
          DEFAULT: '#FF6B6B', // Coral/rojo-rosado vibrante
          hover: '#ff5252',
          light: '#ff8787',
          dark: '#FF6B6B', // Mismo color para tema oscuro
          'dark-hover': '#ff5252',
        },
        secondary: {
          DEFAULT: '#4ECDC4', // Teal/turquesa brillante
          hover: '#3db5ad',
          light: '#6dd5ce',
          dark: '#4ECDC4', // Mismo color para tema oscuro
          'dark-hover': '#3db5ad',
        },
        accent: {
          DEFAULT: '#4ECDC4', // Teal como accent también
          hover: '#3db5ad',
          light: '#6dd5ce',
        },
        background: {
          DEFAULT: '#ffffff', // Blanco para tema claro
          secondary: '#f5f5f5',
          tertiary: '#e0e0e0',
        },
        foreground: {
          DEFAULT: '#1a1a1a', // Texto oscuro
          secondary: '#4a4a4a',
          muted: '#737373',
        },
        border: {
          DEFAULT: '#e0e0e0',
          light: '#f0f0f0',
        },
      },
    },
  },
  plugins: [
    function ({ addBase }: any) {
      addBase({
        ':root': {
          '--color-base': '#ffffff',
          '--color-base-light': '#f5f5f5',
          '--color-base-dark': '#e0e0e0',
          '--color-primary': '#FF6B6B',
          '--color-primary-hover': '#ff5252',
          '--color-secondary': '#4ECDC4',
          '--color-secondary-hover': '#3db5ad',
          '--color-accent': '#4ECDC4',
          '--color-background': '#ffffff',
          '--color-background-secondary': '#f5f5f5',
          '--color-background-tertiary': '#e0e0e0',
          '--color-foreground': '#1a1a1a',
          '--color-foreground-secondary': '#4a4a4a',
          '--color-foreground-muted': '#737373',
          '--color-border': '#e0e0e0',
        },
        '.dark': {
          '--color-base': '#0F0F0F',
          '--color-base-light': '#1A1A1A',
          '--color-base-dark': '#0A0A0A',
          '--color-primary': '#FF6B6B',
          '--color-primary-hover': '#FF5252',
          '--color-secondary': '#4ECDC4',
          '--color-secondary-hover': '#3DB5AD',
          '--color-accent': '#4ECDC4',
          '--color-background': '#0F0F0F',
          '--color-background-secondary': '#1A1A1A',
          '--color-background-tertiary': '#252525',
          '--color-foreground': '#F5F5F5',
          '--color-foreground-secondary': '#D0D0D0',
          '--color-foreground-muted': '#A0A0A0',
          '--color-border': '#2A2A2A',
        },
      })
    },
  ],
}
export default config


