import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOverlayClick?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
}: ModalProps) {
  if (!open) {
    return null;
  }

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]

        flex
        items-center
        justify-center

        p-4
        sm:p-6

        bg-slate-950/60
        backdrop-blur-sm

        animate-in
        fade-in
        duration-200
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onMouseDown={handleOverlayClick}
    >
      <div
        className={`
          relative

          w-full
          ${sizeClasses[size]}

          max-h-[90vh]

          overflow-hidden

          rounded-3xl

          border
          border-slate-200
          dark:border-slate-800

          bg-white
          dark:bg-slate-900

          shadow-2xl

          animate-in
          zoom-in-95
          duration-200
        `}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}

        {(title || description) && (
          <div
            className="
              flex
              items-start
              justify-between
              gap-4

              border-b
              border-slate-200
              dark:border-slate-800

              px-6
              py-5
            "
          >
            <div className="min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="
                    text-lg
                    font-bold

                    text-slate-900
                    dark:text-white
                  "
                >
                  {title}
                </h2>
              )}

              {description && (
                <p
                  className="
                    mt-1

                    text-sm
                    leading-6

                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center

                rounded-xl

                text-slate-500
                dark:text-slate-400

                transition

                hover:bg-slate-100
                hover:text-slate-900

                dark:hover:bg-slate-800
                dark:hover:text-white

                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
              "
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Close button when no header */}

        {!title && !description && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="
              absolute
              right-4
              top-4
              z-10

              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-xl

              text-slate-500
              dark:text-slate-400

              transition

              hover:bg-slate-100
              hover:text-slate-900

              dark:hover:bg-slate-800
              dark:hover:text-white

              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-blue-500
            "
          >
            <X size={18} />
          </button>
        )}

        {/* Body */}

        <div className="max-h-[calc(90vh-150px)] overflow-y-auto px-6 py-6">
          {children}
        </div>

        {/* Footer */}

        {footer && (
          <div
            className="
              flex
              flex-col-reverse
              gap-3

              border-t
              border-slate-200
              dark:border-slate-800

              bg-slate-50/70
              dark:bg-slate-950/40

              px-6
              py-4

              sm:flex-row
              sm:justify-end
            "
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}