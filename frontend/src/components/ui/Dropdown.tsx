import {
  ChevronDown,
  Check,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  disabled = false,
  className = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) {
      return;
    }

    onChange?.(option.value);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
    >
      {/* Label */}

      {label && (
        <label className="
          mb-2
          block

          text-sm
          font-semibold

          text-slate-700
          dark:text-slate-200
        ">
          {label}
        </label>
      )}

      {/* Trigger */}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="
          flex
          min-h-11
          w-full
          items-center
          justify-between
          gap-3

          rounded-xl

          border
          border-slate-200
          dark:border-slate-800

          bg-white
          dark:bg-slate-950

          px-4
          py-3

          text-left
          text-sm

          text-slate-900
          dark:text-white

          transition-all
          duration-200

          hover:border-slate-300
          dark:hover:border-slate-700

          focus:outline-none
          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-500/10

          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <span
          className={
            selectedOption
              ? "flex items-center gap-2"
              : "text-slate-400 dark:text-slate-500"
          }
        >
          {selectedOption?.icon}

          {selectedOption?.label || placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`
            shrink-0
            text-slate-400

            transition-transform
            duration-200

            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* Menu */}

      {open && (
        <div
          className="
            absolute
            left-0
            right-0
            top-full
            z-50

            mt-2

            max-h-64
            overflow-y-auto

            rounded-2xl

            border
            border-slate-200
            dark:border-slate-800

            bg-white
            dark:bg-slate-900

            p-1.5

            shadow-2xl

            animate-in
            fade-in
            slide-in-from-top-2
            duration-150
          "
          role="listbox"
        >
          {options.length === 0 ? (
            <div
              className="
                px-4
                py-3

                text-center
                text-sm

                text-slate-500
                dark:text-slate-400
              "
            >
              No options available
            </div>
          ) : (
            options.map((option) => {
              const isSelected =
                option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option)}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-3

                    rounded-xl

                    px-3
                    py-2.5

                    text-left
                    text-sm

                    transition

                    hover:bg-slate-100
                    dark:hover:bg-slate-800

                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <span className="
                    flex
                    items-center
                    gap-3

                    text-slate-700
                    dark:text-slate-200
                  ">
                    {option.icon}

                    {option.label}
                  </span>

                  {isSelected && (
                    <Check
                      size={17}
                      className="
                        shrink-0
                        text-blue-600
                        dark:text-blue-400
                      "
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}