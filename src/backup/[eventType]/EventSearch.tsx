"use client";

import React, { useState, useMemo, createContext, useContext } from "react";
import Image from "next/image";
import searchIcon from "@/assets/searchIcon.svg";
import EventCard from "@/my_components/EventCard";

// --- Context Definition ---

type EventSearchContextType = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredEvents: any[];
  initialEvents: any;
};

const EventSearchContext = createContext<EventSearchContextType | undefined>(
  undefined,
);

export const useEventSearch = () => {
  const context = useContext(EventSearchContext);
  if (!context) {
    throw new Error("useEventSearch must be used within an EventProvider");
  }
  return context;
};

// --- Provider Component ---

type EventProviderProps = {
  children: React.ReactNode;
  initialEvents: any;
};

export const EventProvider: React.FC<EventProviderProps> = ({
  children,
  initialEvents,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = useMemo(() => {
    if (!Array.isArray(initialEvents)) return [];
    if (!searchQuery.trim()) return initialEvents;

    const query = searchQuery.toLowerCase();
    return initialEvents.filter((event: any) => {
      const name = event.eventName?.toLowerCase() || "";
      const description = event.description?.toLowerCase() || "";
      return name.includes(query) || description.includes(query);
    });
  }, [initialEvents, searchQuery]);

  return (
    <EventSearchContext.Provider
      value={{ searchQuery, setSearchQuery, filteredEvents, initialEvents }}
    >
      {children}
    </EventSearchContext.Provider>
  );
};

// --- Search Bar Component ---

export const EventSearchBar: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { searchQuery, setSearchQuery } = useEventSearch();

  return (
    <span
      className={`w-full md:w-[40vw] lg:w-lg px-3 justify-center items-center bg-black flex flex-row-reverse md:flex-row h-12 rounded-full border border-amber-100/25 ${className}`}
    >
      <Image src={searchIcon} alt="search icon" />
      <input
        type="text"
        placeholder="Search Events"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full focus:outline-none ml-3 bg-transparent text-white placeholder-white/50"
      />
    </span>
  );
};

// --- Grid Component ---

export const EventGrid: React.FC = () => {
  const { filteredEvents, initialEvents } = useEventSearch();

  return (
    <div
      className="
        w-full
        grid
        gap-3
        place-content-center
        grid-cols-[repeat(auto-fit,minmax(280px,1fr))]
        md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]
        lg:grid-cols-[repeat(auto-fit,minmax(450px,1fr))]
      "
    >
      {Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
        filteredEvents.map((event: any) => (
          <EventCard
            key={event.eventId}
            eventId={event.eventId}
            eventType={event.eventType}
            eventName={event.eventName}
            description={event.description}
            day={event.day}
            location={event.location}
            prizePool={event.prizePool}
            imageUrl={event.imageUrl}
            start_time={event.start_time}
            end_time={event.end_time}
          />
        ))
      ) : (
        <div className="text-white text-center w-full col-span-full py-10">
          {!Array.isArray(initialEvents)
            ? (initialEvents as any)?.error
              ? "Failed to load events"
              : "No events found"
            : "No events found matching your search"}
        </div>
      )}
    </div>
  );
};
