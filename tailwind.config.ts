
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
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      boxShadow: {
        'soft': '0px 4px 16px rgba(0, 0, 0, 0.08)',
        'fab': '0px 6px 20px rgba(88, 86, 214, 0.3)',
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
        "scale-in-from-top-right": "scale-in-from-top-right 0.1s ease-out",
        "scale-out-to-top-right": "scale-out-to-top-right 0.1s ease-out",
        "scale-in-from-top-left": "scale-in-from-top-left 0.1s ease-out",
        "scale-out-to-top-left": "scale-out-to-top-left 0.1s ease-out",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
