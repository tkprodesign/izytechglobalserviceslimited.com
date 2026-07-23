import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, MessageCircle, ArrowRight } from "lucide-react";
import logoIcon from "../../imports/izy-technologies_icon_v1.png";
import logoHorizontal from "../../imports/izy-technologies_logo-variation-horizontal_v1.png";
import { api, type SocialLinks } from "../../lib/api";

const services = [
  "Solar Energy Systems",
  "Industrial Wiring",
  "Smart Home Automation",
  "CCTV & Security",
  "IT & Tech Services",
  "General Electrical",
];

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Projects", href: "/projects" },
  { label: "Store", href: "/store" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Get a Quote", href: "/contact" },
  { label: "Emergency Service", href: "tel:+2348101262814" },
];

import { Linkedin, Youtube, Send } from "lucide-react";

const SOCIAL_ICONS: Record<string, { Icon: React.ElementType; label: string }> = {
  facebook:  { Icon: Facebook,      label: "Facebook" },
  instagram: { Icon: Instagram,     label: "Instagram" },
  whatsapp:  { Icon: MessageCircle, label: "WhatsApp" },
  x:         { Icon: Twitter,       label: "X" },
  linkedin:  { Icon: Linkedin,      label: "LinkedIn" },
  youtube:   { Icon: Youtube,       label: "YouTube" },
  telegram:  { Icon: Send,          label: "Telegram" },
};

export function Footer() {
  const [socials, setSocials] = useState<{ Icon: React.ElementType; href: string; label: string }[]>([]);

  useEffect(() => {
    api.socials().then(({ platforms }) => {
      const entries = platforms
        .filter(p => p.enabled && p.url.trim())
        .map(p => ({ ...(SOCIAL_ICONS[p.key] ?? { Icon: MessageCircle, label: p.key }), href: p.url }));
      setSocials(entries);
    }).catch(() => {});
  }, []);

  return (
    <footer style={{ background: "#030e1a" }}>
      {/* Full-bleed CTA band */}
      <div
        className="relative overflow-hidden border-b border-white/6"
        style={{ background: "#041627" }}
      >
        {/* Decorative large text */}
        <div
          className="absolute inset-y-0 right-0 text-white/[0.025] select-none pointer-events-none flex items-center"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(5rem, 14vw, 14rem)",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            lineHeight: 1,
          }}
        >
          IZY
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Ready to begin?
              </span>
            </div>
            <h3
              className="text-white mb-2"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
              }}
            >
              Ready to Power Your Future?
            </h3>
            <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              Join 500+ satisfied clients across Nigeria. Get your free consultation today.
            </p>
          </div>
          <a
            href="#contact"
            className="btn-shimmer flex-shrink-0 inline-flex items-center gap-3 px-9 py-4 font-bold text-[#041627] text-sm tracking-wider transition-all hover:shadow-[0_8px_32px_rgba(240,162,14,0.5)] hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #F0A20E 0%, #FFB830 100%)",
              fontFamily: "var(--font-ui)",
              letterSpacing: "0.08em",
            }}
          >
            GET A FREE QUOTE <ArrowRight size={15} strokeWidth={2.5} />
          </a>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-5">
            <img src={logoIcon} alt="IZY" className="h-9 w-auto" />
            <div style={{ fontFamily: "var(--font-ui)" }}>
              <div className="whitespace-nowrap text-white font-bold text-sm leading-tight tracking-wide">IZY TECHNOLOGIES</div>
              <div className="text-white/30 text-[9px] tracking-[0.18em] uppercase leading-tight">Global Services Limited</div>
            </div>
          </div>
          <p className="text-white/35 text-sm leading-relaxed mb-6" style={{ fontFamily: "var(--font-body)" }}>
            Nigeria's premier technology and energy services company. Powering homes, businesses and industries since 2018.
          </p>
          <div className="flex gap-2">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/30 hover:text-[#F0A20E] hover:border-[#F0A20E]/30 transition-all"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-white/60 mb-5 text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "var(--font-ui)" }}>
            Our Services
          </h4>
          <ul className="space-y-3">
            {services.map((s) => (
              <li key={s}>
                <a
                  href="#services"
                  className="text-white/35 hover:text-white/65 text-sm transition-colors hover:translate-x-1 inline-block"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white/60 mb-5 text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "var(--font-ui)" }}>
            Quick Links
          </h4>
          <ul className="space-y-3">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-white/35 hover:text-white/65 text-sm transition-colors hover:translate-x-1 inline-block"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white/60 mb-5 text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "var(--font-ui)" }}>
            Contact
          </h4>
          <ul className="space-y-4">
            {[
              { href: "tel:+2348101262814", Icon: Phone, text: "+234 810 126 2814" },
              { href: "mailto:info@izytechglobalservices.com", Icon: Mail, text: "info@izytechglobalservices.com" },
            ].map(({ href, Icon, text }) => (
              <li key={text}>
                <a href={href} className="flex items-start gap-3 text-white/35 hover:text-[#F0A20E] transition-colors group">
                  <Icon size={14} className="mt-0.5 flex-shrink-0" />
                  <span className="text-sm" style={{ fontFamily: "var(--font-body)" }}>{text}</span>
                </a>
              </li>
            ))}
            <li>
              <div className="flex items-start gap-3 text-white/35">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm" style={{ fontFamily: "var(--font-body)" }}>
                  Port Harcourt, Rivers State<br />Nationwide Coverage
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 px-6 py-5 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-ui)" }}>
          © {new Date().getFullYear()} <span className="whitespace-nowrap">Izy Technologies</span> Global Services Limited. All rights reserved.
        </p>
        <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-ui)" }}>
          Powering Nigeria, One Project at a Time.
        </p>
      </div>
    </footer>
  );
}
