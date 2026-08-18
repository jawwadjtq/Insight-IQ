import {
  useState,
  type ReactNode,
} from "react";

type TooltipPosition =
  | "top"
  | "bottom"
  | "left"
  | "right";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: TooltipPosition;
  disabled?: boolean;
  className?: string;
}

const positionClasses: Record<
  TooltipPosition,
  string
> = {
  top: `
    bottom-full
    left-1/2
    mb-2
    -translate-x-1/2
  `,

  bottom: `
    left-1/2
    top-full
    mt-2
    -translate-x-1/2
  `,

  left: `
    right-full
    top-1/2
    mr-2
    -translate-y-1/2
  `,

  right: `
    left-full
    top-1/2
    ml-2
    -translate-y-1/2
  `,
};

export default function Tooltip({
  content,
  children,
  position = "top",
  disabled = false,
  className = "",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div
      className={`
        relative
        inline-flex

        ${className}
      `}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}

      {visible && (
        <div
          role="tooltip"
          className={`
            pointer-events-none
            absolute
            z-[200]

            whitespace-nowrap

            rounded-lg

            bg-slate-950
            dark:bg-white

            px-3
            py-2

            text-xs
            font-medium

            text-white
            dark:text-slate-900

            shadow-xl

            ${positionClasses[position]}
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
}