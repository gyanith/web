"use client";

import React from "react";
import { ComingSoon } from "@/components/ui/coming-soon";

export default function ProshowsPage() {
  return (
    <div className="min-h-screen w-full bg-[#070a10]">
      <ComingSoon
        title="PROSHOWS"
        message="To be announced soon"
        showBackButton={true}
      />
    </div>
  );
}
