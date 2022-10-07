import { isToday, isYesterday, isThisWeek, isThisYear, format } from "date-fns";

export function humanDate(maybeDate: Date | number | string) {
  const date = ensureDate(maybeDate);

  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else if (isThisWeek(date)) {
    // Just tell me the date of the week if it's this week
    return format(date, "EEEE");
  } else if (isThisYear(date)) {
    // I don't want to see the year if it's this year
    return format(date, "EEEE, MMMM do");
  } else {
    return fullDate(date);
  }
}

function ensureDate(maybeDate: Date | string | number) {
  return typeof maybeDate === "number" || typeof maybeDate === "string"
    ? new Date(parseInt(maybeDate.toString(), 10))
    : maybeDate;
}

export function fullDate(maybeDate: Date | number | string) {
  return format(ensureDate(maybeDate), "PPPP");
}
