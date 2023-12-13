const breakpoints = {
  // Ref: https://www.freecodecamp.org/news/the-100-correct-way-to-do-css-breakpoints-88d6a5ba1862/
  sm: "600px", // Max phone
  md: "900px", // Max Tablet Portrait
  lg: "1200px", // Max Tablet landscape
  xl: "1800px", // Max Desktop

  // Avoid using 2xl!
  // Have to include because of Chakra:
  //  - https://chakra-ui.com/docs/features/responsive-styles#customizing-breakpoints
  "2xl": "9999px",
};

export default breakpoints;
