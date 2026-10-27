import { useReadingProgress } from "../hooks/useReadingProgress.js";

// Its own component so scroll updates re-render this bar, not the whole page.
export function ReadingProgress() {
  const progress = useReadingProgress();
  return (
    <div
      className="reading-progress"
      aria-hidden="true"
      style={{ transform: `scaleX(${progress / 100})` }}
    />
  );
}
