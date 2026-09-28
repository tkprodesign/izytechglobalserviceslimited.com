import { Routes, Route, Navigate, useLocation } from "react-router";
import { lazy, Suspense, useEffect, useRef } from "react";
import "../styles/fonts.css";
import "../styles/micro.css";
import { getToken, getUser, loginPathForRoute } from "../lib/auth";

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
          const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
        } else if (retries > 0) {
          setTimeout(() => attempt(retries - 1), 60);
        }
      };
      setTimeout(() => attempt(5), 60);
    } else if (pathnameChanged) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }, [location]);

  return null;
}

/**
 * Re-check the JWT while a protected page is open. ProtectedRoute handles
 * initial navigation and refreshes; this guard also handles a session expiring
 * while the user remains on an admin or developer screen.
 */
function AuthSessionGuard() {
  const location = useLocation();

  useEffect(() => {
    const isProtectedArea =
      (location.pathname.startsWith("/admin") || location.pathname.startsWith("/dev")) &&
      !location.pathname.endsWith("/login");
    if (!isProtectedArea) {
      return;
    }

    const checkSession = () => {
      if (getToken() && !getUser()) {
        window.location.replace(loginPathForRoute(location.pathname));
      }
    };

    checkSession();
    const interval = window.setInterval(checkSession, 30_000);
    window.addEventListener("storage", checkSession);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", checkSession);
    };
  }, [location.pathname]);

  return null;
}

// Public site
import { Navbar } from "./sections/Navbar";
import { Hero } from "./sections/Hero";
import { TrustStrip } from "./sections/TrustStrip";
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
import { SeoManager } from "./components/SeoManager";

// Route-level pages are lazy-loaded so public visitors do not download
// admin, developer, invoice, analytics and other workspace code up front.
import { ProtectedRoute } from "./admin/ProtectedRoute";
import { Store } from "./sections/Store";
import { CartProvider } from "./contexts/CartContext";
import { WhatsAppFloatingButton } from "./components/WhatsAppFloatingButton";
import { CookieConsent } from "./components/CookieConsent";

const LoginPage = lazy(() => import("./admin/LoginPage").then(m => ({ default: m.LoginPage })));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const ContactsPage = lazy(() => import("./admin/ContactsPage").then(m => ({ default: m.ContactsPage })));
const QuotesPage = lazy(() => import("./admin/QuotesPage").then(m => ({ default: m.QuotesPage })));
const DevSystemPage = lazy(() => import("./admin/DevSystemPage").then(m => ({ default: m.DevSystemPage })));
const DevDashboard = lazy(() => import("./admin/DevDashboard").then(m => ({ default: m.DevDashboard })));
const ServicesContentPage = lazy(() => import("./admin/ServicesContentPage").then(m => ({ default: m.ServicesContentPage })));
const EmailPage = lazy(() => import("./admin/EmailPage").then(m => ({ default: m.EmailPage })));
const SocialsPage = lazy(() => import("./admin/SocialsPage").then(m => ({ default: m.SocialsPage })));
const StoreProductsPage = lazy(() => import("./admin/StoreProductsPage").then(m => ({ default: m.StoreProductsPage })));
const StoreEnquiriesPage = lazy(() => import("./admin/StoreEnquiriesPage").then(m => ({ default: m.StoreEnquiriesPage })));
const MilestonesPage = lazy(() => import("./admin/MilestonesPage").then(m => ({ default: m.MilestonesPage })));
const FounderPage = lazy(() => import("./admin/FounderPage").then(m => ({ default: m.FounderPage })));
const ProjectsManagerPage = lazy(() => import("./admin/ProjectsManagerPage").then(m => ({ default: m.ProjectsManagerPage })));
const TestimonialsManagerPage = lazy(() => import("./admin/TestimonialsManagerPage").then(m => ({ default: m.TestimonialsManagerPage })));
const SiteAssessmentsPage = lazy(() => import("./admin/SiteAssessmentsPage").then(m => ({ default: m.SiteAssessmentsPage })));
const CompanyContactPage = lazy(() => import("./admin/CompanyContactPage").then(m => ({ default: m.CompanyContactPage })));
const InvoicesPage = lazy(() => import("./admin/InvoicesPage").then(m => ({ default: m.InvoicesPage })));
const SiteAnalyticsPage = lazy(() => import("./admin/SiteAnalyticsPage").then(m => ({ default: m.SiteAnalyticsPage })));
const CustomPdfPage = lazy(() => import("./admin/CustomPdfPage").then(m => ({ default: m.CustomPdfPage })));

const AboutPage = lazy(() => import("./pages/AboutPage").then(m => ({ default: m.AboutPage })));
const ServicesPage = lazy(() => import("./pages/ServicesPage").then(m => ({ default: m.ServicesPage })));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage").then(m => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage").then(m => ({ default: m.ProjectDetailPage })));
const TestimonialsPage = lazy(() => import("./pages/TestimonialsPage").then(m => ({ default: m.TestimonialsPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then(m => ({ default: m.ContactPage })));
const StorePage = lazy(() => import("./pages/StorePage").then(m => ({ default: m.StorePage })));
const StoreEnquiryPage = lazy(() => import("./pages/StoreEnquiryPage").then(m => ({ default: m.StoreEnquiryPage })));
const AssessmentPaymentPage = lazy(() => import("./pages/AssessmentPaymentPage").then(m => ({ default: m.AssessmentPaymentPage })));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage").then(m => ({ default: m.CookiePolicyPage })));

function RouteLoading() {
  return (
    <div className="flex min-h-[45vh] items-center justify-center bg-[#f7f8fa]" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm font-medium text-[#5a6a82]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1d70c9]/25 border-t-[#1d70c9]" />
        Loading…
      </div>
    </div>
  );
}

function PublicSite() {
  return (
    <div className="custom-cursor-active min-h-screen w-full overflow-x-hidden">
      <CustomCursor />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
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

function PublicFloatingActions() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/admin") || pathname.startsWith("/dev")) {
    return null;
  }

  return <WhatsAppFloatingButton />;
}

type SmartsuppQueue = ((...args: unknown[]) => void) & { _: unknown[][] };
const smartsuppDisplayStyles = new WeakMap<HTMLElement, { value: string; priority: string }>();
const smartsuppElements = '#chat-application-iframe, #smartsupp-widget-container, #widgetPopupFrame, #widgetButtonFrame';

function setSmartsuppHidden(hidden: boolean) {
  document.querySelectorAll<HTMLElement>(smartsuppElements).forEach(element => {
    if (hidden) {
      if (!smartsuppDisplayStyles.has(element)) {
        smartsuppDisplayStyles.set(element, {
          value: element.style.getPropertyValue('display'),
          priority: element.style.getPropertyPriority('display'),
        });
      }
      element.style.setProperty('display', 'none', 'important');
      return;
    }

    const previous = smartsuppDisplayStyles.get(element);
    if (previous?.value) {
      element.style.setProperty('display', previous.value, previous.priority);
    } else {
      element.style.removeProperty('display');
    }
    smartsuppDisplayStyles.delete(element);
  });
}

function SmartsuppWidget() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isPanel = pathname.startsWith('/admin') || pathname.startsWith('/dev');

    if (isPanel) {
      setSmartsuppHidden(true);
      const observer = new MutationObserver(() => setSmartsuppHidden(true));
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }

    setSmartsuppHidden(false);

    const chatWindow = window as Window & {
      _smartsupp?: Record<string, unknown>;
      smartsupp?: SmartsuppQueue;
    };
    chatWindow._smartsupp = {
      ...chatWindow._smartsupp,
      key: '7b17927f5d4df272347f716050aeead77bfd9b6d',
      color: '#F0A20E',
      ratingEnabled: true,
      cookieDomain: '.izytechglobalservices.com',
    };

    if (!chatWindow.smartsupp) {
      const queue = ((...args: unknown[]) => queue._.push(args)) as SmartsuppQueue;
      queue._ = [];
      chatWindow.smartsupp = queue;
    }

    const loadChat = () => {
      if (document.querySelector('script[data-smartsupp-loader]')) return;
      const script = document.createElement('script');
      script.async = true;
      script.dataset.smartsuppLoader = 'true';
      script.src = 'https://www.smartsuppchat.com/loader.js?';
      document.head.appendChild(script);
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const interactionEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart'];
    interactionEvents.forEach(event => window.addEventListener(event, loadChat, { once: true, passive: true }));

    const idleId = idleWindow.requestIdleCallback
      ? idleWindow.requestIdleCallback(loadChat, { timeout: 3500 })
      : window.setTimeout(loadChat, 3000);

    return () => {
      interactionEvents.forEach(event => window.removeEventListener(event, loadChat));
      if (idleWindow.cancelIdleCallback && idleWindow.requestIdleCallback) idleWindow.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <CartProvider>
    <NavigationScroll />
    <AuthSessionGuard />
    <SeoManager />
    <SmartsuppWidget />
    <Suspense fallback={<RouteLoading />}>
    <Routes>
      {/* Public site */}
      <Route path="/" element={<PublicSite />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:slug" element={<ProjectDetailPage />} />
      <Route path="/testimonials" element={<TestimonialsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/assessment/:token" element={<AssessmentPaymentPage />} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/store/enquire" element={<StoreEnquiryPage />} />
      <Route path="/cookies" element={<CookiePolicyPage />} />

      {/* Auth */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/dev/login" element={<LoginPage />} />

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
      <Route path="/admin/assessments" element={
        <ProtectedRoute><SiteAssessmentsPage /></ProtectedRoute>
      } />
      <Route path="/admin/socials" element={
        <ProtectedRoute><SocialsPage /></ProtectedRoute>
      } />
      <Route path="/admin/company-contact" element={
        <ProtectedRoute><CompanyContactPage /></ProtectedRoute>
      } />

      {/* Store management — both roles */}
      <Route path="/admin/products" element={
        <ProtectedRoute><StoreProductsPage /></ProtectedRoute>
      } />
      <Route path="/admin/enquiries" element={
        <ProtectedRoute><StoreEnquiriesPage /></ProtectedRoute>
      } />

      {/* Projects management — both roles */}
      <Route path="/admin/projects" element={
        <ProtectedRoute><ProjectsManagerPage /></ProtectedRoute>
      } />
      <Route path="/admin/testimonials" element={
        <ProtectedRoute><TestimonialsManagerPage /></ProtectedRoute>
      } />
      <Route path="/admin/invoices" element={
        <ProtectedRoute><InvoicesPage /></ProtectedRoute>
      } />
      <Route path="/admin/email" element={
        <ProtectedRoute><EmailPage /></ProtectedRoute>
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
        <ProtectedRoute requiredRole="developer"><DevDashboard /></ProtectedRoute>
      } />
      <Route path="/dev/analytics" element={
        <ProtectedRoute requiredRole="developer"><SiteAnalyticsPage /></ProtectedRoute>
      } />
      <Route path="/dev/logs" element={
        <ProtectedRoute requiredRole="developer"><DevSystemPage /></ProtectedRoute>
      } />
      <Route path="/dev/services" element={
        <ProtectedRoute requiredRole="developer"><ServicesContentPage /></ProtectedRoute>
      } />
      <Route path="/dev/company-contact" element={
        <ProtectedRoute requiredRole="developer"><CompanyContactPage /></ProtectedRoute>
      } />
      <Route path="/dev/email" element={
        <ProtectedRoute requiredRole="developer"><EmailPage /></ProtectedRoute>
      } />
      <Route path="/dev/documents" element={
        <ProtectedRoute requiredRole="developer"><CustomPdfPage /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/dev" element={<Navigate to="/dev/login" replace />} />
    </Routes>
    </Suspense>
    <PublicFloatingActions />
    <CookieConsent />
    </CartProvider>
  );
}
