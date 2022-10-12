// take timestamp, convert to hh:mm
export const timestampConverter = (timestamp: number) => {
  const current_date = new Date(timestamp);
  const hh = ("0" + current_date.getHours()).slice(-2);
  const mm = ("0" + current_date.getMinutes()).slice(-2);
  const time = `${hh}:${mm}`;
  return time;
};

// take datetime in format "2021-01-01T00:00:00.000Z", convert to "day of week, month day PST"
export const dateConverter = (date: string) => {
  const current_date = new Date(date);
  const day = current_date.toLocaleString("en-US", { weekday: "long" });
  const month = current_date.toLocaleString("en-US", { month: "long" });
  const dayNum = current_date.toLocaleString("en-US", { day: "numeric" });
  const time = current_date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const dateStr = `${day}, ${month} ${dayNum} ${time} PST`;
  return dateStr;
}