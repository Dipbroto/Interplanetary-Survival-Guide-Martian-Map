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
          50: '#fef3ee',
          100: '#fde4d8',
          200: '#fac5ad',
          300: '#f79b78',
          400: '#E27B58',
          500: '#FF4C29',
          600: '#d43520',
          700: '#b02718',
          800: '#8f2318',
          900: '#772219',
          950: '#380d08',
        },
        space: {
          50: '#e8eaf0',
          100: '#cdd1de',
          200: '#9ea5be',
          300: '#6e789e',
          400: '#4a5478',
          500: '#353e5e',
          600: '#272f4a',
          700: '#1c2238',
          800: '#141a2d',
          850: '#0f1420',
          900: '#0B0C10',
          950: '#060810',
        },
        cyber: {
          cyan: '#00FFCC',
          blue: '#38bdf8',
          amber: '#F5A623',
          green: '#10b981',
          red: '#f43f5e',
          teal: '#2dd4bf',
        },
        nasa: {
          blue: '#0b3d91',
          red: '#fc3d21',
          white: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'Fira Code', 'monospace'],
        display: ['Rajdhani', 'Orbitron', 'sans-serif'],
        orbitron: ['Orbitron', 'Rajdhani', 'sans-serif'],
        rajdhani: ['Rajdhani', 'Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon-mars': '0 0 20px rgba(255, 76, 41, 0.5), 0 0 40px rgba(255, 76, 41, 0.2), inset 0 0 12px rgba(255, 76, 41, 0.1)',
        'neon-cyan': '0 0 20px rgba(0, 255, 204, 0.45), 0 0 40px rgba(0, 255, 204, 0.15), inset 0 0 12px rgba(0, 255, 204, 0.1)',
        'neon-amber': '0 0 20px rgba(245, 166, 35, 0.45), 0 0 40px rgba(245, 166, 35, 0.15), inset 0 0 12px rgba(245, 166, 35, 0.1)',
        'hud-glass': '0 8px 32px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.4)',
        'bento': '0 1px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        'bento-hover': '0 4px 20px rgba(0,0,0,0.6), 0 0 15px rgba(0, 255, 204, 0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
        'card-glow': '0 0 30px rgba(226, 123, 88, 0.15), 0 0 60px rgba(226, 123, 88, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'glow': 'glow 2.5s ease-in-out infinite alternate',
        'scanline': 'scanline 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 76, 41, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(255, 76, 41, 0.6), 0 0 50px rgba(255, 76, 41, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'mars-gradient': 'linear-gradient(135deg, #380d08 0%, #0f1420 50%, #0B0C10 100%)',
        'panel-gradient': 'linear-gradient(180deg, rgba(15,20,32,0.96) 0%, rgba(11,12,16,0.99) 100%)',
        'hud-gradient': 'radial-gradient(ellipse at top, rgba(226, 123, 88, 0.08) 0%, rgba(11, 12, 16, 0.98) 60%)',
        'bento-gradient': 'linear-gradient(145deg, rgba(20,26,45,0.9) 0%, rgba(11,12,16,0.95) 100%)',
        'cyber-gradient': 'linear-gradient(135deg, rgba(0,255,204,0.05) 0%, transparent 50%, rgba(255,76,41,0.05) 100%)',
      },
      borderRadius: {
        'bento': '16px',
      }
    },
  },
  plugins: [],
};
