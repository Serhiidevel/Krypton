import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PortfolioProvider } from './context/PortfolioContext';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <PortfolioProvider>
      <App />
    </PortfolioProvider>
  </StrictMode>,
);
