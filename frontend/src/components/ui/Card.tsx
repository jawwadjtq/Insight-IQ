import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddingClasses = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  padding = "md",
  hover = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-3xl

        border
        border-slate-200
        dark:border-slate-800

        bg-white
        dark:bg-slate-900

        ${paddingClasses[padding]}

        ${
          hover
            ? `
              transition-all
              duration-300

              hover:-translate-y-1
              hover:border-blue-500/40
              hover:shadow-xl
            `
            : ""
        }

        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}