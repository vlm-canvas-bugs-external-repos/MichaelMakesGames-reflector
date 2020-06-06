const palette = {
  black: "#111111",
  darkGray: "#333333",
  gray: "#666666",
  white: "#DDDDDD",
  red: "#f44336",
  blue: "#0D47A1",
  brown: "#cc6442",
  darkBrown: "#452e27",
  purple: "#7E57C2",
  darkPurple: "#512DA8",
  green: "#388E3C",
  yellow: "#FFD54F",
};

const colors = {
  primary: palette.red,
  secondary: palette.yellow,
  invalid: palette.red,
  payer: palette.white,
  inactiveBuilding: palette.gray,
  activeBuilding: palette.white,
  mineral: palette.brown,
  mountain: palette.darkBrown,
  enemyUnit: palette.purple,
  enemyBuilding: palette.darkPurple,
  water: palette.blue,
  laser: palette.red,
  power: palette.yellow,
  ground: palette.darkGray,
  food: palette.green,
};

module.exports = {
  theme: {
    colors: {
      ...colors,
      ...palette,
    },
    extend: {},
  },
  variants: [
    "responsive",
    "group-hover",
    "group-focus",
    "focus-within",
    "first",
    "last",
    "odd",
    "even",
    "hover",
    "focus",
    "active",
    "visited",
    "disabled",
  ],
  plugins: [],
};
