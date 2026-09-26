import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import '../src/styles/index.css';

export const metadata: Metadata = {
  title: 'Izy Tech Services — Power the Future, Future-Ready Solutions, Today.',
  description:
    'Technology and energy solutions for homes, businesses and industries across Nigeria — solar energy systems, industrial wiring, smart home automation, CCTV & security, IT & tech services and general electrical works.',
  robots: 'noindex, nofollow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body style={{ height: '100%', margin: 0 }}>
        {children}
        <Script id="smartsupp-chat" strategy="afterInteractive">
          {`var _smartsupp = _smartsupp || {};
_smartsupp.key = '7b17927f5d4df272347f716050aeead77bfd9b6d';
_smartsupp.color = '#F0A20E';
_smartsupp.ratingEnabled = true;
_smartsupp.cookieDomain = '.izytechglobalservices.com';
window.smartsupp || (function(d) {
  var s, c, o = smartsupp = function() { o._.push(arguments); };
  o._ = [];
  s = d.getElementsByTagName('script')[0];
  c = d.createElement('script');
  c.type = 'text/javascript';
  c.charset = 'utf-8';
  c.async = true;
  c.src = 'https://www.smartsuppchat.com/loader.js?';
  s.parentNode.insertBefore(c, s);
})(document);`}
        </Script>
      </body>
    </html>
  );
}