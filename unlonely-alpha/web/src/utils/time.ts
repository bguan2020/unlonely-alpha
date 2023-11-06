/* eslint-disable prefer-template */
// take timestamp, convert to hh:mm
export const timestampConverter = (timestamp: number) => {
  const current_date = new Date(timestamp);
  const hh = ("0" + current_date.getHours()).slice(-2);
  const mm = ("0" + current_date.getMinutes()).slice(-2);
  const time = `${hh}:${mm}`;
  return time;
};

// take datetime in format "2021-01-01T00:00:00.000Z", convert to "day of week, month, day number, HH:MM 3 letter timezone acronym" relative to their timezone
export const dateConverter = (date: string) => {
  const current_date = new Date(date);
  const day = current_date.toLocaleString("en-US", { weekday: "long" });
  const month = current_date.toLocaleString("en-US", { month: "long" });
  const day_number = current_date.getDate();
  const hh = Number(("0" + current_date.getHours()).slice(-2));
  const mm = ("0" + current_date.getMinutes()).slice(-2);
  // convert hh to 12 hour time
  const hh12 = hh > 12 ? hh - 12 : hh;
  const timezone = current_date.toLocaleString("en-US", {
    timeZoneName: "short",
  });
  const timezone_acronym = timezone.split(" ")[2];
  const date_time = `${day}, ${month} ${day_number}, ${hh12}:${mm} ${timezone_acronym}`;
  return date_time;
};

export const getTimesFromMillis = (millis: number) => {
  let seconds = parseInt((millis / 1000).toString());
  const days = parseInt((seconds / 86400).toString());
  seconds = seconds % 86400;
  const hours = parseInt((seconds / 3600).toString());
  seconds = seconds % 3600;
  const minutes = parseInt((seconds / 60).toString());
  seconds = seconds % 60;

  return { days, hours, minutes, seconds };
};

export const getTimeFromMillis = (millis: number): string => {
  if (millis === 0) return "0";
  const { days, hours, minutes } = getTimesFromMillis(millis);

  let str = `${days > 0 ? `${days}d` : ""}${hours > 0 ? " " : ""}${
    hours > 0 ? `${hours}h` : ""
  }${minutes > 0 ? " " : ""}${minutes > 0 ? `${minutes}m` : ""}`;
  if (str === "") str = "<1m";
  return str;
};

export const getHourAndMinutesFromMillis = (millis: number): string => {
  const time = new Date(millis);
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");

  const timeString = `${hours}:${minutes}`;
  return timeString;
};