'use client';

import dynamic from 'next/dynamic';

// Import the entire React app with SSR disabled — it uses browser APIs
const ReactApp = dynamic(() => import('../src/app/ReactAppWrapper'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#041627' }}>
      <div style={{ color: '#ffc425', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Loading Izy Tech Services...</div>
    </div>
  ),
});

export default function HomePage() {
  return <ReactApp />;
}
