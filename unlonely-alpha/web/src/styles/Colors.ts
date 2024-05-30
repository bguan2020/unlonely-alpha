export const COLORS = [
  "#FCF3CF", // Off White

  "#F1948A", // Light Pink
  "#f74475", // Hot Pink
  "#E74C3C", // Pale Red
  "#f43e39", // Blood Red

  "#FF5733", // Fruit Orange
  "#F39C12", // Golden Orange
  "#D35400", // Rich Orange

  "#F7DC6F", // Corn Silk Yellow
  "#FFC300", // Vibrant Yellow
  "#F5B041", // Banana Yellow

  "#9c9f71", // Desert Camo
  "#4c5432", // Olive Drab
  "#405432", // Verdant Green

  "#28B463", // Shamrock Green
  "#138D75", // Medium Sea Green
  "#2ECC71", // Emerald Green
  "#0ec238", // Neon Green

  "#5a9e94", // Arctic Cyan
  "#03b472", // Poison Cyan
  "#1ABC9C", // Strong Cyan
  "#16A085", // Dark Cyan

  "#AED6F1", // Light Sky Blue
  "#5DADE2", // Bright Sky Blue
  "#3498DB", // Dodger Blue
  "#0063d4", // Summer Blue

  "#dda4f5", // Light Purple
  "#9B59B6", // Medium Purple
  "#ae77d2", // Lavender Purple
];

function stringToNumber(str: string) {
  let seed = 0;
  for (let i = 0; i < str.length; i++) {
    seed += str.charCodeAt(i);
  }

  return Math.floor(seed++);
}

export const getColorFromString = (str: string) => {
  const number = stringToNumber(str);
  const index = Math.floor(number % COLORS.length);
  return COLORS[index];
};
