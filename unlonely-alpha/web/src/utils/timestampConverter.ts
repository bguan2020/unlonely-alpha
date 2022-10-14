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
