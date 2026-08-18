import type {
  TextareaHTMLAttributes,
} from "react";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
}

export default function Textarea({
  label,
  error,
  hint,
  showCount = false,
  className = "",
  id,
  value,
  defaultValue,
  maxLength,
  ...props
}: TextareaProps) {
  const textareaId =
    id ||
    (label
      ? label.toLowerCase().replace(/\s+/g, "-")
      : undefined);

  const currentLength =
    typeof value === "string"
      ? value.length
      : typeof defaultValue === "string"
        ? defaultValue.length
        : 0;

  return (
    <div className="w-full">
      {/* Label */}

      {label && (
        <label
          htmlFor={textareaId}
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

      {/* Textarea */}

      <textarea
        id={textareaId}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error
            ? `${textareaId}-error`
            : hint
              ? `${textareaId}-hint`
              : undefined
        }
        className={`
          min-h-32
          w-full
          resize-y

          rounded-xl

          border

          bg-white
          dark:bg-slate-950

          px-4
          py-3

          text-sm
          leading-6

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

          ${className}
        `}
        {...props}
      />

      {/* Footer */}

      {(error || hint || (showCount && maxLength)) && (
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            {error && (
              <p
                id={`${textareaId}-error`}
                className="
                  text-xs
                  font-medium
                  text-red-600
                  dark:text-red-400
                "
              >
                {error}
              </p>
            )}

            {!error && hint && (
              <p
                id={`${textareaId}-hint`}
                className="
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {hint}
              </p>
            )}
          </div>

          {showCount && maxLength && (
            <span className="shrink-0 text-xs text-slate-400">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}