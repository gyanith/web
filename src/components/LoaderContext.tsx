"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import TerminalLoader from "./TerminalLoader";

type LoaderContextType = {
  start: (text?: string) => void;
  ready: boolean;
};

const LoaderContext = createContext<LoaderContextType | null>(null);

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState("Loading...");

  const start = (t = "Loading...") => {
    setText(t);
    setReady(false); // ⬅ hide page
    setVisible(true);
  };

  const finish = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      document.documentElement.classList.remove("loader-active");
    }, 2200);
    setReady(true); // ⬅ reveal page
  }, []);

  return (
    <LoaderContext.Provider value={{ start, ready }}>
      <TerminalLoader visible={visible} text={text} onDone={finish} />
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader must be used inside LoaderProvider");
  return ctx;
};
