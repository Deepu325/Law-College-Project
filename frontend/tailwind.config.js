/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#4B2E83',
        'brand-gold': '#F4B400',
        'bg-exam': '#F9F9FB',
        'text-dark': '#1C1C1C',
        'text-body': '#4A4A4A',
        'error-red': '#D32F2F',
        'success-green': '#2E7D32',
      },
      fontFamily: {
        'heading': ['"Playfair Display"', 'serif'],
        'body': ['Inter', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

