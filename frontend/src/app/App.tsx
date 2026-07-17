import { Routes, Route, Navigate } from "react-router";
import "../styles/fonts.css";
import "../styles/micro.css";

// Public site
import { Navbar } from "./sections/Navbar";
import { Hero } from "./sections/Hero";
import { Marquee } from "./sections/Marquee";
import { Services } from "./sections/Services";
import { Statement } from "./sections/Statement";
import { About } from "./sections/About";
import { Projects } from "./sections/Projects";
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
import { ProtectedRoute } from "./admin/ProtectedRoute";

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
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route path="/" element={<PublicSite />} />

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

      {/* Developer-only */}
      <Route path="/dev/dashboard" element={
        <ProtectedRoute requiredRole="developer"><DevSystemPage /></ProtectedRoute>
      } />
      <Route path="/dev/logs" element={
        <ProtectedRoute requiredRole="developer"><DevSystemPage /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/dev" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
