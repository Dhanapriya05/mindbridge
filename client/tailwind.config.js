/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: '#131B2E',
        'surface-light': '#1E293B',
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Serene Teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a'
        },
        calm: {
          cyan: '#38BDF8',
          emerald: '#34D399',
          indigo: '#818CF8',
          rose: '#FB7185',
          amber: '#FBBF24'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(20, 184, 166, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(56, 189, 248, 0.4)' }
        }
      }
    }
  },
  plugins: []
};
