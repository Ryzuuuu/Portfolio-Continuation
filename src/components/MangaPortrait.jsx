import PropTypes from "prop-types";
import { Asterisk } from "lucide-react";

/** The hand-drawn self-portrait. `children` render inside the frame (e.g. overlays). */
export function MangaPortrait({ children = null }) {
  return (
    <div
      className="portrait-frame"
      aria-label="Original manga-inspired portrait illustration"
      role="img"
    >
      <div className="portrait-frame__caption">FIG. 01 / THE BUILDER</div>
      {/* prettier-ignore */}
      <svg className="portrait-art" viewBox="0 0 480 560" fill="none" aria-hidden="true">
        <defs>
          <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#171715" />
          </pattern>
          <clipPath id="portraitClip">
            <path d="M84 82h311v400H84z" />
          </clipPath>
        </defs>
        <path d="M60 56h348v448H60z" fill="#E9E2D7" stroke="#171715" strokeWidth="3" />
        <path d="M281 56h127v205H281z" fill="url(#dots)" />
        <path d="M84 82h311v400H84z" fill="#F5F1E9" stroke="#171715" strokeWidth="3" />
        <g clipPath="url(#portraitClip)">
          <path d="M89 352c27-68 85-103 152-103 72 0 131 35 164 103v146H89V352Z" fill="#E95438" stroke="#171715" strokeWidth="4" />
          <path d="M173 290c1 31-10 60-22 78 26 33 55 48 90 48 34 0 65-17 91-49-17-20-24-51-24-82l-135 5Z" fill="#E6AF8D" stroke="#171715" strokeWidth="4" />
          <path d="M152 170c0-67 41-103 95-103 62 0 104 42 104 111 0 48-10 94-34 121-19 21-44 34-72 34-36 0-62-18-78-46-13-25-15-74-15-117Z" fill="#F2C5A6" stroke="#171715" strokeWidth="4" />
          <path d="M143 179c-4-76 28-125 92-129 35-2 62 11 81 37 20 27 27 60 21 100-18-15-32-42-39-68-30 28-78 44-142 45l-13 15Z" fill="#171715" stroke="#171715" strokeWidth="5" strokeLinejoin="round" />
          <path d="M154 189c-22 0-34 17-31 38 2 19 15 31 32 28M340 190c21-2 32 14 30 34-2 19-14 31-30 30" fill="#F2C5A6" stroke="#171715" strokeWidth="4" />
          <path d="M184 198c12-9 27-9 39-2M270 196c13-8 27-7 38 1" stroke="#171715" strokeWidth="5" strokeLinecap="round" />
          <path d="M194 221c5-8 12-8 17 0M281 220c5-8 12-8 17 0" stroke="#171715" strokeWidth="4" strokeLinecap="round" />
          <path d="M246 220c-2 17-7 35-13 43 8 6 17 7 25 2M224 282c16 8 34 7 48-3" stroke="#171715" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M194 239c8 10 19 12 30 4M277 242c9 8 19 6 27-4" stroke="#171715" strokeWidth="3" strokeLinecap="round" />
          <path d="M102 377c44-25 90-37 140-37 58 0 106 13 146 39" stroke="#171715" strokeWidth="3" strokeDasharray="8 8" />
          <path d="M190 368 240 436l48-67" stroke="#171715" strokeWidth="4" />
          <path d="m153 380 27 117m149-119-26 119" stroke="#171715" strokeWidth="3" />
        </g>
        <path d="M60 504h348" stroke="#171715" strokeWidth="3" />
        <path d="M73 72h9m-9 0v9m313-9h-9m9 0v9M73 490h9m-9 0v-9m313 9h-9m9 0v-9" stroke="#E95438" strokeWidth="4" />
      </svg>
      <div className="portrait-note">
        <Asterisk size={16} aria-hidden="true" /> CURRENTLY MAKING GOOD THINGS
      </div>
      <span className="portrait-stamp">
        創<br />作
      </span>
      {children}
    </div>
  );
}

MangaPortrait.propTypes = {
  children: PropTypes.node,
};
