// take timestamp, convert to hh:mm
export const timestampConverter = (timestamp: number) => {
  const current_date = new Date(timestamp);
  const hh = ('0'+current_date.getHours()).slice(-2);
  const mm = ('0'+current_date.getMinutes()).slice(-2);
  const time = `${hh}:${mm}`;
  return time;
}