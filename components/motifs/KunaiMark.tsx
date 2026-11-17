import type { SVGProps } from "react";

type KunaiMarkProps = SVGProps<SVGSVGElement>;

/**
 * Original kunai-inspired line motif used throughout the portfolio.
 * Drawn from scratch — no external or copyrighted artwork.
 */
export default function KunaiMark({
  className,
  strokeWidth = 1.4,
  ...props
}: KunaiMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path d="M24 2.5 34 15.5 24 27 14 15.5Z" />
      <path d="M24 6.5v20.5" opacity="0.55" />
      <path d="M18.5 16h11" opacity="0.35" />
      <path d="M24 27v6.5" />
      <path d="M18.5 33.5h11" />
      <path d="M20.5 36.5h7" opacity="0.55" />
      <circle cx="24" cy="41.5" r="4" />
      <circle cx="24" cy="41.5" r="1.4" opacity="0.45" />
    </svg>
  );
}
