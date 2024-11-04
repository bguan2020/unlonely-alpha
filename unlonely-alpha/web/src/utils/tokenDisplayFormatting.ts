export const truncateValue = (
  value: number | string,
  decimals = 6,
  abbrev = true,
  abbrevMaxDecimals = 2,
  softTruncate = true
): string => {
  if (typeof value === "number" && value === 0) return "0";
  if (typeof value === "string") {
    const pureNumberStr = value.replace(".", "").split("e")[0];
    if (BigInt(pureNumberStr) === BigInt(0)) return "0";
  }
  let str = value.toString();

  // if string is in scientific notation, for example (1.2345e3, or 1.2345e-5)
  str = convertSciNotaToPrecise(str);
  const decimalIndex = str.indexOf(".");

  // if is nonzero whole number
  if (decimalIndex === -1) {
    if (abbrev) return numberAbbreviate(str, abbrevMaxDecimals);
    return str;
  }

  // if is nonzero number with decimals
  const cutoffIndex = decimalIndex + decimals;
  const truncatedStr = str.substring(0, cutoffIndex + 1);
  if (parseFloat(truncatedStr) === 0 && softTruncate)
    return "< ".concat(`${truncatedStr.slice(0, -1)}1`);
  if (abbrev) return numberAbbreviate(truncatedStr, abbrevMaxDecimals);
  return truncatedStr;
};

// converts scientific notation like 1.2345e3 or 1.2345e-5 to precise number like 1234.5 or 0.000012345
export const convertSciNotaToPrecise = (str: string): string => {
  // if string is in scientific notation, for example (1.2345e3, or 1.2345e-5), (2)
  if (str?.includes("e")) {
    // get number left of 'e'
    const n = str.split("e")[0];

    // get number right of 'e'
    const exponent = str.split("e")[1];

    // remove decimal in advance
    const temp = n.replace(".", "");
    let zeros = "";
    if (exponent && exponent.includes("-")) {
      // if exponent has negative sign, it must be negative
      const range = rangeFrom0(parseInt(exponent.slice(1)) - 1);
      range.forEach(() => (zeros += "0"));
      str = "0.".concat(zeros).concat(temp); // add abs(exponent) - 1 zeros to the left of temp
    } else {
      // if exponent does not have negative sign, it must be positive

      let lengthOfDecimalPlaces = 0;

      if (n?.includes(".")) {
        // if number contains decimals, this is important
        lengthOfDecimalPlaces = n.split(".")[1].length;
      }

      if (lengthOfDecimalPlaces > parseInt(exponent)) {
        // if length of decimal places in string surpasses exponent, must insert decimal point inside
        const decimalIndex = n.indexOf(".");
        const newDecimalIndex = decimalIndex + parseInt(exponent);
        str = temp
          .substring(0, newDecimalIndex)
          .concat(".")
          .concat(temp.substring(newDecimalIndex, temp.length));
      } else {
        // if length of decimal places in string does not surpass exponent, simply append zeros
        const range = rangeFrom0(parseInt(exponent) - lengthOfDecimalPlaces);
        range.forEach(() => (zeros += "0"));
        str = temp.concat(zeros);
      }
    }
  }
  return str;
};

const numberAbbreviate = (value: number | string, maxDecimals = 2): string => {
  if (typeof value === "number" && value === 0) return "0";
  if (typeof value === "string" && BigInt(value.replace(".", "")) === BigInt(0))
    return "0";
  const str = value.toString();
  const decimalIndex = str.indexOf(".");
  let wholeNumber = str;
  if (decimalIndex !== -1) {
    wholeNumber = str.substring(0, decimalIndex);
  }
  if (wholeNumber.length <= 3) return str;

  const abbreviations: { [key: number]: string } = {
    [2]: "K",
    [3]: "M",
    [4]: "B",
    [5]: "T",
  };
  const abbrev = abbreviations[Math.ceil(wholeNumber.length / 3)];
  const cutoff = wholeNumber.length % 3 === 0 ? 3 : wholeNumber.length % 3;
  const a = wholeNumber.substring(0, cutoff);
  const b = wholeNumber.substring(cutoff, cutoff + maxDecimals);
  if (maxDecimals === 0) {
    return `${a}${abbrev}`;
  }
  if (!abbrev) {
    if (Number(b) === 0) return `${a}e${wholeNumber.length - cutoff}`;
    return `${a}.${b}e${wholeNumber.length - cutoff}`;
  }
  if (Number(b) === 0) return `${a}${abbrev}`;
  return `${a}.${b}${abbrev}`;
};

const rangeFrom0 = (stop: number): number[] => {
  const arr = [];
  for (let i = 0; i < stop; ++i) {
    arr.push(i);
  }
  return arr;
};

export const addCommasToNumber = (value: number | string): string => {
  const [integerPart, fractionalPart] = value.toString().split(".");
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );
  return fractionalPart
    ? `${formattedIntegerPart}.${fractionalPart}`
    : formattedIntegerPart;
};
