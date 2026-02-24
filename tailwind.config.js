/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'necto-red': '#e8111a',
        'cream-green': '#2ec72e',
        'ginger-orange': '#d44b00',
        'pineapple-gold': '#f5c800',
        'bg-dark': '#0a0a0a',
        'bg-card': '#111111',
        'text-primary': '#f5f5f5',
        'text-muted': '#999999',
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'Bebas Neue', 'sans-serif'],
        body: ['var(--font-nunito)', 'Nunito', 'sans-serif'],
        accent: ['var(--font-pacifico)', 'Pacifico', 'cursive'],
      },
      animation: {
        'pulse-slow': 'pulse 8s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'ring-expand': 'ringExpand 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        ringExpand: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { opacity: '0.5' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
