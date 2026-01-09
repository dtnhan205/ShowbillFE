/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#1A1A1A',
        darkCard: '#2D2D2D',
        neonPurple: '#8A2BE2',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        neonGlow: '0 0 10px #8A2BE2, 0 0 15px #8A2BE2, 0 0 20px #8A2BE2',
      },
      animation: {
        pulseNeon: 'pulseNeon 2s infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 5px #8A2BE2, 0 0 10px #8A2BE2' },
          '50%': { boxShadow: '0 0 15px #8A2BE2, 0 0 30px #8A2BE2, 0 0 45px #8A2BE2' },
        },
      },
    },
  },
  plugins: [],
}