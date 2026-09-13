import type { Metadata } from 'next';
import '../src/styles/index.css';

export const metadata: Metadata = {
  title: 'Izy Tech Services — Power The Future-Ready Solutions, Today',
  description:
    'Technology and energy solutions for homes, businesses and industries across Nigeria — solar energy systems, industrial wiring, smart home automation, CCTV & security, IT & tech services and general electrical works.',
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body style={{ height: '100%', margin: 0 }}>
        <div id="root" style={{ height: '100%' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
