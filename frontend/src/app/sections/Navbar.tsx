import { useState, useEffect } from "react";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import logoIcon from "../../imports/izy-technologies_icon_v1.png";
import logoHorizontal from "../../imports/izy-technologies_logo-variation-horizontal_v1.png";

const navLinks = [
  { label: "Home", href: "#home" },
  {
    label: "Services",
    href: "#services",
    children: [
      { label: "Solar Energy Systems", href: "#solar" },
      { label: "Industrial Wiring", href: "#wiring" },
      { label: "Smart Home Automation", href: "#smarthome" },
      { label: "CCTV & Security", href: "#security" },
      { label: "IT & Tech Services", href: "#it" },
    ],
  },
  { label: "About Us", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isTransparent = !scrolled && !mobileOpen;

  return (
    <nav
      className={`w-full fixed top-0 z-50 transition-all duration-400 ${
        scrolled || mobileOpen
          ? "bg-white shadow-sm shadow-black/8 border-b border-black/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <a href="#home" className="flex-shrink-0 flex items-center gap-2.5">
          {isTransparent ? (
            <>
              <img src={logoIcon} alt="IZY" className="h-9 w-auto" />
              <div style={{ fontFamily: "var(--font-ui)" }}>
                <div className="text-white font-bold text-sm leading-tight tracking-wide">
                  IZY TECHNOLOGIES
                </div>
                <div className="text-white/50 text-[9px] tracking-[0.18em] uppercase leading-tight">
                  Global Services Limited
                </div>
              </div>
            </>
          ) : (
            <>
              <img src={logoIcon} alt="IZY" className="h-9 w-auto" />
              <div style={{ fontFamily: "var(--font-ui)" }}>
                <div className="text-[#041627] font-bold text-sm leading-tight tracking-wide">
                  IZY TECHNOLOGIES
                </div>
                <div className="text-[#041627]/40 text-[9px] tracking-[0.18em] uppercase leading-tight">
                  Global Services Limited
                </div>
              </div>
            </>
          )}
        </a>

        {/* Desktop links */}
        <div
          className="hidden lg:flex items-center gap-0.5"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} className="relative">
                <button
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
                    isTransparent
                      ? "text-white/75 hover:text-white"
                      : "text-[#0d1b2e]/65 hover:text-[#0d1b2e]"
                  }`}
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  {link.label}
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-[#e8edf3] py-1.5 transition-all duration-200 ${
                    servicesOpen
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 -translate-y-1 pointer-events-none"
                  }`}
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  {link.children.map((child) => (
                    <a
                      key={child.label}
                      href={child.href}
                      className="block px-4 py-2.5 text-sm text-[#0d1b2e]/65 hover:text-[#0d1b2e] hover:bg-[#f5f6f8] transition-colors"
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isTransparent
                    ? "text-white/75 hover:text-white"
                    : "text-[#0d1b2e]/65 hover:text-[#0d1b2e]"
                }`}
              >
                {link.label}
              </a>
            ),
          )}
        </div>

        {/* Right side: phone + CTA */}
        <div className="hidden lg:flex items-center gap-5">
          <a
            href="tel:+2348101262814"
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              isTransparent
                ? "text-white/55 hover:text-white/80"
                : "text-[#0d1b2e]/40 hover:text-[#C8971A]"
            }`}
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <Phone size={12} />
            +234 810 126 2814
          </a>
          <a
            href="#contact"
            className={`px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 ${
              isTransparent
                ? "bg-[#C8971A] text-[#041627]"
                : "bg-[#C8971A] text-[#041627]"
            }`}
            style={{ fontFamily: "var(--font-ui)", borderRadius: 0 }}
          >
            Get a Free Quote
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`lg:hidden p-2 transition-colors ${
            isTransparent
              ? "text-white/75 hover:text-white"
              : "text-[#0d1b2e]/60 hover:text-[#0d1b2e]"
          }`}
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="lg:hidden bg-white border-t border-[#e8edf3] px-6 pb-6 pt-3 space-y-0.5"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label}>
                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[#0d1b2e]/70 hover:text-[#0d1b2e]"
                >
                  {link.label}
                  <ChevronDown
                    size={13}
                    className={servicesOpen ? "rotate-180" : ""}
                  />
                </button>
                {servicesOpen && (
                  <div className="pl-4 mt-0.5 mb-1 space-y-0.5">
                    {link.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm text-[#0d1b2e]/55 hover:text-[#0d1b2e]"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-[#0d1b2e]/70 hover:text-[#0d1b2e]"
              >
                {link.label}
              </a>
            ),
          )}
          <div className="pt-3 space-y-2">
            <a
              href="tel:+2348101262814"
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#0d1b2e]/50"
            >
              <Phone size={14} />
              +234 810 126 2814
            </a>
            <a
              href="#contact"
              className="block text-center px-5 py-3 text-sm font-semibold text-[#041627]"
              style={{ background: "#C8971A", borderRadius: 0 }}
              onClick={() => setMobileOpen(false)}
            >
              Get a Free Quote
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
