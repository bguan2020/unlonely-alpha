export const filteredInput = (
  input: string,
  allowDecimals?: boolean
): string => {
  if (allowDecimals)
    return input.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
  return input.replace(/[^0-9]/g, ""); // no decimals, letters, or other symbols allowed except for digits
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
