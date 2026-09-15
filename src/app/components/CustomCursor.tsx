import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;
    let hovering = false;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) setVisible(true);
    };

    const addHoverListeners = () => {
      document.querySelectorAll("a, button, [role=button], input, textarea, select, label").forEach((el) => {
        el.addEventListener("mouseenter", () => { hovering = true; });
        el.addEventListener("mouseleave", () => { hovering = false; });
      });
    };

    document.addEventListener("mousemove", onMove);
    addHoverListeners();

    const loop = () => {
      dotX += (mouseX - dotX) * 0.85;
      dotY += (mouseY - dotY) * 0.85;
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;
        dotRef.current.style.opacity = hovering ? "0" : "1";
        dotRef.current.style.width = hovering ? "0px" : "8px";
      }
      if (ringRef.current) {
        const size = hovering ? 60 : 36;
        ringRef.current.style.transform = `translate(${ringX - size / 2}px, ${ringY - size / 2}px)`;
        ringRef.current.style.width = `${size}px`;
        ringRef.current.style.height = `${size}px`;
        ringRef.current.style.background = hovering ? "rgba(240,162,14,0.12)" : "transparent";
        ringRef.current.style.borderColor = hovering ? "#F0A20E" : "rgba(240,162,14,0.5)";
      }
      raf = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full"
        style={{
          width: 8,
          height: 8,
          background: "#F0A20E",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.2s, width 0.2s",
        }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full border-2"
        style={{
          width: 36,
          height: 36,
          borderColor: "rgba(240,162,14,0.5)",
          opacity: visible ? 1 : 0,
          transition: "width 0.35s cubic-bezier(.16,1,.3,1), height 0.35s cubic-bezier(.16,1,.3,1), border-color 0.3s, background 0.3s, opacity 0.2s",
        }}
      />
    </>
  );
}
