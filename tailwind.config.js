/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mars: {
          50: '#fef3f0',
          100: '#fde3db',
          200: '#fcc7b7',
          300: '#f9a088',
          400: '#f47050',
          500: '#ec4c2e',
          600: '#d43520',
          700: '#b02718',
          800: '#8f2318',
          900: '#772219',
          950: '#410e09',
        },
        space: {
          50: '#f0f2f7',
          100: '#dde1ec',
          200: '#c1c9dc',
          300: '#97a3c5',
          400: '#7180ae',
          500: '#546197',
          600: '#474f80',
          700: '#3d4268',
          800: '#363a58',
          900: '#1a1d2e',
          950: '#0d0f18',
        },
        nasa: {
          blue: '#0b3d91',
          red: '#fc3d21',
          white: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(244, 112, 80, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(244, 112, 80, 0.6)' },
        },
      },
      backgroundImage: {
        'mars-gradient': 'linear-gradient(135deg, #410e09 0%, #1a1d2e 50%, #0d0f18 100%)',
        'panel-gradient': 'linear-gradient(180deg, rgba(26,29,46,0.95) 0%, rgba(13,15,24,0.98) 100%)',
      }
    },
  },
  plugins: [],
};
