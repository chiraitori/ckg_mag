import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        rotate: {
          '0%': { transform: 'rotate(0deg) translate(30px)' },
          '100%': { transform: 'rotate(360deg) translate(30px)' },
        },
      },
      animation: {
        rotate: 'rotate 1s ease infinite',
      },
    },
  },
  plugins: [],
};

export default config;
