const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ['./src/webview/index.html', './src/**/*.vue'],
  content: [
    './src/**/*.vue',
    // './src/webview/App.vue',
    // './src/webview/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter var"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/aspect-ratio"),
  ],
}
