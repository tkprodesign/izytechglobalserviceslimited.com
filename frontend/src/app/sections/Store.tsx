import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { Sun, Zap, Shield, Home, ArrowRight, ShoppingCart, Star, CheckCircle } from "lucide-react";
import { useCart } from "../contexts/CartContext";

const featured = [
  {
    id: 1,
    name: "400W Monocrystalline Solar Panel",
    tag: "Solar",
    icon: Sun,
    color: "#F0A20E",
    badge: "BESTSELLER",
    rating: 5,
    reviews: 48,
    unit: "per panel",
    category: "Solar",
    description: "High-efficiency mono panel with 25-year performance warranty.",
  },
  {
    id: 3,
    name: "5kVA Hybrid Solar Inverter",
    tag: "Inverters",
    icon: Zap,
    color: "#3B82F6",
    badge: "SALE",
    rating: 5,
    reviews: 33,
    unit: "per unit",
    category: "Inverters",
    description: "All-in-one hybrid inverter with built-in MPPT charge controller.",
  },
  {
    id: 5,
    name: "200Ah Lithium LiFePO4 Battery",
    tag: "Batteries",
    icon: Zap,
    color: "#10B981",
    badge: "NEW",
    rating: 5,
    reviews: 19,
    unit: "per unit",
    category: "Batteries",
    description: "Lithium iron phosphate battery with 6,000+ cycle life.",
  },
  {
    id: 7,
    name: "4-Channel 4K CCTV Kit",
    tag: "Security",
    icon: Shield,
    color: "#EF4444",
    badge: "POPULAR",
    rating: 5,
    reviews: 55,
    unit: "per kit",
    category: "Security",
    description: "Complete kit with 4× 4K outdoor cameras, NVR and 1TB HDD.",
  },
  {
    id: 9,
    name: "Smart Home Starter Pack",
    tag: "Smart Home",
    icon: Home,
    color: "#8B5CF6",
    badge: "NEW",
    rating: 5,
    reviews: 14,
    unit: "per pack",
    category: "Smart Home",
    description: "4 smart switches + Zigbee hub + app control.",
  },
  {
    id: 12,
    name: "63A Automatic Transfer Switch",
    tag: "Electrical",
    icon: Zap,
    color: "#F59E0B",
    rating: 5,
    reviews: 29,
    unit: "per unit",
    category: "Electrical",
    description: "Automatic changeover switch for mains and generator power.",
  },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={10} fill={i < n ? "#F0A20E" : "transparent"} style={{ color: i < n ? "#F0A20E" : "#d1d5db" }} />
      ))}
    </div>
  );
}

export function Store() {
  const { add, items } = useCart();
  const navigate = useNavigate();

  return (
    <section id="store" className="py-28" style={{ background: "#f5f6f8" }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
              >
                IZY Store
              </span>
            </div>
            <h2
              className="text-[#041627]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem,4vw,3rem)",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
              }}
            >
              Shop Energy &<br className="hidden lg:block" /> Tech Products
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p
              className="text-[#64748b] text-sm leading-relaxed max-w-xs"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Quality-tested solar, inverters, CCTV, smart home and electrical products — backed by IZY's engineers.
            </p>
            <Link
              to="/store"
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 font-bold text-xs tracking-wider transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#F0A20E 0%,#FFB830 100%)",
                color: "#041627",
                fontFamily: "var(--font-ui)",
                letterSpacing: "0.07em",
              }}
            >
              VIEW ALL PRODUCTS <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((product, i) => {
            const Icon = product.icon;
            const inBasket = items.some((it) => it.id === product.id);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="bg-white border border-gray-100 group hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Visual */}
                <div
                  className="relative flex items-center justify-center"
                  style={{ height: 160, background: `${product.color}0d` }}
                >
                  {product.badge && (
                    <span
                      className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold tracking-widest text-white"
                      style={{
                        background:
                          product.badge === "SALE"
                            ? "#EF4444"
                            : product.badge === "NEW"
                            ? "#10B981"
                            : "#041627",
                        fontFamily: "var(--font-ui)",
                      }}
                    >
                      {product.badge}
                    </span>
                  )}
                  <Icon size={48} style={{ color: `${product.color}55` }} strokeWidth={1} />
                  <span
                    className="absolute bottom-3 right-3 text-[10px] font-bold tracking-wide px-2.5 py-1"
                    style={{ background: `${product.color}18`, color: product.color, fontFamily: "var(--font-ui)" }}
                  >
                    {product.tag}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-1">
                  <h3
                    className="text-[#041627] font-bold leading-snug mb-1.5"
                    style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", letterSpacing: "-0.01em" }}
                  >
                    {product.name}
                  </h3>

                  <p className="text-[#041627]/45 text-xs leading-relaxed mb-3 flex-1" style={{ fontFamily: "var(--font-body)" }}>
                    {product.description}
                  </p>

                  <div className="flex items-center gap-1.5 mb-4">
                    <Stars n={product.rating} />
                    <span className="text-[11px] text-[#041627]/35" style={{ fontFamily: "var(--font-ui)" }}>
                      ({product.reviews})
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      add({
                        id: product.id,
                        name: product.name,
                        category: product.category,
                        tag: product.tag,
                        description: product.description,
                        unit: product.unit,
                      })
                    }
                    className="flex items-center justify-center gap-2 py-2.5 text-xs font-bold tracking-wider transition-all"
                    style={{
                      background: inBasket
                        ? "rgba(16,185,129,0.1)"
                        : "linear-gradient(135deg,#F0A20E 0%,#FFB830 100%)",
                      color: inBasket ? "#10B981" : "#041627",
                      border: inBasket ? "1px solid rgba(16,185,129,0.3)" : "none",
                      fontFamily: "var(--font-ui)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {inBasket ? (
                      <><CheckCircle size={12} /> ADDED TO ENQUIRY</>
                    ) : (
                      <><ShoppingCart size={12} /> ADD TO ENQUIRY</>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 p-8 border border-dashed border-[#F0A20E]/30 flex flex-col sm:flex-row items-center justify-between gap-5"
          style={{ background: "rgba(240,162,14,0.04)" }}
        >
          <div>
            <p className="font-bold text-[#041627] mb-0.5" style={{ fontFamily: "var(--font-display)", fontSize: "1rem" }}>
              12 product categories · Nationwide delivery · Installation available
            </p>
            <p className="text-[#041627]/45 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              All products are genuine, tested and come with full warranty documentation.
            </p>
          </div>
          <Link
            to="/store"
            className="flex-shrink-0 flex items-center gap-2 px-8 py-3.5 font-bold text-xs tracking-wider border-2 border-[#041627] text-[#041627] hover:bg-[#041627] hover:text-white transition-all"
            style={{ fontFamily: "var(--font-ui)", letterSpacing: "0.07em" }}
          >
            BROWSE ALL PRODUCTS <ArrowRight size={13} />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
