/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#14161C",
        surface: "#1E212B",
        surfaceRaised: "#262A37",
        line: "#33384A",
        ink: "#EDEEF2",
        inkMuted: "#8B90A0",
        planner: "#6EA8FE",
        coder: "#F2B84B",
        reviewer: "#6FCF97",
      },
      fontFamily: {
        display: ["var(--font-newsreader)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
