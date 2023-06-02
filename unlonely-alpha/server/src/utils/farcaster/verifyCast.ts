export default function verifyCast(cast: string) {
  if (cast.startsWith("@noFCplz") || cast.length > 320 || cast.length < 1) {
    return false;
  }
  return true;
}
