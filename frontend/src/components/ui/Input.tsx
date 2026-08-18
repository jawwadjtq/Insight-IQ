import type {
  InputHTMLAttributes,
  ReactNode,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId =
    id ||
    (label
      ? label.toLowerCase().replace(/\s+/g, "-")
      : undefined);

  return (
    <div className="w-full">
      {/* Label */}

      {label && (
        <label
          htmlFor={inputId}
          className="
            mb-2
            block

            text-sm
            font-semibold

            text-slate-700
            dark:text-slate-200
          "
        >
          {label}
        </label>
      )}

      {/* Input Wrapper */}

      <div className="relative">
        {/* Left Icon */}

        {leftIcon && (
          <div
            className="
              pointer-events-none

              absolute
              left-3
              top-1/2

              flex
              -translate-y-1/2
              items-center
              justify-center

              text-slate-400
              dark:text-slate-500
            "
          >
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : hint
                ? `${inputId}-hint`
                : undefined
          }
          className={`
            w-full

            rounded-xl

            border

            bg-white
            dark:bg-slate-950

            px-4
            py-3

            text-sm

            text-slate-900
            dark:text-white

            placeholder:text-slate-400
            dark:placeholder:text-slate-600

            outline-none

            transition-all
            duration-200

            focus:border-blue-500
            focus:ring-4
            focus:ring-blue-500/10

            disabled:cursor-not-allowed
            disabled:opacity-60

            ${
              error
                ? `
                  border-red-500
                  focus:border-red-500
                  focus:ring-red-500/10
                `
                : `
                  border-slate-200
                  dark:border-slate-800

                  hover:border-slate-300
                  dark:hover:border-slate-700
                `
            }

            ${leftIcon ? "pl-10" : ""}

            ${rightIcon ? "pr-10" : ""}

            ${className}
          `}
          {...props}
        />

        {/* Right Icon */}

        {rightIcon && (
          <div
            className="
              absolute
              right-3
              top-1/2

              flex
              -translate-y-1/2
              items-center
              justify-center

              text-slate-400
              dark:text-slate-500
            "
          >
            {rightIcon}
          </div>
        )}
      </div>

      {/* Error */}

      {error && (
        <p
          id={`${inputId}-error`}
          className="
            mt-2

            text-xs
            font-medium

            text-red-600
            dark:text-red-400
          "
        >
          {error}
        </p>
      )}

      {/* Hint */}

      {!error && hint && (
        <p
          id={`${inputId}-hint`}
          className="
            mt-2

            text-xs

            text-slate-500
            dark:text-slate-400
          "
        >
          {hint}
        </p>
      )}
    </div>
  );
}