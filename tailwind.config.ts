// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
    theme: {
        extend: {
            colors: {
                primary: { DEFAULT: "#110A05" },
                secondary: { DEFAULT: "#070A10" },
                accent: { DEFAULT: "#D4A574" },
                secondaryAccent: { DEFAULT: "#D5812A" },

            },
            fontFamily: {
                // The keys here become your utility classes (e.g., font-montserrat)
                sans: ["var(--font-geist-sans)"], // Overrides default font-sans
                mono: ["var(--font-geist-mono)"], // Overrides default font-mono
                montserrat: ["var(--font-montserrat)"], // usable as font-montserrat
                inter: ["var(--font-inter)"],           // usable as font-inter
            },
        },
    },
    content: [
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
} satisfies Config;

