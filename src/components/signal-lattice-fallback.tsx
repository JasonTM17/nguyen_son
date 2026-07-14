export function SignalLatticeFallback() {
  return (
    <svg
      aria-hidden="true"
      className="signal-lattice-fallback"
      focusable="false"
      viewBox="0 0 520 400"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fallback-core" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-soft)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <g className="signal-lattice-fallback__lines">
        <path d="M26 296 182 202 264 94 455 166" />
        <path d="M26 296 175 320 322 274 488 332" />
        <path d="M182 202 322 274 455 166" />
        <path d="M175 320 264 94 455 166" />
      </g>
      <g className="signal-lattice-fallback__nodes">
        <circle cx="26" cy="296" r="8" />
        <circle cx="182" cy="202" r="8" />
        <circle cx="175" cy="320" r="6" />
        <circle cx="264" cy="94" r="9" />
        <circle cx="322" cy="274" r="7" />
        <circle cx="455" cy="166" r="8" />
        <circle cx="488" cy="332" r="6" />
      </g>
      <path className="signal-lattice-fallback__core" d="m264 150 42 24v50l-42 24-42-24v-50z" />
    </svg>
  );
}
