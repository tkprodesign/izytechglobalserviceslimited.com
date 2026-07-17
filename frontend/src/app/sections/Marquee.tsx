const items = [
  "Solar Energy Systems",
  "Industrial Wiring",
  "Smart Home Automation",
  "CCTV & Security",
  "IT & Tech Services",
  "General Electrical",
  "Solar Energy Systems",
  "Industrial Wiring",
  "Smart Home Automation",
  "CCTV & Security",
  "IT & Tech Services",
  "General Electrical",
];

const Diamond = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0 }}>
    <rect x="4" y="0" width="5.66" height="5.66" transform="rotate(45 4 0)" fill="#F0A20E" />
  </svg>
);

export function Marquee() {
  return (
    <div className="w-full overflow-hidden border-y border-white/6" style={{ background: "#041627" }}>
      {/* Forward scroll */}
      <div className="py-3.5 overflow-hidden">
        <div
          className="flex gap-0 whitespace-nowrap"
          style={{ animation: "marquee-fwd 30s linear infinite", width: "max-content" }}
        >
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-5 px-7">
              <span
                className="text-white/30 text-[11px] font-bold tracking-[0.22em] uppercase"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                {item}
              </span>
              <Diamond />
            </span>
          ))}
        </div>
      </div>

      {/* Reverse scroll */}
      <div className="py-3.5 overflow-hidden border-t border-white/4">
        <div
          className="flex gap-0 whitespace-nowrap"
          style={{ animation: "marquee-rev 22s linear infinite", width: "max-content" }}
        >
          {[...items].reverse().map((item, i) => (
            <span key={i} className="inline-flex items-center gap-5 px-7">
              <Diamond />
              <span
                className="text-[#F0A20E]/25 text-[11px] font-bold tracking-[0.22em] uppercase"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                {item}
              </span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-fwd {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-rev {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
