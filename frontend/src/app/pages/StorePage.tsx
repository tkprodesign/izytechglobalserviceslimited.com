import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, ArrowRight, Tag, Zap, Sun, Shield, Home, Cpu, Filter, Star } from "lucide-react";
import { Link } from "react-router";
import { PageLayout } from "../components/PageLayout";

type Product = {
  id: number;
  name: string;
  category: string;
  tag: string;
  price: number;
  originalPrice?: number;
  unit: string;
  description: string;
  badge?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
};

const products: Product[] = [
  // Solar
  {
    id: 1,
    name: "400W Monocrystalline Solar Panel",
    category: "Solar",
    tag: "Solar",
    price: 185000,
    unit: "per panel",
    description: "High-efficiency mono panel with 25-year performance warranty. Ideal for residential and commercial rooftop installations.",
    badge: "BESTSELLER",
    rating: 5,
    reviews: 48,
    inStock: true,
    featured: true,
  },
  {
    id: 2,
    name: "550W Bifacial Solar Panel",
    category: "Solar",
    tag: "Solar",
    price: 265000,
    unit: "per panel",
    description: "Dual-sided bifacial cell technology captures reflected light for up to 30% more energy output. Perfect for large commercial arrays.",
    rating: 5,
    reviews: 21,
    inStock: true,
  },
  // Inverters
  {
    id: 3,
    name: "5kVA Hybrid Solar Inverter",
    category: "Inverters",
    tag: "Inverters",
    price: 320000,
    originalPrice: 365000,
    unit: "per unit",
    description: "All-in-one hybrid inverter with built-in MPPT charge controller. Supports grid-tie, off-grid and battery backup modes.",
    badge: "SALE",
    rating: 5,
    reviews: 33,
    inStock: true,
    featured: true,
  },
  {
    id: 4,
    name: "10kVA Three-Phase Inverter",
    category: "Inverters",
    tag: "Inverters",
    price: 680000,
    unit: "per unit",
    description: "Industrial-grade three-phase inverter for factories, hospitals and commercial buildings with 24/7 critical loads.",
    rating: 4,
    reviews: 12,
    inStock: true,
  },
  // Batteries
  {
    id: 5,
    name: "200Ah Lithium LiFePO4 Battery",
    category: "Batteries",
    tag: "Batteries",
    price: 450000,
    unit: "per unit",
    description: "Lithium iron phosphate battery with 6,000+ cycle life. Lightweight, safe and virtually maintenance-free.",
    badge: "NEW",
    rating: 5,
    reviews: 19,
    inStock: true,
    featured: true,
  },
  {
    id: 6,
    name: "100Ah AGM Deep Cycle Battery",
    category: "Batteries",
    tag: "Batteries",
    price: 95000,
    unit: "per unit",
    description: "Sealed AGM deep cycle battery, ideal for solar backup systems. Spill-proof, vibration-resistant and reliable.",
    rating: 4,
    reviews: 37,
    inStock: true,
  },
  // Security
  {
    id: 7,
    name: "4-Channel 4K CCTV Kit",
    category: "Security",
    tag: "Security",
    price: 145000,
    unit: "per kit",
    description: "Complete kit with 4× 4K outdoor cameras, 4-channel NVR, 1TB HDD and all cables. Night vision up to 30m.",
    badge: "POPULAR",
    rating: 5,
    reviews: 55,
    inStock: true,
    featured: true,
  },
  {
    id: 8,
    name: "Smart Wi-Fi Video Doorbell",
    category: "Security",
    tag: "Security",
    price: 38000,
    unit: "per unit",
    description: "1080p HD doorbell with two-way audio, motion alerts and cloud recording. Works with any smartphone.",
    rating: 4,
    reviews: 26,
    inStock: true,
  },
  // Smart Home
  {
    id: 9,
    name: "Smart Home Starter Pack",
    category: "Smart Home",
    tag: "Smart Home",
    price: 78000,
    unit: "per pack",
    description: "4 smart switches + Zigbee hub + app control. Turn any home smart — works with Alexa, Google Home and Apple HomeKit.",
    badge: "NEW",
    rating: 5,
    reviews: 14,
    inStock: true,
    featured: true,
  },
  {
    id: 10,
    name: "50W Smart LED Flood Light",
    category: "Smart Home",
    tag: "Smart Home",
    price: 22000,
    unit: "per unit",
    description: "App-controlled outdoor flood light with colour temperature adjustment, scheduling and motion trigger.",
    rating: 4,
    reviews: 8,
    inStock: false,
  },
  // Electrical
  {
    id: 11,
    name: "6-Outlet Surge Protector Strip",
    category: "Electrical",
    tag: "Electrical",
    price: 12500,
    unit: "per unit",
    description: "Heavy-duty surge protector with 6 outlets, 2 USB ports and 2500 joule protection rating. 3-metre cable.",
    rating: 4,
    reviews: 62,
    inStock: true,
  },
  {
    id: 12,
    name: "63A Automatic Transfer Switch",
    category: "Electrical",
    tag: "Electrical",
    price: 48000,
    unit: "per unit",
    description: "Automatic changeover switch that seamlessly transfers between mains and generator power. Suitable for homes and offices.",
    rating: 5,
    reviews: 29,
    inStock: true,
    featured: true,
  },
];

const ALL_CATS = ["All", "Solar", "Inverters", "Batteries", "Security", "Smart Home", "Electrical"];

const CAT_ICONS: Record<string, React.ElementType> = {
  Solar: Sun,
  Inverters: Zap,
  Batteries: Zap,
  Security: Shield,
  "Smart Home": Home,
  Electrical: Cpu,
  All: Filter,
};

const CAT_COLORS: Record<string, string> = {
  Solar: "#F0A20E",
  Inverters: "#3B82F6",
  Batteries: "#10B981",
  Security: "#EF4444",
  "Smart Home": "#8B5CF6",
  Electrical: "#F59E0B",
};

function formatPrice(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          fill={i < n ? "#F0A20E" : "transparent"}
          style={{ color: i < n ? "#F0A20E" : "#d1d5db" }}
        />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const color = CAT_COLORS[product.tag] ?? "#F0A20E";
  const Icon = CAT_ICONS[product.tag] ?? Zap;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="bg-white border border-gray-100 group flex flex-col overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-300"
    >
      {/* Image placeholder */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: 200, background: `${color}0d` }}
      >
        {/* Badge */}
        {product.badge && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold tracking-widest text-white"
            style={{ background: product.badge === "SALE" ? "#EF4444" : product.badge === "NEW" ? "#10B981" : "#041627", fontFamily: "var(--font-ui)" }}
          >
            {product.badge}
          </span>
        )}
        {!product.inStock && (
          <span
            className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold tracking-widest text-white"
            style={{ background: "#94a3b8", fontFamily: "var(--font-ui)" }}
          >
            OUT OF STOCK
          </span>
        )}
        {/* Category icon as visual */}
        <Icon size={56} style={{ color: `${color}55` }} strokeWidth={1} />
        {/* Category pill */}
        <span
          className="absolute bottom-3 right-3 text-[10px] font-bold tracking-wide px-2.5 py-1"
          style={{ background: `${color}18`, color, fontFamily: "var(--font-ui)" }}
        >
          {product.tag}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3
          className="text-[#041627] font-bold leading-snug mb-2"
          style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", letterSpacing: "-0.01em" }}
        >
          {product.name}
        </h3>
        <p
          className="text-[#041627]/50 text-xs leading-relaxed mb-4 flex-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-4">
          <Stars n={product.rating} />
          <span className="text-[11px] text-[#041627]/35" style={{ fontFamily: "var(--font-ui)" }}>
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mb-4">
          <span
            className="font-black text-[#041627]"
            style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", letterSpacing: "-0.02em" }}
          >
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span
              className="text-xs text-[#041627]/35 line-through mb-0.5"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className="text-[11px] text-[#041627]/35 mb-0.5" style={{ fontFamily: "var(--font-ui)" }}>
            {product.unit}
          </span>
        </div>

        {/* CTA */}
        <Link
          to="/contact"
          className="flex items-center justify-center gap-2 py-3 text-xs font-bold tracking-wider transition-all"
          style={{
            background: product.inStock ? "linear-gradient(135deg,#F0A20E 0%,#FFB830 100%)" : "#e2e8f0",
            color: product.inStock ? "#041627" : "#94a3b8",
            fontFamily: "var(--font-ui)",
            letterSpacing: "0.06em",
            pointerEvents: product.inStock ? "auto" : "none",
          }}
        >
          {product.inStock ? (
            <><ShoppingCart size={13} /> ENQUIRE TO ORDER</>
          ) : (
            "OUT OF STOCK"
          )}
        </Link>
      </div>
    </motion.div>
  );
}

export function StorePage() {
  const [active, setActive] = useState("All");

  const visible = active === "All" ? products : products.filter(p => p.tag === active);

  return (
    <PageLayout>
      {/* ── Hero ── */}
      <div className="pt-20 relative overflow-hidden" style={{ background: "#041627" }}>
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 80% at 20% 50%, rgba(240,162,14,0.07) 0%, transparent 65%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
              >
                IZY Store
              </span>
            </div>
            <h1
              className="text-white mb-5"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem,5vw,4rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              Energy & Tech Products
            </h1>
            <p className="text-white/45 max-w-xl text-base leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Quality-guaranteed solar panels, inverters, batteries, CCTV kits and smart home devices — sourced, tested and backed by IZY's engineers.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Category filter ── */}
      <div className="sticky top-20 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-2">
          <Filter size={13} className="text-gray-400 mr-1 flex-shrink-0" />
          {ALL_CATS.map((cat) => {
            const Icon = CAT_ICONS[cat] ?? Filter;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold tracking-wide transition-all"
                style={{
                  fontFamily: "var(--font-ui)",
                  background: active === cat ? "#041627" : "#f8fafc",
                  color: active === cat ? "#F0A20E" : "#64748b",
                  border: `1px solid ${active === cat ? "#041627" : "#e2e8f0"}`,
                }}
              >
                <Icon size={11} />
                {cat}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-gray-400" style={{ fontFamily: "var(--font-ui)" }}>
            {visible.length} product{visible.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Product grid ── */}
      <div className="py-16" style={{ background: "#f5f6f8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="sync">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Installation note ── */}
      <div className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Tag,
                title: "Genuine Products",
                body: "Every item is sourced directly from verified manufacturers and carries full warranty documentation.",
              },
              {
                icon: Zap,
                title: "Installation Available",
                body: "Add professional installation to any product enquiry. Our certified engineers cover all 36 states.",
              },
              {
                icon: Shield,
                title: "After-Sales Support",
                body: "2-year workmanship warranty on all IZY installations. Emergency support available 24/7.",
              },
            ].map(({ icon: Icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-5 p-6 border border-gray-100"
              >
                <div
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(240,162,14,0.1)" }}
                >
                  <Icon size={18} style={{ color: "#F0A20E" }} />
                </div>
                <div>
                  <h3
                    className="text-[#041627] font-bold mb-1"
                    style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", letterSpacing: "-0.01em" }}
                  >
                    {title}
                  </h3>
                  <p className="text-[#041627]/50 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    {body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="py-16" style={{ background: "#041627" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2
              className="text-white mb-4"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.025em" }}
            >
              Need a custom order or bulk pricing?
            </h2>
            <p className="text-white/40 mb-7 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              Contact our team for volume discounts, custom system design and nationwide delivery.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-9 py-4 font-bold text-[#041627] text-sm tracking-wider hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#F0A20E 0%,#FFB830 100%)", fontFamily: "var(--font-ui)", letterSpacing: "0.08em" }}
            >
              CONTACT OUR TEAM <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
