/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          950: '#0a1628',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'weather-clear': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'weather-clouds': 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        'weather-rain': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'weather-storm': 'linear-gradient(135deg, #2d3561 0%, #c05c7e 100%)',
        'weather-snow': 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
