import { intervalToDuration } from "date-fns";
import { useNow } from "./hooks/use-now";

type HumanizedTimeProps = {
  time: string | Date;
  titlePrefix?: string;
  className?: string;
  format?: "short" | "long";
};

const formatters = {
  short: {
    years: (n: number) => `${n}y`,
    months: (n: number) => `${n}mo`,
    days: (n: number) => `${n}d`,
    hours: (n: number) => `${n}h`,
    minutes: (n: number) => `${n}m`,
  },
  long: {
    years: (n: number) => `${n} ${n === 1 ? "year" : "years"}`,
    months: (n: number) => `${n} ${n === 1 ? "month" : "months"}`,
    days: (n: number) => `${n} ${n === 1 ? "day" : "days"}`,
    hours: (n: number) => `${n} ${n === 1 ? "hour" : "hours"}`,
    minutes: (n: number) => `${n} ${n === 1 ? "minute" : "minutes"}`,
  },
};

type FormatterCollection = typeof formatters;
type FormatType = keyof FormatterCollection;
type Formatter = FormatterCollection[FormatType];

const calculateCurrentTime = (time: Date, now: Date, format: FormatType) => {
  const duration = intervalToDuration({ start: time, end: now });
  const currentFormatters = formatters[format];

  if (format === "long") {
    if (duration.years && duration.years > 0) return `${currentFormatters.years(duration.years)} ago`;
    if (duration.months && duration.months > 0) return `${currentFormatters.months(duration.months)} ago`;
    if (duration.days && duration.days > 0) {
      let dayStr = currentFormatters.days(duration.days);
      if (duration.hours && duration.hours > 0) {
        dayStr += `, ${currentFormatters.hours(duration.hours)}`;
      }
      return `${dayStr} ago`;
    }
    if (duration.hours && duration.hours > 0) return `${currentFormatters.hours(duration.hours)} ago`;
    // For "just now" vs "X minutes ago"
    if (duration.minutes && duration.minutes > 0) return `${currentFormatters.minutes(duration.minutes)} ago`;
    return "just now";
  }

  // Short format logic (remains largely the same as original effective logic)
  if (duration.years && duration.years > 0) return currentFormatters.years(duration.years);
  if (duration.months && duration.months > 0) return currentFormatters.months(duration.months);
  if (duration.days && duration.days > 0) {
    const hours = duration.hours || 0;
    return `${currentFormatters.days(duration.days)}${hours > 0 ? ` ${currentFormatters.hours(hours)}` : ""}`;
  }
  if (duration.hours && duration.hours > 0) return currentFormatters.hours(duration.hours);
  if (duration.minutes && duration.minutes > 0) return currentFormatters.minutes(duration.minutes);
  return "now"; // "now" for short format, vs "just now" for long
};

const HumanizedTime = ({ time, titlePrefix, className, format = "short" }: HumanizedTimeProps) => {
  const now = useNow();

  const date = new Date(time);
  // const formatter = formatters[format]; // No longer need to pass formatter object

  const currentTime = calculateCurrentTime(date, now, format); // Pass format string directly

  const longDate = date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <span className={className} title={titlePrefix ? `${titlePrefix} ${longDate}` : longDate}>
      {currentTime}
    </span>
  );
};

export default HumanizedTime;
