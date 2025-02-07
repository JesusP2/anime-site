/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-astro"],
  singleQuote: true,
  tabWidth: 2,
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
