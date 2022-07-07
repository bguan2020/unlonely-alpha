// truncate the text to the given length, replacing the middle portion with ...
export default function centerEllipses(
  text: string | undefined | null,
  maxLength: number
): string {
  if (!text || text.length <= maxLength) {
    return text || "";
  }
  if (maxLength < 5) {
    return text.slice(0, maxLength);
  }
  const realCharCount = maxLength - 3;
  const beginCharCount = Math.ceil(realCharCount / 2);
  const endCharCount = realCharCount - beginCharCount;
  const prefix = text.slice(0, beginCharCount);
  const suffix = text.slice(text.length - endCharCount, text.length);
  return `${prefix}...${suffix}`;
}
