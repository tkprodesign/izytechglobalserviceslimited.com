import { BadgeCheck, ClipboardCheck, MapPin, Wrench } from "lucide-react";

const trustItems = [
  { icon: BadgeCheck, title: "CAC Registered", detail: "RC 8705481" },
  { icon: MapPin, title: "Port Harcourt HQ", detail: "Rivers State, Nigeria" },
  { icon: Wrench, title: "6 Service Areas", detail: "Energy • Security • Technology" },
  { icon: ClipboardCheck, title: "Project Support", detail: "Enquiries & site assessments" },
];

export function TrustStrip() {
  return (
    <section aria-label="Company credentials" className="border-y border-[#e8edf3] bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-[#e8edf3] px-4 sm:px-6 lg:grid-cols-4 lg:divide-y-0">
        {trustItems.map(({ icon: Icon, title, detail }) => (
          <div key={title} className="flex min-h-[92px] items-center gap-3 px-3 py-5 sm:px-6">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0A20E]/10 text-[#d17f00]">
              <Icon size={17} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#041627] sm:text-sm" style={{ fontFamily: "var(--font-display)" }}>{title}</p>
              <p className="mt-1 text-[10px] leading-snug text-[#64748b] sm:text-xs" style={{ fontFamily: "var(--font-ui)" }}>{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
