import type {
  ReactNode,
  SelectHTMLAttributes,
} from "react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: ReactNode;
}

export default function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  leftIcon,
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectId =
    id ||
    (label
      ? label.toLowerCase().replace(/\s+/g, "-")
      : undefined);

  return (
    <div className="w-full">
      {/* Label */}

      {label && (
        <label
          htmlFor={selectId}
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

      {/* Select Wrapper */}

      <div className="relative">
        {leftIcon && (
          <div
            className="
              pointer-events-none

              absolute
              left-3
              top-1/2
              z-10

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

        <select
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${selectId}-error`
              : hint
                ? `${selectId}-hint`
                : undefined
          }
          className={`
            w-full

            appearance-none

            rounded-xl

            border

            bg-white
            dark:bg-slate-950

            px-4
            py-3
            pr-10

            text-sm

            text-slate-900
            dark:text-white

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

            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Arrow */}

        <div
          className="
            pointer-events-none

            absolute
            right-3
            top-1/2

            -translate-y-1/2

            text-slate-400
            dark:text-slate-500
          "
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Error */}

      {error && (
        <p
          id={`${selectId}-error`}
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
          id={`${selectId}-hint`}
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