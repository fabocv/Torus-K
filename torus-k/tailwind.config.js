/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Fira Code"', 'monospace', 'Courier New'],
      },
      colors: {
        torus: {
          bg: '#0D0D12',
          panel: '#1A1A24',
          accent: '#00FF9D', // Cyan/Verde IA
          text: '#A1A1AA',
          critical: '#FF3366'
        }
      }
    },
  },
  plugins: [],
}
