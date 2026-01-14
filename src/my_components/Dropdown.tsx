"use client";

import { useState, useRef, MouseEvent } from "react";

type GenderValue = "MALE" | "FEMALE" | "OTHER";

interface Gender {
  value: GenderValue;
  label: string;
  icon: string;
}

const genders: Gender[] = [
  {
    value: "MALE",
    label: "Male",
    icon: "M9.5 2a.5.5 0 0 1 0-1h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V2.707L9.871 6.836a5 5 0 1 1-.707-.707L13.293 2H9.5zM6 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  },
  {
    value: "FEMALE",
    label: "Female",
    icon: "M8 1a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM3 5a5 5 0 1 1 5.5 4.975V12h2a.5.5 0 0 1 0 1h-2v2.5a.5.5 0 0 1-1 0V13h-2a.5.5 0 0 1 0-1h2V9.975A5 5 0 0 1 3 5z",
  },
  {
    value: "OTHER",
    label: "Other",
    icon: "M8 1a.5.5 0 0 1 .5.5v6h6a.5.5 0 0 1 0 1h-6v6a.5.5 0 0 1-1 0v-6h-6a.5.5 0 0 1 0-1h6v-6A.5.5 0 0 1 8 1z",
  },
];

const ICON_SIZE = 26;

interface GenderDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function GenderDropdown({
  value,
  onChange,
}: GenderDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<GenderValue>(
    (value as GenderValue) || "MALE"
  );
  const [hoverIndex, setHoverIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const listRef = useRef<HTMLUListElement | null>(null);

  const selectedGender = genders.find((g) => g.value === selected)!;

  const handleMouseMove = (e: MouseEvent<HTMLUListElement>) => {
    if (!listRef.current) return;
    const rect = listRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left - ICON_SIZE / 2,
      y: e.clientY - rect.top - ICON_SIZE / 2,
    });
  };

  const handleSelect = (gender: GenderValue) => {
    setSelected(gender);
    setIsOpen(false);
    if (onChange) {
      onChange(gender);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center inherit">
      <div className="w-full h-full">
        {/* Label */}
        <label className="block text-white text-sm mb-3">Gender</label>

        {/* Main button */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className={`
            flex items-center w-full h-fit px-2.5 py-2 rounded-[14px]
            bg-[#333740] border transition-all duration-300 ease-[cubic-bezier(.25,.46,.45,.94)]
            ${
              isOpen
                ? "border-[#ffffff] text-white shadow-[0_0_0_2px_rgba(44,98,246,0.4)]"
                : "border-[#494d59] text-[#b1b8ca] hover:text-white"
            }
          `}
        >
          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current">
            <path d={selectedGender.icon} />
          </svg>

          <span className="ml-[18px] flex-1 text-sm capitalize truncate text-left">
            {selectedGender.label}
          </span>

          <svg
            viewBox="0 0 16 16"
            className={`w-4 h-4 fill-current transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
          </svg>
        </button>

        {/* Dropdown */}
        <div
          className={`overflow-hidden absolute w-1/3 z-10  transition-[max-height] duration-300 ${
            isOpen ? "max-h-[250px]" : "max-h-0"
          }`}
        >
          <div className="relative mt-2 p-2 bg-[#333740] border border-[#494d59] rounded-[14px]">
            <ul
              ref={listRef}
              onMouseMove={handleMouseMove}
              className="relative"
            >
              {/* Hover background */}
              <div
                className="absolute left-0 right-0 h-[46px] bg-[#2b2e34] rounded-[14px] transition-transform duration-300 pointer-events-none"
                style={{ transform: `translateY(${hoverIndex * 46}px)` }}
              />

              {genders.map((g, i) => (
                <li
                  key={g.value}
                  onMouseEnter={() => setHoverIndex(i)}
                  className="relative z-10"
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(g.value)}
                    className="flex items-center w-full h-[46px] px-[18px] text-sm text-[#b1b8ca] hover:text-white transition-colors"
                  >
                    {g.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Floating icon */}
            <div
              className={`absolute flex items-center justify-center rounded-[10px] bg-[#494d59] pointer-events-none transition-opacity duration-300
                ${isOpen ? "opacity-100" : "opacity-0"}
              `}
              style={{
                width: ICON_SIZE,
                height: ICON_SIZE,
                top: mousePos.y,
                left: mousePos.x,
              }}
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4 fill-white">
                <path d={genders[hoverIndex].icon} />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
