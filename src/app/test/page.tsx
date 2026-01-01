// components/SplineScene.jsx (or .tsx)
"use client"; // Add this directive if using App Router

import Spline from "@splinetool/react-spline";
import React from "react";

export default function SplineScene() {
  return (
    // It is important to wrap the Spline component in a container
    // and give it a defined height, otherwise it won't be visible.
    <div style={{ width: "100%", height: "00%" }}>
      <Spline
        scene="https://prod.spline.design/svtkCQTvqgUj3YRs/scene.splinecode" // Paste your URL here
      />
    </div>
  );
}
