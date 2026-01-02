"use client";
import React, {
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
  useEffect,
} from "react";
import { gsap } from "gsap";
import { useNavigate } from "@/hooks/useNavigate";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);

  const textInnerRef = useRef<HTMLSpanElement | null>(null);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Timeline | null>(null);
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null);

  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);

  const menuItems = [
    { label: "EVENTS", link: "/events" },
    { label: "RESIDENCE", link: "/residence" },
    { label: "MERCH", link: "/merch" },
    { label: "PARTNERS", link: "/partners" },
    { label: "CORE", link: "/core" },
    { label: "CONTACTS", link: "/contacts" },
    { label: "CART", link: "/user/cart" },
    { label: "ACCOUNT", link: "/user/account" },
  ];

  const colors = ["#D5812A", "#B8721F", "#9A5F1A"];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;

      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(
          preContainer.querySelectorAll(".mm-prelayer")
        ) as HTMLElement[];
      }
      preLayerElsRef.current = preLayers;

      gsap.set([panel, ...preLayers], { xPercent: 100 });
      gsap.set(plusH, { transformOrigin: "50% 50%", rotate: 0 });
      gsap.set(plusV, { transformOrigin: "50% 50%", rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" });
      gsap.set(textInner, { yPercent: 0 });
      if (toggleBtnRef.current)
        gsap.set(toggleBtnRef.current, { color: "#fff" });
    });
    return () => ctx.revert();
  }, []);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();

    const itemEls = Array.from(
      panel.querySelectorAll(".mm-panel-itemLabel")
    ) as HTMLElement[];
    const numberEls = Array.from(
      panel.querySelectorAll(".mm-panel-list[data-numbering] .mm-panel-item")
    ) as HTMLElement[];

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    if (numberEls.length)
      gsap.set(numberEls, { ["--mm-num-opacity" as any]: 0 });

    const tl = gsap.timeline({ paused: true });

    layers.forEach((el, i) => {
      tl.fromTo(
        el,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.5, ease: "power4.out" },
        i * 0.07
      );
    });

    const lastTime = layers.length ? (layers.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layers.length ? 0.08 : 0);

    tl.fromTo(
      panel,
      { xPercent: 100 },
      { xPercent: 0, duration: 0.65, ease: "power4.out" },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStart = panelInsertTime + 0.65 * 0.15;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: "power4.out",
          stagger: 0.1,
        },
        itemsStart
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: "power2.out",
            ["--mm-num-opacity" as any]: 1,
            stagger: 0.08,
          },
          itemsStart + 0.1
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback("onComplete", () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all: HTMLElement[] = [...layers, panel];
    closeTweenRef.current?.kill();

    closeTweenRef.current = gsap.to(all, {
      xPercent: 100,
      duration: 0.32,
      ease: "power3.in",
      onComplete: () => {
        busyRef.current = false;
        onClose();
      },
    });
  }, [onClose]);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    const h = plusHRef.current;
    const v = plusVRef.current;
    if (!icon || !h || !v) return;

    spinTweenRef.current?.kill();

    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" });
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .to(h, { rotate: 45, duration: 0.5 }, 0)
        .to(v, { rotate: -45, duration: 0.5 }, 0);
    } else {
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: "power3.inOut" } })
        .to(h, { rotate: 0, duration: 0.35 }, 0)
        .to(v, { rotate: 90, duration: 0.35 }, 0);
    }
  }, []);

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current;
    if (!inner) return;

    textCycleAnimRef.current?.kill();

    const cycles = 3;

    gsap.set(inner, { yPercent: 0 });
  }, []);

  const handleToggle = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) {
      playOpen();
    } else {
      playClose();
    }

    animateIcon(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateText]);

  const handleItemClick = (link: string) => {
    navigate(link);
    handleToggle();
  };

  useEffect(() => {
    if (isOpen && !openRef.current) {
      handleToggle();
    } else if (!isOpen && openRef.current) {
      handleToggle();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        handleToggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, handleToggle]);

  if (!isOpen && !open) return null;

  return (
    <div className="fixed inset-0 z-100 pointer-events-none">
      <div className="relative w-full h-full">
        {/* Background Layers */}
        <div
          ref={preLayersRef}
          className="absolute top-0 right-0 bottom-0 w-full pointer-events-none z-5"
        >
          {colors.map((c, i) => (
            <div
              key={i}
              className="mm-prelayer absolute top-0 right-0 h-full w-full"
              style={{ background: c }}
            />
          ))}
        </div>

        {/* Main Menu Panel */}
        <aside
          ref={panelRef}
          className="absolute top-0 right-0 w-full h-full bg-linear-to-br from-amber-900/95 to-amber-950/95 backdrop-blur-xl flex flex-col p-8 pt-32 overflow-y-auto z-10 pointer-events-auto"
        >
          {/* Close Button */}
          <button
            ref={toggleBtnRef}
            onClick={handleToggle}
            className="fixed top-8 right-8 z-120 flex cursor-pointer items-center gap-3 text-white font-bold text-xl tracking-wide"
            style={{ fontFamily: "Montserrat" }}
          >
            <span
              ref={textInnerRef}
              className="flex flex-col h-[1em] overflow-hidden leading-none"
            >
              close
            </span>
            <span
              ref={iconRef}
              className="relative w-4 h-4 flex items-center justify-center"
            >
              <span
                ref={plusHRef}
                className="absolute w-full h-0.5 bg-current rounded-full"
              />
              <span
                ref={plusVRef}
                className="absolute w-full h-0.5 bg-current rounded-full"
              />
            </span>
          </button>

          {/* Menu Items */}
          <ul className="mm-panel-list flex flex-col gap-6 mt-8" data-numbering>
            {menuItems.map((item, idx) => (
              <li key={item.label} className="relative overflow-hidden">
                <button
                  onClick={() => handleItemClick(item.link)}
                  className="mm-panel-item relative text-white cursor-pointer font-bold text-3xl sm:text-5xl uppercase tracking-tight w-full text-left hover:text-amber-300 transition-colors duration-300 pr-20"
                  data-index={idx + 1}
                  style={{ fontFamily: "Montserrat" }}
                >
                  <span className="mm-panel-itemLabel inline-block">
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <style>{`
        .mm-prelayer { 
          transform: translateX(100%); 
        }
        .mm-panel-list[data-numbering] { 
          counter-reset: mmItem; 
        }
        .mm-panel-list[data-numbering] .mm-panel-item::after {
          counter-increment: mmItem;
          content: counter(mmItem, decimal-leading-zero);
          position: absolute;
          top: 0.2em;
          right: 0.5em;
          font-size: 20px;
          font-weight: 400;
          color: #D5812A;
          letter-spacing: 0;
          pointer-events: none;
          user-select: none;
          opacity: var(--mm-num-opacity, 0);
        }
        .mm-panel-itemLabel {
          transform-origin: 50% 100%;
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default MobileMenu;
