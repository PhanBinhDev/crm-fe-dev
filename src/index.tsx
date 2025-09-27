import React from 'react';
import { createRoot } from 'react-dom/client';

import '@/styles/overwrite/antd/index.css';
import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
