type HiddenLeafSealProps = {
  className?: string;
  strokeWidth?: number;
};

/**
 * Hidden Leaf insignia — an original geometric rendering of the leaf-spiral
 * crest used by the mission archive and the chronicle map. Drawn from simple
 * arcs so it stays crisp at any size and costs nothing to render.
 */
export default function HiddenLeafSeal({
  className,
  strokeWidth = 3,
}: HiddenLeafSealProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="60" cy="60" r="53" opacity="0.55" />
      <circle cx="60" cy="60" r="47" opacity="0.25" strokeDasharray="2 6" />
      <path
        d="M60 94c-18 0-33-14.5-33-33.5S42.5 28 60.5 28 88 39.5 88 54.5 77.5 79 63.5 79 43 69 43 56.5 52 36 64 36s17 8 17 16-5.5 13-12.5 13-11-4-11-9 3-8 7.5-8"
        opacity="0.95"
      />
    </svg>
  );
}
