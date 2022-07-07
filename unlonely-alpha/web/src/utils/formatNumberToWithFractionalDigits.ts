/**
 * Formats a number to match the standardized string format for tokens
 *
 * This function should be used whenever we want to display a JS number in the standardized format.
 * Usually used to display token amounts ie '0.24908 MATIC' but can be applied in other locations.
 */
export const formatNumberToWithFractionalDigits = (
  number: number,
  format = { maximumFractionDigits: 6 }
): string => {
  return Number(number).toLocaleString("en-US", format); // ->  Result "1,234.571234" Note this does round up.
};

export default formatNumberToWithFractionalDigits;
