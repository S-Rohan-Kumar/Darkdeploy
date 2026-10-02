/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0d111a',
          850: '#111622',
          800: '#151b29',
          750: '#1b2234',
          700: '#232b40',
          600: '#323d57',
          500: '#64748b',
          400: '#94a3b8',
          100: '#f1f5f9',
        },
        brand: {
          500: '#4062f6',
          600: '#3451db',
        },
      },
    },
  },
  plugins: [],
}
