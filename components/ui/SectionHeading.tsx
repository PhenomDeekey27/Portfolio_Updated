import type { ReactNode } from "react";

type SectionHeadingProps = {
  index: string;
  label: string;
  title: string;
  description?: string;
  children?: ReactNode;
  align?: "left" | "center";
};

export default function SectionHeading({
  index,
  label,
  title,
  description,
  children,
  align = "left",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignment}`}>
      <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.32em] text-gold sm:text-[11px]">
        <span>{index}</span>
        <span aria-hidden="true" className="h-px w-10 bg-gold/40" />
        <span>{label}</span>
      </div>

      <h2 className="mt-5 max-w-3xl font-display text-4xl leading-[1.05] font-light tracking-tight text-bone sm:text-5xl lg:text-6xl">
        {title}
      </h2>

      {description ? (
        <p
          className={`mt-5 max-w-2xl text-sm leading-7 text-ash sm:text-base ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      ) : null}

      {children}
    </div>
  );
}
