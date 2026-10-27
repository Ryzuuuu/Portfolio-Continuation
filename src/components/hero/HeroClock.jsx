import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";

/** A CCTV-style timestamp in the given time zone, ticking on the second boundary. */
export function HeroClock({ timeZone, zoneLabel, camera = "CAM 01" }) {
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
    <span className="hero__clock" aria-hidden="true">
      <i />
      {camera} · <time dateTime={now.toISOString()}>{format.format(now)}</time> {zoneLabel}
    </span>
  );
}

HeroClock.propTypes = {
  timeZone: PropTypes.string.isRequired,
  zoneLabel: PropTypes.string.isRequired,
  camera: PropTypes.string,
};
