import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Core Brand */
        ink: "var(--ink)",
        charcoal: "var(--charcoal)",
        slate: "var(--slate)",
        stone: "var(--stone)",

        /* Warm Neutrals */
        canvas: "var(--canvas)",
        paper: "var(--paper)",
        linen: "var(--linen)",
        parchment: "var(--parchment)",

        /* Terracotta Accent */
        terracotta: {
          50: "var(--terracotta-50)",
          100: "var(--terracotta-100)",
          200: "var(--terracotta-200)",
          300: "var(--terracotta-300)",
          400: "var(--terracotta-400)",
          500: "var(--terracotta-500)",
          600: "var(--terracotta-600)",
          700: "var(--terracotta-700)",
          800: "var(--terracotta-800)",
          900: "var(--terracotta-900)",
        },

        /* Sage Accent */
        sage: {
          50: "var(--sage-50)",
          100: "var(--sage-100)",
          200: "var(--sage-200)",
          300: "var(--sage-300)",
          400: "var(--sage-400)",
          500: "var(--sage-500)",
          600: "var(--sage-600)",
          700: "var(--sage-700)",
          800: "var(--sage-800)",
          900: "var(--sage-900)",
        },

        /* Semantic */
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warning-soft)",
        },
        error: {
          DEFAULT: "var(--error)",
          soft: "var(--error-soft)",
        },
        info: {
          DEFAULT: "var(--info)",
          soft: "var(--info-soft)",
        },

        /* Chart */
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
          6: "var(--chart-6)",
          7: "var(--chart-7)",
          8: "var(--chart-8)",
        },
      },

      fontFamily: {
        display: ["var(--font-display)"],
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },

      fontSize: {
        "display-xl": [
          "3.5rem",
          { lineHeight: "1.1", fontWeight: "600", letterSpacing: "-0.02em" },
        ],
        "display-lg": [
          "2.5rem",
          { lineHeight: "1.15", fontWeight: "600", letterSpacing: "-0.02em" },
        ],
      },

      spacing: {
        "space-1": "var(--space-1)",
        "space-2": "var(--space-2)",
        "space-3": "var(--space-3)",
        "space-4": "var(--space-4)",
        "space-5": "var(--space-5)",
        "space-6": "var(--space-6)",
        "space-8": "var(--space-8)",
        "space-10": "var(--space-10)",
        "space-12": "var(--space-12)",
      },

      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "warm-sm": "var(--shadow-warm-sm)",
        "warm-md": "var(--shadow-warm-md)",
        "warm-lg": "var(--shadow-warm-lg)",
      },

      zIndex: {
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        popover: "var(--z-popover)",
        tooltip: "var(--z-tooltip)",
        notification: "var(--z-notification)",
        "command-palette": "var(--z-command-palette)",
      },

      borderRadius: {
        DEFAULT: "0.75rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },

      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
      },

      transitionTimingFunction: {
        "ease-out": "var(--ease-out)",
        "ease-in-out": "var(--ease-in-out)",
        spring: "var(--ease-spring)",
      },

      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "toast-enter": {
          "0%": { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },

      animation: {
        shimmer: "shimmer 1.5s infinite",
        "toast-enter": "toast-enter 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
