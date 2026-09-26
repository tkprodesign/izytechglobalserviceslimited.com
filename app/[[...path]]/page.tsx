'use client';

import dynamic from 'next/dynamic';

// Every path on the site is handled by the client-side React app
// (react-router). This catch-all page passes the URL through untouched, so
// /projects/:slug, /admin/invoices, /dev/dashboard etc. all work without
// per-route files.
const ReactApp = dynamic(() => import('../../src/app/ReactAppWrapper'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#041627' }}>
      <div style={{ color: '#ffc425', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Loading Izy Tech Services...</div>
    </div>
  ),
});

export default function CatchAllPage() {
  return <ReactApp />;
}