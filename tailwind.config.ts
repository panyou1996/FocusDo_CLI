
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        soft: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        medium: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        strong: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        fab: '0 8px 25px -5px rgb(0 0 0 / 0.3)',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "scale-in-from-top-right": {
          from: { opacity: "0", transform: "scale(0.95) translateY(-6px)", transformOrigin: "top right" },
          to: { opacity: "1", transform: "scale(1) translateY(0)", transformOrigin: "top right" },
        },
        "scale-out-to-top-right": {
            from: { opacity: "1", transform: "scale(1) translateY(0)", transformOrigin: "top right" },
            to: { opacity: "0", transform: "scale(0.95) translateY(-6px)", transformOrigin: "top right" },
        },
        "scale-in-from-bottom-right": {
            from: { opacity: "0", transform: "scale(0.95) translateY(6px)", transformOrigin: "bottom right" },
            to: { opacity: "1", transform: "scale(1) translateY(0)", transformOrigin: "bottom right" },
        },
        "scale-out-to-bottom-right": {
            from: { opacity: "1", transform: "scale(1) translateY(0)", transformOrigin: "bottom right" },
            to: { opacity: "0", transform: "scale(0.95) translateY(6px)", transformOrigin: "bottom right" },
        },
        "scale-in-from-top-left": {
            from: { opacity: "0", transform: "scale(0.95) translateY(-6px)", transformOrigin: "top left" },
            to: { opacity: "1", transform: "scale(1) translateY(0)", transformOrigin: "top left" },
        },
        "scale-out-to-top-left": {
            from: { opacity: "1", transform: "scale(1) translateY(0)", transformOrigin: "top left" },
            to: { opacity: "0", transform: "scale(0.95) translateY(-6px)", transformOrigin: "top left" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scale-in-from-top-right": "scale-in-from-top-right 0.2s ease-out",
        "scale-out-to-top-right": "scale-out-to-top-right 0.2s ease-out",
        "scale-in-from-bottom-right": "scale-in-from-bottom-right 0.2s ease-out",
        "scale-out-to-bottom-right": "scale-out-to-bottom-right 0.2s ease-out",
        "scale-in-from-top-left": "scale-in-from-top-left 0.2s ease-out",
        "scale-out-to-top-left": "scale-out-to-top-left 0.2s ease-out",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
