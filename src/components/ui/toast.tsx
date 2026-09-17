"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/backup/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export function Toast({
  message,
  type = "success",
  duration = 5000,
  onClose,
}: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const newProgress = (remaining / duration) * 100;

      setProgress(newProgress);

      if (remaining <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500/10 border-green-500/20 text-green-500";
      case "error":
        return "bg-red-500/10 border-red-500/20 text-red-500";
      case "info":
        return "bg-blue-500/10 border-blue-500/20 text-blue-500";
      default:
        return "bg-green-500/10 border-green-500/20 text-green-500";
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 1,
      }}
      className={cn(
        "relative min-w-[300px] max-w-md rounded-lg border backdrop-blur-sm p-4 shadow-lg",
        getTypeStyles(),
      )}
    >
      {/* Timer bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 rounded-t-lg overflow-hidden">
        <motion.div
          className={cn("h-full", getProgressColor())}
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>

      {/* Content */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-sm font-medium text-white">{message}</p>
        <motion.button
          onClick={onClose}
          className="flex-shrink-0 rounded-full p-1 hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-4 w-4 text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: "success" | "error" | "info";
  }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-1000 flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div key={toast.id} layout className="pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => onRemove(toast.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
