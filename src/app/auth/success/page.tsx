"use client";

import React from "react";

import { useNavigate } from "@/hooks/useNavigate";

const page = () => {
  const navigate = useNavigate();

  setTimeout(() => {
    navigate("/");
  }, 3000);

  return (
    <div className="text-5xl text-green-300">
      SIGNED UP SUCCESSFULLY <br /> REDIRECTING TO HOME
    </div>
  );
};

export default page;
