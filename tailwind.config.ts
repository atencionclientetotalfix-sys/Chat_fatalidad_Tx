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
        base: {
          DEFAULT: '#12080A',
          light: '#1a0f12',
          dark: '#0a0506',
        },
        primary: {
          DEFAULT: '#FF857B',
          hover: '#ff6b5e',
          light: '#ffa8a0',
        },
        secondary: {
          DEFAULT: '#E97D46',
          hover: '#e0652e',
          light: '#f19a6b',
        },
        accent: {
          DEFAULT: '#CE65A3',
          hover: '#c04d8f',
          light: '#dd7db3',
        },
        background: {
          DEFAULT: '#12080A',
          secondary: '#1a0f12',
          tertiary: '#261a1c',
        },
        foreground: {
          DEFAULT: '#fafafa',
          secondary: '#a3a3a3',
          muted: '#737373',
        },
        border: {
          DEFAULT: '#2a1f21',
          light: '#3a2f31',
        },
      },
    },
  },
  plugins: [],
}
export default config


