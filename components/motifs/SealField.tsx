type SealFieldProps = {
  id: string;
  className?: string;
};

/**
 * Sparse repeating seal grid used as an atmospheric layer.
 * The id must be unique per page instance because SVG pattern ids are global.
 */
export default function SealField({ id, className }: SealFieldProps) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id={id}
          width="88"
          height="88"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <circle cx="44" cy="44" r="11" fill="none" stroke="currentColor" />
          <path
            d="M44 29v30M29 44h30M44 38l6 6-6 6-6-6Z"
            fill="none"
            stroke="currentColor"
          />
          <path d="M0 44h18M70 44h18M44 0v18M44 70v18" stroke="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
