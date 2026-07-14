export function StudioSceneFallback() {
  return (
    <svg
      aria-hidden="true"
      className="studio-scene-fallback"
      focusable="false"
      viewBox="0 0 640 480"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="studio-scene-fallback__shadow">
        <ellipse cx="326" cy="395" rx="238" ry="40" />
      </g>
      <g className="studio-scene-fallback__platform">
        <path d="m74 310 239-102 255 92-237 115z" />
        <path d="m74 310 257 105v25L74 334z" />
        <path d="m331 415 237-115v26L331 440z" />
      </g>
      <g className="studio-scene-fallback__rack">
        <path d="m117 234 72-35 45 22-72 36z" />
        <path d="m117 234 45 23v102l-45-23z" />
        <path d="m162 257 72-36v103l-72 35z" />
        <path d="m170 277 53-26M170 301l53-26M170 325l53-26" />
        <circle cx="181" cy="276" r="5" />
        <circle cx="181" cy="300" r="5" />
        <circle cx="181" cy="324" r="5" />
      </g>
      <g className="studio-scene-fallback__desk">
        <path d="m225 304 166-71 150 55-167 75z" />
        <path d="m225 304 149 59v23l-149-58z" />
        <path d="m374 363 167-75v23l-167 75z" />
        <path d="m275 326 15 58M478 292l-14 60" />
      </g>
      <g className="studio-scene-fallback__monitor">
        <path d="m263 205 91-39 44 17-92 40z" />
        <path d="m263 205 43 18v63l-43-18z" />
        <path d="m306 223 92-40v64l-92 39z" />
        <path d="m317 232 66-28v34l-66 28z" />
        <path d="m351 275 11 31" />
        <path d="m405 253 79-34 41 16-79 34z" />
        <path d="m405 253 41 16v58l-41-16z" />
        <path d="m446 269 79-34v58l-79 34z" />
        <path d="m456 279 55-24v29l-55 24z" />
        <path d="m479 316 9 27" />
      </g>
      <g className="studio-scene-fallback__routes">
        <path d="m202 349 63-24 77 29 70-33 72 25" />
        <circle cx="202" cy="349" r="7" />
        <circle cx="265" cy="325" r="7" />
        <circle cx="342" cy="354" r="7" />
        <circle cx="412" cy="321" r="7" />
        <circle cx="484" cy="346" r="7" />
      </g>
      <g className="studio-scene-fallback__beacon">
        <path d="m514 194 38-18 35 17v45l-38 18-35-18z" />
        <path d="m514 194 35 18 38-19M549 212v44" />
        <path d="m533 263h32l11 31h-54z" />
      </g>
    </svg>
  );
}
