/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        secondary: '#1a1a2e',
        surface: '#16213e',
        card: '#0f3460',
        accent: '#e94560',
        text: '#EAEAEA',
        muted: '#9ca3af',
      },
    },
  },
  plugins: [],
};
