import { X } from "lucide-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type ToastVariant = "success" | "error" | "info";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastEntry extends Required<Pick<ToastOptions, "title">> {
  id: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const getToastId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const variantAccent: Record<ToastVariant, string> = {
  success: "border-l-green-500",
  error: "border-l-red-500",
  info: "border-l-blue-500",
};

const variantText: Record<ToastVariant, string> = {
  success: "text-green-700",
  error: "text-red-700",
  info: "text-blue-700",
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const timeoutRefs = useRef(new Map<string, number>());

  const dismissToast = useCallback((id: string) => {
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      title,
      description,
      variant = "info",
      duration = 4000,
    }: ToastOptions) => {
      const id = getToastId();
      setToasts((prev) => [...prev, { id, title, description, variant }]);

      if (duration > 0) {
        const timeoutId = window.setTimeout(() => {
          dismissToast(id);
        }, duration);
        timeoutRefs.current.set(id, timeoutId);
      }
    },
    [dismissToast]
  );

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId)
      );
      timeoutRefs.current.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[2000] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg transition-transform duration-200 ease-in-out ${
              variantAccent[toast.variant]
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${
                    variantText[toast.variant]
                  }`}
                >
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
