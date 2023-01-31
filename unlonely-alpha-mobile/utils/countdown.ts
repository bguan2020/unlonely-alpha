export const countdownText = (days: number, hours: number, minutes: number, seconds: number) => {
  let string;

  if (seconds >= 0) {
    string = `in ${seconds}s`;
  }

  if (minutes > 0) {
    string = `in ${minutes}m ${seconds}s`;
  }

  if (hours > 0) {
    string = `in ${hours}h ${minutes}m ${seconds}s`;
  }

  if (days > 0) {
    string = `in ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  return string;
};
