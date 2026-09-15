import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactAppWrapper from './app/ReactAppWrapper';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReactAppWrapper />
  </React.StrictMode>,
);