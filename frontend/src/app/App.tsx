import { Routes, Route, Navigate, useLocation } from "react-router";
import { useEffect, useRef } from "react";
import "../styles/fonts.css";
import "../styles/micro.css";

const NAVBAR_H = 80; // matches h-20 in Navbar

/**
 * Handles all scroll behaviour for route changes:
 * - Hash present  → smooth-scroll to the target element (offset for fixed navbar)
 * - Hash absent, pathname changed → smooth-scroll to top
 * - Only search params changed (same path, no hash) → do nothing (form handles it)
 */
function NavigationScroll() {
  const location = useLocation();
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    const { pathname, hash } = location;
    const pathnameChanged = pathname !== prevPathname.current;
    prevPathname.current = pathname;

    if (hash) {
      // Give React one frame to finish rendering the destination page
      const id = hash.slice(1);
      const attempt = (retries: number) => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_H;
          window.scrollTo({ top, behavior: "smooth" });
        } else if (retries > 0) {
          setTimeout(() => attempt(retries - 1), 60);
        }
      };
      setTimeout(() => attempt(5), 60);
    } else if (pathnameChanged) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  return null;
}

// Public site
import { Navbar } from "./sections/Navbar";
import { Hero } from "./sections/Hero";
import { Marquee } from "./sections/Marquee";
import { Services } from "./sections/Services";
import { Statement } from "./sections/Statement";
import { About } from "./sections/About";
import { Projects } from "./sections/Projects";
import { VideoReel } from "./sections/VideoReel";
import { Testimonials } from "./sections/Testimonials";
import { Contact } from "./sections/Contact";
import { Footer } from "./sections/Footer";
import { CustomCursor } from "./components/CustomCursor";
import { ScrollProgress } from "./components/ScrollProgress";

// Admin panel
import { LoginPage } from "./admin/LoginPage";
import { AdminDashboard } from "./admin/AdminDashboard";
import { ContactsPage } from "./admin/ContactsPage";
import { QuotesPage } from "./admin/QuotesPage";
import { DevSystemPage } from "./admin/DevSystemPage";
import { EmailPage } from "./admin/EmailPage";
import { SocialsPage } from "./admin/SocialsPage";
import { ProtectedRoute } from "./admin/ProtectedRoute";
import { StoreProductsPage } from "./admin/StoreProductsPage";
import { StoreEnquiriesPage } from "./admin/StoreEnquiriesPage";
import { MilestonesPage } from "./admin/MilestonesPage";
import { FounderPage } from "./admin/FounderPage";
import { AboutPage } from "./pages/AboutPage";
import { ServicesPage } from "./pages/ServicesPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { TestimonialsPage } from "./pages/TestimonialsPage";
import { ContactPage } from "./pages/ContactPage";
import { StorePage } from "./pages/StorePage";
import { StoreEnquiryPage } from "./pages/StoreEnquiryPage";
import { Store } from "./sections/Store";
import { CartProvider } from "./contexts/CartContext";

function PublicSite() {
  return (
    <div className="custom-cursor-active min-h-screen w-full overflow-x-hidden">
      <CustomCursor />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Statement />
        <About />
        <Projects />
        <Store />
        <VideoReel />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
    <NavigationScroll />
    <Routes>
      {/* Public site */}
      <Route path="/" element={<PublicSite />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/testimonials" element={<TestimonialsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/store/enquire" element={<StoreEnquiryPage />} />

      {/* Auth */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Admin panel — both roles */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/contacts" element={
        <ProtectedRoute><ContactsPage /></ProtectedRoute>
      } />
      <Route path="/admin/quotes" element={
        <ProtectedRoute><QuotesPage /></ProtectedRoute>
      } />
      <Route path="/admin/socials" element={
        <ProtectedRoute><SocialsPage /></ProtectedRoute>
      } />

      {/* Store management — both roles */}
      <Route path="/admin/products" element={
        <ProtectedRoute><StoreProductsPage /></ProtectedRoute>
      } />
      <Route path="/admin/enquiries" element={
        <ProtectedRoute><StoreEnquiriesPage /></ProtectedRoute>
      } />

      {/* Company content — both roles */}
      <Route path="/admin/milestones" element={
        <ProtectedRoute><MilestonesPage /></ProtectedRoute>
      } />
      <Route path="/admin/founder" element={
        <ProtectedRoute><FounderPage /></ProtectedRoute>
      } />

      {/* Developer-only */}
      <Route path="/dev/dashboard" element={
        <ProtectedRoute requiredRole="developer"><DevSystemPage /></ProtectedRoute>
      } />
      <Route path="/dev/logs" element={
        <ProtectedRoute requiredRole="developer"><DevSystemPage /></ProtectedRoute>
      } />
      <Route path="/dev/email" element={
        <ProtectedRoute><EmailPage /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/dev" element={<Navigate to="/admin/login" replace />} />
    </Routes>
    </CartProvider>
  );
}
