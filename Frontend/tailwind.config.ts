import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        sand: {
          50: '#FBF8F3',
          100: '#F5EFE0',
          200: '#EBD9B8',
          300: '#DBBE8A',
          400: '#C9A05A',
          500: '#B5832E',
          600: '#946519',
          700: '#6E4A10',
          800: '#4A300A',
          900: '#271805',
        },
        forest: {
          50: '#F2F7F2',
          100: '#DAF0DA',
          200: '#AEDCAE',
          300: '#7DC27D',
          400: '#52A352',
          500: '#368236',
          600: '#246024',
          700: '#1A461A',
          800: '#112E11',
          900: '#091709',
        },
        ember: {
          50: '#FFF5F0',
          100: '#FFE0CF',
          200: '#FFC09E',
          300: '#FF9866',
          400: '#F5723A',
          500: '#E05520',
          600: '#B83E10',
          700: '#8A2C0A',
          800: '#5C1C05',
          900: '#2E0D02',
        },
        charcoal: {
          50: '#F5F5F4',
          100: '#E8E6E3',
          200: '#D0CCC7',
          300: '#B0AAA2',
          400: '#8C847A',
          500: '#6B6259',
          600: '#524940',
          700: '#3C342C',
          800: '#282119',
          900: '#150F08',
        },
        cream: '#FDFAF5',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      boxShadow: {
        warm: '0 4px 24px rgba(180, 110, 30, 0.10)',
        'warm-lg': '0 8px 40px rgba(180, 110, 30, 0.15)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'count-up': 'count-up 0.5s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
