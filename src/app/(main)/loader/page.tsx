"use client";

import TerminalLoader from "@/components/TerminalLoader";
import React from "react";

const page = () => {
  return (
    <TerminalLoader
      visible={true}
      text="HELLO"
      onDone={() => console.log("HELLO")}
    />
  );
};

export default page;
