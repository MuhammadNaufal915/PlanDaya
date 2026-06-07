/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50:  '#F4F8F1',
          100: '#E5EFE0',
          200: '#C8DDBE',
          300: '#A3C494',
          400: '#7FAD72',
          500: '#5A9050',
          600: '#4A7C42',
          700: '#3A6333',
          800: '#2C4E27',
          900: '#1E3A1A',
        },
        forest: {
          50:  '#F2F7F2',
          100: '#DCF0DC',
          200: '#B5DEB5',
          300: '#82C382',
          400: '#55A855',
          500: '#3A8E3A',
          600: '#2D732D',
          700: '#245824',
          800: '#1C431C',
          900: '#143014',
        },
        neutral: {
          50:  '#F8FAF7',
          100: '#EEF3EB',
          200: '#DDE7D9',
          300: '#C2D1BC',
          400: '#9BB293',
          500: '#6F8D67',
          600: '#556B4E',
          700: '#435440',
          800: '#334030',
          900: '#252F23',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      backgroundImage: {
        'hero-gradient':  'linear-gradient(135deg, #F4F8F1 0%, #E5EFE0 50%, #F5F8F2 100%)',
        'sage-gradient':  'linear-gradient(135deg, #4A7C42 0%, #3A6333 100%)',
        'card-gradient':  'linear-gradient(145deg, #FFFFFF 0%, #F8FAF6 100%)',
        'sage-glow':      'radial-gradient(circle at 50% 50%, rgba(90, 144, 80, 0.08) 0%, transparent 70%)',
      },
      boxShadow: {
        'card':     '0 1px 3px rgba(40, 80, 35, 0.08), 0 1px 2px rgba(40, 80, 35, 0.04)',
        'card-md':  '0 4px 12px rgba(40, 80, 35, 0.10), 0 2px 6px rgba(40, 80, 35, 0.06)',
        'card-lg':  '0 8px 24px rgba(40, 80, 35, 0.12), 0 4px 10px rgba(40, 80, 35, 0.08)',
        'card-xl':  '0 16px 40px rgba(40, 80, 35, 0.14), 0 8px 16px rgba(40, 80, 35, 0.10)',
        'glow-sage':'0 0 20px rgba(90, 144, 80, 0.25)',
        'inner-sm': 'inset 0 1px 3px rgba(40, 80, 35, 0.06)',
        'btn':      '0 2px 8px rgba(74, 124, 66, 0.30)',
        'btn-hover':'0 4px 16px rgba(74, 124, 66, 0.40)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideInLeft 0.4s ease-out',
        'scale-in':   'scaleIn 0.3s ease-out',
        'float':      'float 5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
