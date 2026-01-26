"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import Toast from "@/components/Toast";

interface ToastOptions {
  title: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  duration?: number; // ms, default 5000
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [toastProps, setToastProps] = useState<Omit<
    ToastOptions,
    "duration"
  > | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    setIsVisible(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    // If a toast is already showing, hide it first? Or just overwrite.
    // Let's overwrite.
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToastProps({
      title: options.title,
      description: options.description,
      buttonText: options.buttonText,
      onButtonClick: options.onButtonClick,
    });
    setIsVisible(true);

    const duration = options.duration || 5000;
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toastProps && (
        <Toast
          isVisible={isVisible}
          title={toastProps.title}
          description={toastProps.description}
          buttonText={toastProps.buttonText}
          onButtonClick={() => {
            if (toastProps.onButtonClick) toastProps.onButtonClick();
            hideToast(); // Auto hide on action? Usually yes.
          }}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
