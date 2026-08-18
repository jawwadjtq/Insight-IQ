import type { CSSProperties, HTMLAttributes } from "react";

type SkeletonVariant = "text" | "circle" | "rect" | "card";

interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export default function Skeleton({
  variant = "rect",
  width,
  height,
  lines = 1,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const getStyle = (): CSSProperties => {
    const styles: CSSProperties = {
      ...style,
    };

    if (width !== undefined) {
      styles.width =
        typeof width === "number"
          ? `${width}px`
          : width;
    }

    if (height !== undefined) {
      styles.height =
        typeof height === "number"
          ? `${height}px`
          : height;
    }

    return styles;
  };

  if (variant === "text") {
    return (
      <div
        className={`space-y-2 ${className}`}
        {...props}
      >
        {Array.from({
          length: Math.max(lines, 1),
        }).map((_, index) => (
          <div
            key={index}
            className={`
              h-4
              rounded-md

              bg-slate-200
              dark:bg-slate-800

              animate-pulse

              ${
                index === lines - 1 && lines > 1
                  ? "w-2/3"
                  : "w-full"
              }
            `}
            style={
              index === 0 &&
              (width !== undefined ||
                height !== undefined)
                ? getStyle()
                : undefined
            }
          />
        ))}
      </div>
    );
  }

  if (variant === "circle") {
    return (
      <div
        className={`
          shrink-0
          rounded-full

          bg-slate-200
          dark:bg-slate-800

          animate-pulse

          ${className}
        `}
        style={{
          width: width ?? 48,
          height: height ?? width ?? 48,
          ...style,
        }}
        {...props}
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`
          overflow-hidden

          rounded-2xl

          border
          border-slate-200
          dark:border-slate-800

          bg-white
          dark:bg-slate-900

          p-6

          ${className}
        `}
        {...props}
      >
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" />

          <div className="flex-1 space-y-2">
            <Skeleton
              width="45%"
              height={14}
            />

            <Skeleton
              width="70%"
              height={12}
            />
          </div>
        </div>

        <div className="mt-6">
          <Skeleton
            width="35%"
            height={28}
          />
        </div>

        <div className="mt-4">
          <Skeleton
            variant="text"
            lines={2}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        rounded-xl

        bg-slate-200
        dark:bg-slate-800

        animate-pulse

        ${className}
      `}
      style={getStyle()}
      {...props}
    />
  );
}