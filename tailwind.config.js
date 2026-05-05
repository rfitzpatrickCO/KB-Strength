/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Mountain View Fire Rescue brand palette
        brand: {
          // Primary
          red:        '#CC1F1F',  // Fire Red — action & alert
          'red-hi':   '#E03A3A',  // hover (lighter)
          'red-lo':   '#A31818',  // pressed (darker)

          // Authority backgrounds
          black:      '#1A1A1A',  // Deep Black — page bg
          surface:    '#242424',  // card bg (one step lighter)
          input:      '#2F2F2F',  // input bg
          border:     '#3A3A3A',  // hairline borders

          // Secondary / accents
          blue:       '#1E4FA0',  // Mountain Blue — info / links
          'blue-hi':  '#3168BD',
          gold:       '#F5A800',  // Flame Gold — energy & success
          'gold-hi':  '#FFC033',
          'gold-lo':  '#C68800',

          // Neutrals
          gray:       '#6E7378',  // Steel Gray — secondary text
          smoke:      '#F4F4F2',  // Light Smoke — primary text on dark
        },
      },
    },
  },
  plugins: [],
}
