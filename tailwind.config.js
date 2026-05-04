/** @type {import('tailwindcss').Config} */
require("ts-node/register/transpile-only");

const { colors } = require("./constants/theme.ts");

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,ts}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // --- COLORS ---- dynamically pulled from /constants/theme.ts file
      colors: colors,

      // --- TYPOGRAPHY ---
      fontFamily: {
        nunito: ["Nunito-Regular"],
        "nunito-semibold": ["Nunito-SemiBold"],
        "nunito-bold": ["Nunito-Bold"],
      },
      fontSize: {
        heading: ["24px", { lineHeight: "28.8px" }], // 120%
        big: ["16px", { lineHeight: "19.2px" }], // 120%
        body: ["15px", { lineHeight: "21px" }], // 140%
        small: ["12px", { lineHeight: "14.4px" }], // 120%
        caption: ["12px", { lineHeight: "16.8px" }], // 140%
      },

      // --- SPACING ---
      spacing: {
        4.5: "18px", // Custom spacer from guide on figma
        13: "52px", // For large category icons
      },
    },
  },
  plugins: [],
};
