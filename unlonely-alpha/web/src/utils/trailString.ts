export default function trailString(
  text: string | undefined | null,
  maxLength = 10
): string {
  if (!text || text.length <= maxLength) {
    return text || "";
  }
  return `${text.slice(0, maxLength)}...`;
}
