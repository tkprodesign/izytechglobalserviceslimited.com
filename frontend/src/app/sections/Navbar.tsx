import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import logoIcon from "../../imports/izy-technologies_icon_v1.png";

type NavChild = { label: string; to?: string; href?: string };
type NavLink = {
  label: string;
  to?: string;
  href?: string;
  children?: NavChild[];
};

const navLinks: NavLink[] = [
  { label: "Home",         to: "/" },
  {
    label: "Services",
    to: "/services",
    children: [
      { label: "Solar Energy Systems",    to: "/services" },
      { label: "Industrial Wiring",       to: "/services" },
      { label: "Smart Home Automation",   to: "/services" },
      { label: "CCTV & Security",         to: "/services" },
      { label: "IT & Tech Services",      to: "/services" },
    ],
  },
  { label: "About Us",     to: "/about" },
  { label: "Projects",     to: "/projects" },
  { label: "Store",        to: "/store" },
  { label: "Testimonials", to: "/testimonials" },
  { label: "Contact",      to: "/contact" },
];

function NavItem({
  link,
  isTransparent,
  onClick,
}: {
  link: NavLink;
  isTransparent: boolean;
  onClick?: () => void;
}) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const baseText = isTransparent
    ? "text-white/75 hover:text-white"
    : "text-[#0d1b2e]/65 hover:text-[#0d1b2e]";

  const isActive = link.to
    ? link.to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(link.to)
    : false;

  const activeText = isTransparent ? "text-white font-semibold" : "text-[#0d1b2e] font-semibold";
  const activeClass = isActive ? activeText : "";

  if (link.children) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Link
          to={link.to ?? "/services"}
          className={`relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${baseText} ${activeClass}`}
        >
          {link.label}
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
          {isActive && (
            <span
              className="absolute bottom-0 left-4 right-4 h-[2px]"
              style={{ background: "#F0A20E", borderRadius: 1 }}
            />
          )}
        </Link>
        <div
          className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-[#e8edf3] py-1.5 transition-all duration-200 ${
            open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
        >
          {link.children.map((child) =>
            child.to ? (
              <Link
                key={child.label}
                to={child.to}
                className="block px-4 py-2.5 text-sm text-[#0d1b2e]/65 hover:text-[#0d1b2e] hover:bg-[#f5f6f8] transition-colors"
                onClick={onClick}
              >
                {child.label}
              </Link>
            ) : (
              <a
                key={child.label}
                href={child.href}
                className="block px-4 py-2.5 text-sm text-[#0d1b2e]/65 hover:text-[#0d1b2e] hover:bg-[#f5f6f8] transition-colors"
                onClick={onClick}
              >
                {child.label}
              </a>
            )
          )}
        </div>
      </div>
    );
  }

  if (link.to) {
    return (
      <Link
        to={link.to}
        className={`relative px-4 py-2 text-sm font-medium transition-colors ${baseText} ${activeClass}`}
        onClick={() => {
          if (link.to === "/") window.scrollTo({ top: 0, behavior: "instant" });
          onClick?.();
        }}
      >
        {link.label}
        {isActive && (
          <span
            className="absolute bottom-0 left-4 right-4 h-[2px]"
            style={{ background: "#F0A20E", borderRadius: 1 }}
          />
        )}
      </Link>
    );
  }

  return (
    <a
      href={link.href}
      className={`px-4 py-2 text-sm font-medium transition-colors ${baseText}`}
      onClick={onClick}
    >
      {link.label}
    </a>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const location = useLocation();

  // Only show transparent on home page before scroll
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
  }, [location.pathname]);

  const isTransparent = isHome && !scrolled && !mobileOpen;

  return (
    <nav
      className={`w-full fixed top-0 z-50 transition-all duration-400 ${
        scrolled || mobileOpen || !isHome
          ? "bg-white shadow-sm shadow-black/8 border-b border-black/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })} className="flex-shrink-0 flex items-center gap-2.5">
          <img src={logoIcon} alt="IZY" className="h-9 w-auto" />
          <div style={{ fontFamily: "var(--font-ui)" }}>
            <div className={`whitespace-nowrap font-bold text-sm leading-tight tracking-wide ${isTransparent ? "text-white" : "text-[#041627]"}`}>
              IZY TECHNOLOGIES
            </div>
            <div className={`text-[9px] tracking-[0.18em] uppercase leading-tight ${isTransparent ? "text-white/50" : "text-[#041627]/40"}`}>
              Global Services Limited
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-0.5" style={{ fontFamily: "var(--font-ui)" }}>
          {navLinks.map((link) => (
            <NavItem key={link.label} link={link} isTransparent={isTransparent} />
          ))}
        </div>

        {/* Right: phone + CTA */}
        <div className="hidden lg:flex items-center gap-5">
          <a
            href="tel:+2348101262814"
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              isTransparent ? "text-white/55 hover:text-white/80" : "text-[#0d1b2e]/40 hover:text-[#C8971A]"
            }`}
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <Phone size={12} />
            +234 810 126 2814
          </a>
          <a
            href="/#contact"
            className="px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 bg-[#C8971A] text-[#041627]"
            style={{ fontFamily: "var(--font-ui)", borderRadius: 0 }}
          >
            Get a Free Quote
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`lg:hidden p-2 transition-colors ${
            isTransparent ? "text-white/75 hover:text-white" : "text-[#0d1b2e]/60 hover:text-[#0d1b2e]"
          }`}
          aria-label="Toggle menu"
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
                  onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[#0d1b2e]/70 hover:text-[#0d1b2e]"
                >
                  {link.label}
                  <ChevronDown size={13} className={mobileServicesOpen ? "rotate-180" : ""} />
                </button>
                {mobileServicesOpen && (
                  <div className="pl-4 mt-0.5 mb-1 space-y-0.5">
                    {link.children.map((child) =>
                      child.to ? (
                        <Link
                          key={child.label}
                          to={child.to}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-sm text-[#0d1b2e]/55 hover:text-[#0d1b2e]"
                        >
                          {child.label}
                        </Link>
                      ) : (
                        <a
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-sm text-[#0d1b2e]/55 hover:text-[#0d1b2e]"
                        >
                          {child.label}
                        </a>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : link.to ? (
              (() => {
                const active = link.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 text-sm font-medium transition-colors border-l-2 ${
                      active
                        ? "border-[#F0A20E] text-[#0d1b2e] font-semibold bg-[#F0A20E]/6"
                        : "border-transparent text-[#0d1b2e]/70 hover:text-[#0d1b2e]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })()
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium border-l-2 border-transparent text-[#0d1b2e]/70 hover:text-[#0d1b2e]"
              >
                {link.label}
              </a>
            )
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
              href="/#contact"
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
