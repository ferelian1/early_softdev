import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "horror-bg": "#10150F",
        "horror-primary": "#8c9e82",
        "horror-secondary": "#4a633f",
        "horror-tertiary": "#3a4f32",
      },
      fontFamily: {
        oswald: ["Oswald", "sans-serif"],
        playfair: ["Playfair Display", "serif"],
      },
      cursor: {
        none: "none",
      },
    },
  },
  plugins: [],
};
export default config;
