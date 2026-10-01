import { useEffect, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  ArrowRight,
  Linkedin,
  Youtube,
  Send,
} from "lucide-react";
import { Link } from "react-router";
import logoIcon from "../../imports/izy-technologies_icon_v1.png";
import { api } from "../../lib/api";
import { PhoneActions } from "../components/PhoneActions";
import { COMPANY_PHONE_DISPLAY, COMPANY_PHONE_TEL } from "../data/contactChannels";
import { formatCompanyAddress, useCompanyContact } from "../hooks/useCompanyContact";

const services = [
  { label: "Solar Energy Systems", slug: "service-solar" },
  { label: "Industrial Wiring", slug: "service-industrial" },
  { label: "Smart Home Automation", slug: "service-smartHome" },
  { label: "CCTV & Surveillance", slug: "service-security" },
  { label: "Access Control & Intercom", slug: "service-accessControl" },
  { label: "Maintenance & Upgrades", slug: "service-maintenance" },
];

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Projects", href: "/projects" },
  { label: "Store", href: "/store" },
  { label: "Get a Quote", href: "/contact" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Emergency Service", href: "tel:+2348101262814" },
];

const SOCIAL_ICONS: Record<string, { Icon: React.ElementType; label: string }> = {
  facebook: { Icon: Facebook, label: "Facebook" },
  instagram: { Icon: Instagram, label: "Instagram" },
  whatsapp: { Icon: MessageCircle, label: "WhatsApp" },
  x: { Icon: Twitter, label: "X" },
  linkedin: { Icon: Linkedin, label: "LinkedIn" },
  youtube: { Icon: Youtube, label: "YouTube" },
  telegram: { Icon: Send, label: "Telegram" },
};

export function Footer() {
  const [socials, setSocials] = useState<
    { Icon: React.ElementType; href: string; label: string }[]
  >([]);
  const companyContact = useCompanyContact();

  useEffect(() => {
    api
      .socials()
      .then(({ platforms }) => {
        const entries = platforms
          .filter((p) => p.enabled && p.url.trim())
          .map((p) => ({
            ...(SOCIAL_ICONS[p.key] ?? {
              Icon: MessageCircle,
              label: p.key,
            }),
            href: p.url,
          }));
        setSocials(entries);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="text-white" style={{ background: "#030e1a" }}>
      {/* Project enquiry CTA */}
      <div className="border-b border-white/10" style={{ background: "#041627" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-9 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span
                className="text-[11px] font-semibold tracking-[0.18em] uppercase"
                style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
              >
                Project enquiries & site assessment
              </span>
            </div>
            <h3
              className="text-white text-[1.45rem] sm:text-3xl font-extrabold tracking-[-0.025em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Tell us what your project needs.
            </h3>
            <p
              className="mt-2 text-sm leading-6 text-white/60"
              style={{ fontFamily: "var(--font-body)" }}
            >
              From new installations to upgrades and maintenance, our team can help you plan the right solution.
            </p>
          </div>

          <a
            href="#quote-form"
            className="inline-flex w-fit items-center gap-3 px-6 py-3.5 font-bold text-[#041627] text-xs tracking-[0.08em] transition-transform hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #F0A20E 0%, #FFB830 100%)",
              fontFamily: "var(--font-ui)",
            }}
          >
            START AN ENQUIRY <ArrowRight size={15} strokeWidth={2.5} />
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr_1fr_1.25fr] lg:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img src={logoIcon} alt="Izy Technologies Global Services Limited" className="h-10 w-auto" />
              <div style={{ fontFamily: "var(--font-ui)" }}>
                <div className="whitespace-nowrap text-white font-bold text-sm leading-tight tracking-wide">
                  IZY TECHNOLOGIES
                </div>
                <div className="text-white/55 text-[9px] tracking-[0.18em] uppercase leading-tight mt-0.5">
                  Global Services Limited
                </div>
              </div>
            </div>

            <p
              className="mt-4 max-w-sm text-sm leading-6 text-white/60"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Energy, electrical and security solutions for homes, businesses and industries.
            </p>

            {socials.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/65 hover:text-[#F0A20E] hover:border-[#F0A20E]/50 transition-colors"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Mobile-friendly links */}
          <div>
            <h4
              className="text-white/85 mb-4 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              Quick Links
            </h4>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-3 lg:grid-cols-1">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4
              className="text-white/85 mb-4 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              Services
            </h4>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-3 lg:grid-cols-1">
              {services.map((service) => (
                <li key={service.label}>
                  <Link
                    to={`/services#${service.slug}`}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-white/85 mb-4 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              Contact
            </h4>

            <div className="space-y-4">
              <a
                href="mailto:info@izytechglobalservices.com"
                className="flex items-start gap-3 text-white/60 hover:text-white transition-colors"
              >
                <Mail size={16} className="mt-0.5 shrink-0 text-white/45" />
                <span className="text-sm break-all" style={{ fontFamily: "var(--font-body)" }}>
                  info@izytechglobalservices.com
                </span>
              </a>

              <div className="flex items-start gap-3 text-white/60">
                <Phone size={16} className="mt-0.5 shrink-0 text-white/45" />
                <div>
                  <a
                    href={COMPANY_PHONE_TEL}
                    className="text-sm hover:text-white transition-colors"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {COMPANY_PHONE_DISPLAY}
                  </a>
                  <PhoneActions dark className="mt-2" />
                </div>
              </div>

              <div className="flex items-start gap-3 text-white/60">
                <MapPin size={16} className="mt-0.5 shrink-0 text-white/45" />
                <div>
                  <p className="text-sm leading-6" style={{ fontFamily: "var(--font-body)" }}>
                    {formatCompanyAddress(companyContact)}
                  </p>
                  <span
                    className="inline-flex mt-2 rounded-full border border-[#40b93c]/30 bg-[#40b93c]/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase text-[#79d875]"
                    style={{ fontFamily: "var(--font-ui)" }}
                  >
                    Nationwide Coverage
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar — no repeated tagline */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-5">
          <p
            className="text-white/45 text-[11px] sm:text-xs leading-5"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            © {new Date().getFullYear()} Izy Technologies Global Services Limited. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
