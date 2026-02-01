"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { unispace } from "@/fonts/fonts";

// --- Types ---

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (payload: Omit<ToastMessage, "id">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

// --- Context ---

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// --- Component ---

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, duration }: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);

      // Dynamic duration: min 3s, +80ms per character
      let finalDuration = duration;
      if (!finalDuration) {
        const baseTime = 3000;
        const timePerChar = 80;
        finalDuration = Math.max(baseTime, message.length * timePerChar);
      }

      const newToast = { id, type, title, message, duration: finalDuration };

      setToasts((prev) => [...prev, newToast]);

      if (finalDuration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, finalDuration);
      }
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, title?: string) =>
      addToast({ type: "success", message, title }),
    [addToast],
  );

  const error = useCallback(
    (message: string, title?: string) =>
      addToast({ type: "error", message, title }),
    [addToast],
  );

  const info = useCallback(
    (message: string, title?: string) =>
      addToast({ type: "info", message, title }),
    [addToast],
  );

  const contextValue = React.useMemo(
    () => ({ toast: addToast, success, error, info }),
    [addToast, success, error, info],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-4 md:top-auto md:bottom-4 left-1/2 -translate-x-1/2 z-50 p-4 md:p-6 flex flex-col gap-3 pointer-events-none max-w-md w-full items-center">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem
              key={t.id}
              toast={t}
              onDismiss={() => removeToast(t.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
}) => {
  // Detect if mobile for animation direction
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const borders = {
    success: "border-green-500/20",
    error: "border-red-500/20",
    info: "border-blue-500/20",
  };

  const backgrounds = {
    success: "bg-[#0a120a]",
    error: "bg-[#120a0a]",
    info: "bg-[#0a0a12]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: isMobile ? -50 : 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      layout
      className={`pointer-events-auto relative w-full overflow-hidden rounded-xl border backdrop-blur-xl shadow-lg ${backgrounds[toast.type]} ${borders[toast.type]}`}
    >
      <div className="flex p-4 gap-3">
        {/* Icon */}
        <div className="shrink-0 pt-0.5">{icons[toast.type]}</div>

        {/* Content */}
        <div className="flex flex-col grow gap-1">
          {toast.title && (
            <h4
              className={`${unispace.className} text-sm font-bold text-white`}
            >
              {toast.title}
            </h4>
          )}
          <p className="text-sm text-white/70 leading-relaxed font-sans">
            {toast.message}
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="shrink-0 text-white/30 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar (Optional visual flair) */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{
          duration: toast.duration ? toast.duration / 1000 : 5,
          ease: "linear",
        }}
        className={`h-0.5 w-full absolute bottom-0 left-0 opacity-30 ${
          toast.type === "success"
            ? "bg-green-500"
            : toast.type === "error"
              ? "bg-red-500"
              : "bg-blue-500"
        }`}
      />
    </motion.div>
  );
};
