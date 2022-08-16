// take timestamp, convert to hours:minutes
export const timestampConverter = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedTime = `${hours}:${minutes}`;
  return formattedTime;
}