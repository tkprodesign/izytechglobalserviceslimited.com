import { Navbar } from "../sections/Navbar";
import { Footer } from "../sections/Footer";
import { CustomCursor } from "./CustomCursor";
import { ScrollProgress } from "./ScrollProgress";

interface Props {
  children: React.ReactNode;
}

export function PageLayout({ children }: Props) {
  return (
    <div className="custom-cursor-active min-h-screen w-full overflow-x-hidden">
      <CustomCursor />
      <ScrollProgress />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
