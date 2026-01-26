"use client";

import * as React from "react";
import { Clock, Calendar as CalendarIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

interface TimePickerProps {
  value?: string; // "HH:MM AM/PM"
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

type View = "hours" | "minutes";
type Period = "AM" | "PM";

export function TimePicker({
  value,
  onChange,
  label,
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse initial value
  const parseTime = (timeStr?: string) => {
    if (!timeStr) return { hour: 12, minute: 0, period: "AM" as Period };
    const [time, period] = timeStr.split(" ");
    const [hour, minute] = time.split(":").map(Number);
    return {
      hour: hour || 12,
      minute: minute || 0,
      period: (period as Period) || "AM",
    };
  };

  const initial = parseTime(value);
  const [hour, setHour] = React.useState(initial.hour);
  const [minute, setMinute] = React.useState(initial.minute);
  const [period, setPeriod] = React.useState<Period>(initial.period);
  const [view, setView] = React.useState<View>("hours");

  // Sync with prop changes
  React.useEffect(() => {
    const parsed = parseTime(value);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setPeriod(parsed.period);
  }, [value]);

  const handleSave = () => {
    // Format: HH:MM AM/PM
    const formattedMinute = minute.toString().padStart(2, "0");
    const timeStr = `${hour}:${formattedMinute} ${period}`;
    onChange(timeStr);
    setOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
            onClick={() => {
              // Reset state on open if needed, or keep last
              const current = parseTime(value);
              setHour(current.hour);
              setMinute(current.minute);
              setPeriod(current.period);
              setView("hours");
            }}
          >
            <Clock className="mr-2 h-4 w-4" />
            {value || "Select time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border-none bg-transparent shadow-none"
          align="start"
          collisionPadding={10}
        >
          <div className="w-[320px] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Display Header */}
            <div className="bg-zinc-900/50 p-6 flex items-end justify-between border-b border-zinc-800/50">
              <div className="flex items-end gap-1">
                <div
                  className={cn(
                    "text-5xl font-bold cursor-pointer transition-colors",
                    view === "hours"
                      ? "text-white"
                      : "text-zinc-600 hover:text-white",
                  )}
                  onClick={() => setView("hours")}
                >
                  {hour}
                </div>
                <span className="text-5xl font-bold text-zinc-700 mb-1">:</span>
                <div
                  className={cn(
                    "text-5xl font-bold cursor-pointer transition-colors",
                    view === "minutes"
                      ? "text-white"
                      : "text-zinc-600 hover:text-white",
                  )}
                  onClick={() => setView("minutes")}
                >
                  {minute.toString().padStart(2, "0")}
                </div>
              </div>
              <div className="flex flex-col rounded-lg border border-zinc-800 overflow-hidden bg-zinc-900/50">
                <button
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold transition-colors",
                    period === "AM"
                      ? "bg-white text-black"
                      : "text-zinc-600 hover:text-white hover:bg-zinc-800",
                  )}
                  onClick={() => setPeriod("AM")}
                >
                  AM
                </button>
                <div className="h-[1px] bg-zinc-800" />
                <button
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold transition-colors",
                    period === "PM"
                      ? "bg-white text-black"
                      : "text-zinc-600 hover:text-white hover:bg-zinc-800",
                  )}
                  onClick={() => setPeriod("PM")}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Clock Face Area */}
            <div className="p-6 flex justify-center bg-zinc-950 relative min-h-[300px] items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {view === "hours" ? (
                    <ClockFaceHours
                      value={hour}
                      onChange={(h) => {
                        setHour(h);
                        setView("minutes");
                      }}
                    />
                  ) : (
                    <ClockFaceMinutes value={minute} onChange={setMinute} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 flex justify-between items-center bg-zinc-900/30 border-t border-zinc-800/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                OK
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// --- Clock Face Subcomponents ---

const CLOCK_SIZE = 256;
const CENTER = CLOCK_SIZE / 2;
const RADIUS = 100;

function ClockFaceHours({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Order for mapping

  return (
    <div
      className="relative rounded-full bg-zinc-900/50 border border-zinc-800"
      style={{ width: CLOCK_SIZE, height: CLOCK_SIZE }}
    >
      {/* Center Dot */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />

      {/* Hand */}
      <ClockHand angle={(value % 12) * 30} />

      {/* Numbers */}
      {hours.map((h, i) => {
        const angle = i * 30 - 90; // -90 to start at 12
        const rad = (angle * Math.PI) / 180;
        const x = CENTER + RADIUS * Math.cos(rad);
        const y = CENTER + RADIUS * Math.sin(rad);

        const isSelected = value === h;

        return (
          <button
            key={h}
            className={cn(
              "absolute w-10 h-10 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-colors nav-item",
              isSelected
                ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                : "text-zinc-500 hover:text-white hover:bg-zinc-800",
            )}
            style={{ left: x, top: y }}
            onClick={() => onChange(h)}
          >
            {h}
          </button>
        );
      })}
    </div>
  );
}

function ClockFaceMinutes({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  // Show 5 minute intervals
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div
      className="relative rounded-full bg-zinc-900/50 border border-zinc-800"
      style={{ width: CLOCK_SIZE, height: CLOCK_SIZE }}
    >
      {/* Center Dot */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />

      {/* Hand */}
      <ClockHand angle={value * 6} />

      {/* Numbers */}
      {minutes.map((m, i) => {
        const angle = i * 30 - 90;
        const rad = (angle * Math.PI) / 180;
        const x = CENTER + RADIUS * Math.cos(rad);
        const y = CENTER + RADIUS * Math.sin(rad);

        const isSelected = value === m;

        return (
          <button
            key={m}
            className={cn(
              "absolute w-10 h-10 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-colors nav-item text-sm",
              isSelected
                ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                : "text-zinc-500 hover:text-white hover:bg-zinc-800",
            )}
            style={{ left: x, top: y }}
            onClick={() => onChange(m)}
          >
            {m.toString().padStart(2, "0")}
          </button>
        );
      })}

      {/* Transparent click handlers for in-between minutes could go here, but omitted for simplicity/cleanliness */}
    </div>
  );
}

function ClockHand({ angle }: { angle: number }) {
  // Correct angle for visual representation (0 degrees is typically 3 o'clock in CSS rotation, but we calculated based on 12 being -90)
  // Actually, `rotate` in CSS rotates from top if we set transform-origin correctly, OR from right if usage is default?
  // Let's position it at center and rotate.

  // We want 12 o'clock to be 0 degrees visually for the logic I used above?
  // Wait, in my loop: (i * 30) - 90.
  // i=0 (12) -> -90 deg.
  // CSS rotate(0deg) is usually pointing UP or RIGHT depending on element manually.
  // Let's make a line pointing UP from center, then rotate it.
  // If it points UP, then 12 is 0deg.
  // My calculation `(value % 12) * 30` implies 12=0, 1=30, 3=90.
  // This matches a standard clock where 12 is at the top.

  return (
    <div
      className="absolute top-1/2 left-1/2 w-[2px] bg-white origin-bottom z-0 pointer-events-none"
      style={{
        height: RADIUS,
        transform: `translate(-50%, -100%) rotate(${angle}deg)`,
        // transform-origin is bottom (center of clock)
      }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white" />
    </div>
  );
}
