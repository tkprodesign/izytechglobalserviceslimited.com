'use client';

import { BrowserRouter } from 'react-router';
import App from './App';

// Next.js serves the app at the root base path; Vite used BASE_URL too, so
// this keeps the router correct in both worlds.
const basename = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';

export default function ReactAppWrapper() {
  return (
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  );
}
