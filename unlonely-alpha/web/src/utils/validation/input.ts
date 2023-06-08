export const filteredInput = (input: string): string => {
  return input.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"); // no letters allowed
};

export const formatIncompleteNumber = (str: string) => {
  if (str.endsWith(".")) {
    return `${str}0`;
  }
  if (str.startsWith(".")) {
    return `0${str}`;
  }
  if (str === "") {
    return "0.0";
  }
  return str;
};
