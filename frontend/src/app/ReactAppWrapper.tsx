'use client';

import { BrowserRouter } from 'react-router';
import App from './App';

export default function ReactAppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
