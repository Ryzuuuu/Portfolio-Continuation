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
          {/* hoodie: body, hood bunched behind the neck, raglan seams, drawstrings */}
          <path d="M89 352c27-68 85-103 152-103 72 0 131 35 164 103v146H89V352Z" fill="#E95438" stroke="#171715" strokeWidth="4" />
          <path d="M146 338c14-34 54-56 105-56s91 22 105 56c-15 42-55 68-105 68s-90-26-105-68Z" fill="#D9472E" stroke="#171715" strokeWidth="4" />
          <path d="M172 334c16-22 45-35 79-35s63 13 79 35" stroke="#171715" strokeWidth="3" />
          <path d="M150 352c-18 16-34 38-44 66M352 352c18 16 34 38 44 66" stroke="#171715" strokeWidth="3" strokeDasharray="8 8" />
          <path d="M233 400c-2 18-3 34-6 50M269 400c2 18 3 34 6 50" stroke="#171715" strokeWidth="3" strokeLinecap="round" />
          <path d="M221 449h11v15h-11zM270 449h11v15h-11z" fill="#F5F1E9" stroke="#171715" strokeWidth="2.5" />
          {/* neck and the chin's shadow */}
          <path d="M208 276c2 30-1 54-9 72 14 17 32 25 52 25s38-8 52-25c-8-18-11-42-9-72Z" fill="#E6AF8D" stroke="#171715" strokeWidth="4" />
          <path d="M206 300c15 13 29 19 45 19s30-6 45-19l1 12c-14 13-29 19-46 19s-32-6-46-19Z" fill="#D49576" />
          {/* face */}
          <path d="M154 174c0-66 42-106 97-106 60 0 99 42 99 107 0 50-9 88-31 112-17 19-39 33-68 34-29 0-51-14-70-37-18-22-27-62-27-110Z" fill="#F2C5A6" stroke="#171715" strokeWidth="4" />
          {/* hair: crown and a side-swept fringe, with a shine */}
          <path d="M141 190c-7-82 31-134 97-136 38-1 67 12 86 38 19 28 25 62 19 100Q340 166 334 146Q330 162 322 172Q314 148 300 124Q292 152 268 168Q276 144 262 120Q252 150 226 164Q236 140 220 122Q210 152 186 172Q196 150 178 140Q172 164 156 184Q150 188 141 190Z" fill="#171715" stroke="#171715" strokeWidth="5" strokeLinejoin="round" />
          <path d="M200 104c17-9 36-12 55-10M272 97c10 2 20 6 28 12" stroke="#F5F1E9" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M157 190c-22-1-35 15-32 36 3 18 18 28 38 24M341 190c21-2 32 14 30 34-2 19-14 31-30 30" fill="#F2C5A6" stroke="#171715" strokeWidth="4" />
          <path d="M185 197c11-6 24-7 36-3M275 195c12-5 25-4 36 2" stroke="#171715" strokeWidth="4.5" strokeLinecap="round" />
          {/* closed, smiling eyes */}
          <path d="M191 223c5-10 16-10 21 0M279 222c5-10 16-10 21 0" stroke="#171715" strokeWidth="4.5" strokeLinecap="round" />
          {/* blush with manga hatching */}
          <ellipse cx="200" cy="251" rx="13" ry="5.5" fill="#E95438" opacity=".22" />
          <ellipse cx="304" cy="250" rx="13" ry="5.5" fill="#E95438" opacity=".22" />
          <path d="M194 254l4-6M201 254l4-6M208 254l4-6M298 253l4-6M305 253l4-6M312 253l4-6" stroke="#C8452C" strokeWidth="2" strokeLinecap="round" />
          {/* nose and an easy, slightly lopsided smile */}
          <path d="M253 234c-1 7-4 13-8 16 4 3 9 3 13 0" stroke="#171715" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M228 268c11 11 32 12 46-1M274 267c2-1 4-4 4-7" stroke="#171715" strokeWidth="3.5" strokeLinecap="round" />
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
