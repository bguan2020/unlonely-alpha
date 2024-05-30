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
  const hours = parseInt((seconds / 3600).toString());
  seconds = seconds % 3600;
  const minutes = parseInt((seconds / 60).toString());
  seconds = seconds % 60;

  return { hours, minutes, seconds };
};

export const getTimeFromMillis = (
  millis: number,
  showSeconds?: boolean,
  format?: boolean
): string => {
  if (millis === 0) return "0";

  const { hours, minutes, seconds } = getTimesFromMillis(millis);
  if (format) {
    const paddedHours = hours.toString().padStart(2, "0");
    const paddedMinutes = minutes.toString().padStart(2, "0");
    const paddedSeconds = seconds.toString().padStart(2, "0");

    if (showSeconds) return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    return `${paddedHours}:${paddedMinutes}`;
  }

  let str = `${hours > 0 ? `${hours}h` : ""}${minutes > 0 ? " " : ""}${
    minutes > 0 ? `${minutes}m` : ""
  }${showSeconds ? " " : ""}${showSeconds && seconds > 0 ? `${seconds}s` : ""}`;
  if (str === "") str = "<1m";
  return str;
};

export const getConvertedDateFromMillis = (millis: number): string => {
  const time = new Date(millis);
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  const timeString = `${hours}:${minutes}:${seconds}`;
  return timeString;
};

export function formatTimestampToTime(timestampInMilliseconds: number) {
  const date = new Date(timestampInMilliseconds);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12;
  hours = hours ? hours : 12; // The hour "0" should be "12"
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

  return hours + ":" + formattedMinutes + " " + ampm;
}

export function formatTimestampToDate(timestampInMilliseconds: number, noClock?: boolean) {
  const date = new Date(timestampInMilliseconds);
  const year = date.getFullYear();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()]; // getMonth() is zero-indexed
  const day = date.getDate().toString().padStart(2, "0");

  return `${month}-${day}-${year}${noClock ? "" : " " + formatTimestampToTime(timestampInMilliseconds)}`;
}
