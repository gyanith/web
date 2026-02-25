"use client";

import { usePathname } from "next/navigation";
import Footer from "@/my_components/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Define routes where the footer SHOULD be visible
  // We want it on:
  // - /events/[eventType]
  // - /events/[eventType]/[eventId]
  // - /partners
  // - /sponsors (mentioned as synonyms often, checking for /partners/sponsors)
  // - /icdtses (conference page often has scrolling)
  // - /conference (conference page)

  const isEventsPage = pathname?.startsWith("/events/");
  const isPartnersPage = pathname === "/partners";
  const isSponsorsPage = pathname === "/sponsors";
  const isConferencePage =
    pathname === "/icdtses" || pathname === "/conference";
  const isCore = pathname === "/core";
  const isProshow = pathname === "/proshows";

  const shouldShowFooter =
    isEventsPage ||
    isPartnersPage ||
    isSponsorsPage ||
    isConferencePage ||
    isCore ||
    isProshow;

  if (!shouldShowFooter) {
    return null;
  }

  return <Footer />;
}
