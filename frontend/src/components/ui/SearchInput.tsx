import {
  Search,
  X,
} from "lucide-react";

import type {
  InputHTMLAttributes,
} from "react";

interface SearchInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export default function SearchInput({
  value,
  onClear,
  placeholder = "Search...",
  className = "",
  ...props
}: SearchInputProps) {
  const hasValue =
    typeof value === "string" &&
    value.length > 0;

  return (
    <div className="relative w-full">
      {/* Search Icon */}

      <Search
        size={18}
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          left-3
          top-1/2

          -translate-y-1/2

          text-slate-400
          dark:text-slate-500
        "
      />

      {/* Input */}

      <input
        type="search"
        value={value}
        placeholder={placeholder}
        className={`
          w-full

          rounded-xl

          border
          border-slate-200
          dark:border-slate-800

          bg-white
          dark:bg-slate-950

          py-3
          pl-10
          pr-10

          text-sm

          text-slate-900
          dark:text-white

          placeholder:text-slate-400
          dark:placeholder:text-slate-600

          outline-none

          transition-all
          duration-200

          hover:border-slate-300
          dark:hover:border-slate-700

          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-500/10

          ${className}
        `}
        {...props}
      />

      {/* Clear Button */}

      {hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="
            absolute
            right-2
            top-1/2

            flex
            h-8
            w-8

            -translate-y-1/2
            items-center
            justify-center

            rounded-lg

            text-slate-400
            dark:text-slate-500

            transition

            hover:bg-slate-100
            hover:text-slate-700

            dark:hover:bg-slate-800
            dark:hover:text-slate-200

            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-blue-500
          "
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
