import type { Config } from "tailwindcss";
import tailwindCSSAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "var(--white)",
        black: "var(--black)",
        primary: "var(--primary)",
        blue: "var(--blue)",
        "blue-hover": "var(--blue-hover)",
        orange: "var(--orange)",
        "orange-hover": "var(--orange-hover)",
        link: "var(--link)",
        grey: "var(--grey)",
        border: "var(--border)",
        "white-40": "var(--white-40)",
        "white-80": "var(--white-80)",
        green: "var(--green)",
        red: "var(--red)",
        "red-hover": "var(--red-hover)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindCSSAnimate],
} satisfies Config;
