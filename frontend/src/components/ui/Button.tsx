import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import {
  Loader2,
} from "lucide-react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";

type ButtonSize =
  | "sm"
  | "md"
  | "lg"
  | "xl";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-blue-600
    text-white
    shadow-lg
    shadow-blue-600/20

    hover:bg-blue-700
    hover:shadow-blue-600/30

    dark:bg-blue-600
    dark:hover:bg-blue-500
  `,

  secondary: `
    bg-slate-100
    text-slate-900

    hover:bg-slate-200

    dark:bg-slate-800
    dark:text-white
    dark:hover:bg-slate-700
  `,

  outline: `
    border
    border-slate-300
    bg-transparent
    text-slate-700

    hover:border-blue-500
    hover:bg-blue-50
    hover:text-blue-600

    dark:border-slate-700
    dark:text-slate-200
    dark:hover:border-blue-500
    dark:hover:bg-blue-500/10
    dark:hover:text-blue-400
  `,

  ghost: `
    bg-transparent
    text-slate-700

    hover:bg-slate-100

    dark:text-slate-300
    dark:hover:bg-slate-800
    dark:hover:text-white
  `,

  danger: `
    bg-red-600
    text-white
    shadow-lg
    shadow-red-600/20

    hover:bg-red-700
    hover:shadow-red-600/30
  `,

  success: `
    bg-emerald-600
    text-white
    shadow-lg
    shadow-emerald-600/20

    hover:bg-emerald-700
    hover:shadow-emerald-600/30
  `,
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: `
    min-h-9
    px-3
    text-sm
    rounded-lg
  `,

  md: `
    min-h-10
    px-4
    text-sm
    rounded-xl
  `,

  lg: `
    min-h-12
    px-5
    text-base
    rounded-xl
  `,

  xl: `
    min-h-14
    px-6
    text-base
    rounded-2xl
  `,
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2

        whitespace-nowrap

        font-semibold

        transition-all
        duration-200

        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-blue-500
        focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-slate-950

        active:scale-[0.98]

        disabled:pointer-events-none
        disabled:cursor-not-allowed
        disabled:opacity-50

        ${variantClasses[variant]}
        ${sizeClasses[size]}

        ${fullWidth ? "w-full" : ""}

        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2
          size={18}
          className="animate-spin"
          aria-hidden="true"
        />
      ) : (
        leftIcon
      )}

      <span>
        {children}
      </span>

      {!loading && rightIcon}
    </button>
  );
}