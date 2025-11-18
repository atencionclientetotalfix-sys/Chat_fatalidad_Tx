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
          DEFAULT: '#f1f8f4', // Verde claro de fondo
          light: '#e8f5e9',
          dark: '#d4e8d9',
        },
        primary: {
          DEFAULT: '#2d5a4a', // Verde teal oscuro (título y botón primario) - Light
          hover: '#1a5d4a',
          light: '#3d6a5a',
          dark: '#70c0d8', // Azul claro para tema oscuro
          'dark-hover': '#60b0c8',
        },
        secondary: {
          DEFAULT: '#4a5d3a', // Verde oliva oscuro (subtítulo y botón secundario) - Light
          hover: '#3a4d2a',
          light: '#5a6d4a',
          dark: '#60b080', // Verde para tema oscuro
          'dark-hover': '#50a070',
        },
        accent: {
          DEFAULT: '#60b080', // Verde vibrante
          hover: '#50a070',
          light: '#70c090',
        },
        background: {
          DEFAULT: '#f1f8f4', // Verde claro
          secondary: '#e8f5e9',
          tertiary: '#d4e8d9',
        },
        foreground: {
          DEFAULT: '#1a1a1a', // Texto oscuro
          secondary: '#4a4a4a',
          muted: '#737373',
        },
        border: {
          DEFAULT: '#c4d4c9',
          light: '#d4e4d9',
        },
      },
    },
  },
  plugins: [
    function ({ addBase }: any) {
      addBase({
        ':root': {
          '--color-base': '#f1f8f4',
          '--color-base-light': '#e8f5e9',
          '--color-base-dark': '#d4e8d9',
          '--color-primary': '#2d5a4a',
          '--color-primary-hover': '#1a5d4a',
          '--color-secondary': '#4a5d3a',
          '--color-secondary-hover': '#3a4d2a',
          '--color-accent': '#60b080',
          '--color-background': '#f1f8f4',
          '--color-background-secondary': '#e8f5e9',
          '--color-background-tertiary': '#d4e8d9',
          '--color-foreground': '#1a1a1a',
          '--color-foreground-secondary': '#4a4a4a',
          '--color-foreground-muted': '#737373',
          '--color-border': '#c4d4c9',
        },
        '.dark': {
          '--color-base': '#0d1b1e',
          '--color-base-light': '#152428',
          '--color-base-dark': '#1d2e32',
          '--color-primary': '#70c0d8',
          '--color-primary-hover': '#60b0c8',
          '--color-secondary': '#60b080',
          '--color-secondary-hover': '#50a070',
          '--color-accent': '#60b080',
          '--color-background': '#0d1b1e',
          '--color-background-secondary': '#152428',
          '--color-background-tertiary': '#1d2e32',
          '--color-foreground': '#c0c0c0',
          '--color-foreground-secondary': '#a0a0a0',
          '--color-foreground-muted': '#808080',
          '--color-border': '#2a3a3d',
        },
      })
    },
  ],
}
export default config


