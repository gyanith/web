// components/LoaderContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import TerminalLoader from "./TerminalLoader";

type LoaderContextType = {
  start: (text?: string) => void;
  ready: boolean;
  isNavigating: boolean;
};

const LoaderContext = createContext<LoaderContextType | null>(null);

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(true);
  const [text, setText] = useState("Loading...");
  const [isNavigating, setIsNavigating] = useState(false);
  
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const navigationStartTime = useRef<number | null>(null);
  
  // Constants for dynamic loading
  const MIN_LOAD_TIME = 500; // Minimum time to show loader to prevent flicker
  const MAX_LOAD_TIME = 5000; // Emergency timeout
  const CHECK_INTERVAL = 100;

  // Detect actual route changes
  useEffect(() => {
    if (previousPathname.current !== pathname && isNavigating) {
      const startTime = navigationStartTime.current || Date.now();
      
      const checkContentReady = () => {
        const timeElapsed = Date.now() - startTime;
        
        // Check if document is complete
        const isDocReady = document.readyState === 'complete';
        
        // Check if all images are loaded
        const images = Array.from(document.images);
        const areImagesLoaded = images.every(img => img.complete);
        
        const isReady = isDocReady && areImagesLoaded;
        const isMinTimeElapsed = timeElapsed >= MIN_LOAD_TIME;
        const isMaxTimeElapsed = timeElapsed >= MAX_LOAD_TIME;

        if ((isReady && isMinTimeElapsed) || isMaxTimeElapsed) {
          finish();
          previousPathname.current = pathname;
          navigationStartTime.current = null;
          setIsNavigating(false);
        } else {
          // Keep checking
          setTimeout(checkContentReady, CHECK_INTERVAL);
        }
      };

      // Start checking
      checkContentReady();
    }
  }, [pathname, isNavigating]);

  const start = useCallback((t = "Loading...") => {
    setText(t);
    setReady(false);
    setVisible(true);
    setIsNavigating(true);
    navigationStartTime.current = Date.now();
    document.documentElement.classList.add("loader-active");
  }, []);

  const finish = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      document.documentElement.classList.remove("loader-active");
    }, 500);
    setReady(true);
  }, []);

  return (
    <LoaderContext.Provider value={{ start, ready, isNavigating }}>
      <TerminalLoader visible={visible} text={text} onDone={finish} />
      {/* Only show children when ready */}
      <div style={{ opacity: ready ? 1 : 0, transition: "opacity 0.3s" }}>
        {children}
      </div>
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader must be used inside LoaderProvider");
  return ctx;
};
