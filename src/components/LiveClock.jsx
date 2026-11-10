import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";

/** The local time in the given time zone, ticking on the second boundary. */
export function LiveClock({ timeZone, zoneLabel, label = "LOCAL TIME" }) {
  const [now, setNow] = useState(() => new Date());
  const format = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }),
    [timeZone]
  );

  useEffect(() => {
    let timer;
    function schedule() {
      // Land each tick just after the second changes, so it never visibly lags.
      timer = setTimeout(
        () => {
          setNow(new Date());
          schedule();
        },
        1000 - (Date.now() % 1000) + 15
      );
    }
    schedule();
    return () => clearTimeout(timer);
  }, []);

  return (
    <span className="live-clock" aria-hidden="true">
      {label} · <time dateTime={now.toISOString()}>{format.format(now)}</time> {zoneLabel}
    </span>
  );
}

LiveClock.propTypes = {
  timeZone: PropTypes.string.isRequired,
  zoneLabel: PropTypes.string.isRequired,
  label: PropTypes.string,
};
